/*
	You gain the ability to turn death into magical flames that can heal or incinerate. When a Small or larger creature dies within 30 feet of you or your wildfire spirit, a harmless spectral flame springs forth in the dead creature’s space and flickers there for 1 minute. When a creature you can see enters that space, you can use your reaction to extinguish the spectral flame there and either heal the creature or deal fire damage to it. The healing or damage equals 2d10 + your Wisdom modifier.

	You can use this reaction a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest.
*/
const version = "10.0.0";
const optionName = "Cauterizing Flames";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0].macroPass === "postActiveEffects") {
		// Make sure there is a target
		if(lastArg.targets.length === 0) 
			return ui.notifications.warn(`Please select a target.`);
		
		const targetActor = lastArg.targets[0].actor;
		const targetToken = game.canvas.tokens.get(lastArg.targets[0].id);

		// ask which option to use
		new Dialog({
			// localize this text
			title: `${optionName}`,
			content: `<p>Do you want to damage or heal the target?</p>`,
			buttons: {
				damage: {
					icon: '<p> </p><img src = "icons/magic/fire/beam-jet-stream-yellow.webp" width="30" height="30"></>',
					label: "<p>Damage</p>",
					callback: async(html) => {
						const damageType = "fire";						
						let fireDamage = new Roll(`2d10`).evaluate({ async: false });
						await game.dice3d?.showForRoll(fireDamage);
						new MidiQOL.DamageOnlyWorkflow(actor, actorToken, fireDamage.total + actor.system.abilities.wis.mod, damageType, [targetToken], fireDamage, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemCardId: lastArg.itemCardId, useOther: false });
					}
				},
				heal: {
					icon: '<p> </p><img src = "icons/magic/life/cross-worn-green.webp" width="30" height="30"></>',
					label: "<p>Heal</p>",
					callback: async(html) => {
						const healingType = "healing";						
						let healDamage = new Roll(`2d10`).evaluate({ async: false });
						await game.dice3d?.showForRoll(healDamage);
						new MidiQOL.DamageOnlyWorkflow(actor, actorToken, healDamage.total + actor.system.abilities.wis.mod, healingType, [targetToken], healDamage, { flavor: `(${CONFIG.DND5E.healingTypes[healingType]})`, itemCardId: lastArg.itemCardId, useOther: false });
					}
				},
				cancel: {
					icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
					label: "<p>Cancel</p>",
					callback: () => { return; }
				}
			},
			default: "damage"
		}).render(true);
		
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
