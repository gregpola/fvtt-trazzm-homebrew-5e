const version = "12.3.0";
const optionName = "Purple Worm Poison";
const _poisonedWeaponFlag = "poisoned-weapon";
const damageDice = "12d6";
const saveDC = 19;
const saveFlavor = `${CONFIG.DND5E.abilities["con"].label} DC${saveDC} ${optionName}`;

try {
	if (args[0].macroPass === "preItemRoll") {
		// find the actor's items that can be poisoned
		// must be piercing or slashing
		let weapons = actor.items.filter(i => i.type === `weapon` && (i.system.damage.parts[0][1] === `piercing` || i.system.damage.parts[0][1] === `slashing`));
		if (!weapons || weapons.length < 1) {
			ui.notifications.error(`${optionName} - no appropriate weapons available`);
			return false;
		}
	}
	else if (args[0].macroPass === "postActiveEffects") {
		await HomebrewMacros.applyPoisonToWeapon(actor, item);
	}
	else if (args[0].macroPass === "DamageBonus") {
		const targetToken = workflow.hitTargets.first();
		if (targetToken) {
			// poison only lasts one hit for most weapons, three for ammo
			let flag = actor.getFlag(_flagGroup, _poisonedWeaponFlag);
			if (flag && workflow.item._id === flag.itemId) {
				let apps = flag.applications;
				const itemName = flag.itemName;
				const itemId = flag.itemId;

				// check for expiration condition
				if (apps > 0) {
					apps -= 1;
					await actor.setFlag(_flagGroup, _poisonedWeaponFlag, {
						itemName: itemName,
						itemId: itemId,
						applications: apps
					});

					if (apps === 0) {
						await HomebrewMacros.removePoisonFromWeapon(actor);
						let effect = actor.effects.find(ef => ef.name === optionName);
						if (effect) {
							await MidiQOL.socket().executeAsGM("removeEffects", {
								actorUuid: actor.uuid,
								effects: [effect.id]
							});
						}
					}

					// request the saving throw
					const saveRoll = await targetToken.actor.rollAbilitySave("con", {flavor: saveFlavor, damageType: "poison"});

					if (saveRoll.total < saveDC) {
						return { damageRoll: `${damageDice}[poison]`, flavor: optionName };
					}
					else {
						return { damageRoll: `${damageDice}/2[poison]`, flavor: optionName };
					}
				}
			}
		}
	}
	else if (args[0] === "off") {
		await HomebrewMacros.removePoisonFromWeapon(actor);
	}

} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}
