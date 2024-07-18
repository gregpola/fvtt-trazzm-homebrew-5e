/*
	Your blessed touch can heal wounds. You have a pool of healing power that replenishes when you take a long rest. With
	that pool, you can restore a total number of hit points equal to your paladin level × 5.

	As an action, you can touch a creature and draw power from the pool to restore a number of hit points to that creature,
	up to the maximum amount remaining in your pool.

	Alternatively, you can expend 5 hit points from your pool of healing to cure the target of one disease or neutralize
	one poison affecting it. You can cure multiple diseases and neutralize multiple poisons with a single use of Lay on Hands,
	expending hit points separately for each one.

	This feature has no effect on undead and constructs.
 */
const version = "11.3";
const optionName = "Lay on Hands";
const flagName = "lay-on-hands-uses";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
	let layOnHands = actor.items.find(i => i.name === optionName);
	let usesLeft = 0;
	let target = workflow.targets.first();

	if (args[0].macroPass === "preItemRoll") {
		// check valid target
		if (!target || ["undead", "construct"].some(type => (target.actor?.system.details.type?.value || "").toLowerCase().includes(type))) {
			console.error(`${optionName} - not a valid target`);
			ui.notifications.error(`${optionName} - not a valid target`);
			return false;
		}

		// check Lay on Hands uses available
		if (layOnHands) {
			usesLeft = layOnHands.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < 1) {
				console.error(`${optionName} - no uses left`);
				ui.notifications.error(`${optionName} - no uses left`);
				return false;
			}
			await actor.setFlag(_flagGroup, flagName, usesLeft);

		} else {
			console.error(`${optionName} - feature not found`);
			ui.notifications.error(`${optionName} - feature not found`);
			return false;
		}
	}
	else if (args[0].macroPass === "postActiveEffects") {
		usesLeft = layOnHands.system.uses.value;
		let flag = actor.getFlag(_flagGroup, flagName);
		if (flag) {
			usesLeft = flag;
			await actor.unsetFlag(_flagGroup, flagName);
		}

		// calculate the maximum heal possible
		const maxhp = Number(target.actor?.system.attributes.hp.max);
		const currenthp = Number(target.actor?.system.attributes.hp.value);
		const targetDamage = maxhp - currenthp;
		const maxHeal = Math.min(targetDamage, usesLeft);

		// build the target effects data
		let targetEffects = Array.from(target.actor.allApplicableEffects());
		
		// ask which type of healing
		new Dialog({
		  title: "Lay on Hands",
		  content: `<p>Which <strong>Action</strong> would you like to do? (${usesLeft} points remaining)</p>
			<p>If Heal, how many hp to heal? (target is off ${targetDamage})<input id="mqlohpoints" type="number" min="0" step="1.0" max="${maxHeal}"></input></p>`,
		  buttons: {
			heal: {
				label: "<p>Heal</p>",
				icon: '<img src = "icons/magic/life/cross-flared-green.webp" width="50" height="50"></>',
				callback: async (html) => {
					const pts = Math.clamped(Math.floor(Number(html.find('#mqlohpoints')[0].value)), 0, maxHeal);
					const damageRoll = await new Roll(`${pts}`).evaluate({ async: true });
					await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "healing", [target], damageRoll, {flavor: "Lay on Hands", itemCardId: args[0].itemCardId});
					await reduceUsage(layOnHands, pts - 1);// account for normal usage cost
				}
			},
			cureDisease: {
				label: "Cure Disease",
				icon: '<img src = "icons/skills/wounds/blood-cells-disease-green.webp" width="50" height="50"></>',
				callback: async (html) => {
					let effect = targetEffects.find( i=> i.name === "Diseased");
					if (effect) {
						await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: target.actor.uuid, effects: [effect.id] });
						await reduceUsage(layOnHands, 4);// account for normal usage cost
					}
					else {
						console.error(`${optionName} - target is not diseased`);
						await reduceUsage(layOnHands, -1);// account for normal usage cost
					}
				}
			},
			neutralizePoison: {
				label: "Neutralize Poison",
				icon: '<img src = "icons/skills/toxins/symbol-poison-drop-skull-green.webp" width="50" height="50"></>',
				callback: async (html) => {
					let effect = targetEffects.find( i=> i.name === "Poisoned");
					if (effect) {
						await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: target.actor.uuid, effects: [effect.id] });
						await reduceUsage(layOnHands, 4);// account for normal usage cost
					}
					else {
						console.error(`${optionName} - target is not diseased`);
						await reduceUsage(layOnHands, -1);// account for normal usage cost
					}
				}
			},
			abort: {
			  icon: '<i class="fas fa-cross"></i>',
			  label: "Cancel",
			  callback: () => { return; }
			},
		  },
		  default: "heal",
		}).render(true);
	}
	
} catch (err)  {
    console.error(`${optionName} : ${version}`, err);
}

async function reduceUsage(featureItem, cost){
	const newValue = featureItem.system.uses.value - cost;
	await featureItem.update({"system.uses.value": newValue});
}
