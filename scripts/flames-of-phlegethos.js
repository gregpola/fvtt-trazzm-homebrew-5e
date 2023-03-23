/*
	You learn to call on hellfire to serve your commands. You gain the following benefits:

	* Increase your Intelligence or Charisma score by 1, to a maximum of 20.
	* When you roll fire damage for a spell you cast, you can reroll any roll of 1 on the fire damage dice, but you must use the new roll, even if it is another 1.
	* Whenever you cast a spell that deals fire damage, you can cause flames to wreathe you until the end of your next turn. The flames don’t harm you or your possessions, and they shed bright light out to 30 feet and dim light for an additional 30 feet. While the flames are present, any creature within 5 feet of you that hits you with a melee attack takes 1d4 fire damage.
*/
// ItemMacro.Compendium.fvtt-trazzm-homebrew-5e.homebrew-feats.i8gD90MZ2Zl2Naio
const version = "10.0.0";
const optionName = "Flames of Phlegethos";

try {
	const lastArg = args[args.length - 1];

	if (args[0].macroPass === "DamageBonus") {
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		
		// make sure the action is a spell that does fire damage
		if (!lastArg.item.system.damage.parts.map(i=>i[1]).includes("fire")
			|| !["msak", "rsak", "save"].includes(lastArg.itemData.system.actionType)) {
			return;
		}
		
		// ask if they want to use the flames
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: optionName,
				content: `<p>Wreathe yourself in flames?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/magic/fire/elemental-fire-flying.webp" width="50" height="50"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
						label: "<p>No</p>",
						callback: () => { resolve(false) }
					}
				},
				default: "two"
			}).render(true);
		});

		let useFeature = await dialog;
		if (useFeature) {
			await applyFlamesEffect(actorToken);
		}
		
		// handle damage re-roll of 1's
		let damageBonus = 0;
		for (let i = 0; i < lastArg.workflow.damageRoll.terms.length; i++) {
			if (lastArg.workflow.damageRoll.terms[i] instanceof Die) {
				if (lastArg.workflow.damageRoll.terms[i].options.flavor === "fire") {
					for (let r of lastArg.workflow.damageRoll.terms[i].results) {
						if (r.result === 1) {
							let newRoll = (new Roll(`1d${lastArg.workflow.damageRoll.terms[i].faces}`).evaluate({ async: false }));
							await game.dice3d?.showForRoll(newRoll);
							
							if (r.result != newRoll.result) {
								let bonus = newRoll.result - r.result;
								damageBonus = damageBonus + (lastArg.workflow.isCritical ? 2 * bonus : bonus);
							}
						}
					}
				}
			}
		}
		
		if (damageBonus > 0) {
			return {damageRoll: `${damageBonus}[fire]`, flavor: `${optionName} Damage`};
		}
		
	}
	else if (args[0].macroPass === "isDamaged") {
	    const actor = lastArg.options?.actor;
		const token = lastArg.options?.token;
		const target = fromUuidSync(lastArg.tokenUuid);

		// make sure the action is eligible
		if (!["msak", "mwak"].includes(lastArg.itemData.system.actionType)) {
			return;
		}
		
		// make sure the attacker is within 5 feet
		if (MidiQOL.getDistance(token, target) > 5)
			return;
		
		if (!actor || !token || !target) return;
		const damageRoll = await new Roll("1d4").roll({async: true});
		await game.dice3d?.showForRoll(damageRoll);
		await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "fire", [target], damageRoll, {itemCardId: "new", itemData: actor.items.getName(optionName)});
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyFlamesEffect(actorToken) {
	const effectData = {
		label: `${optionName} wreathed`,
		icon: "icons/magic/fire/elemental-fire-flying.webp",
		origin: actorToken.actor.uuid,
		changes: [
			{
				key: 'flags.midi-qol.onUseMacroName',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: "ItemMacro.Compendium.fvtt-trazzm-homebrew-5e.homebrew-feats.i8gD90MZ2Zl2Naio, isDamaged",
				priority: 19
			},
			{
				"key": "macro.tokenMagic",
				"mode": 0,
				"value": "pure-fire-aura-2",
				"priority": 20
			},
			{
				key: 'ATL.light.dim',
				mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
				value: "60",
				priority: 21
			},
			{
				key: 'ATL.light.bright',
				mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
				value: "30",
				priority: 22
			},
			{
				key: 'ATL.light.alpha',
				mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
				value: "0.4",
				priority: 23
			},
			{
			  "key": "ATL.light.color",
			  "mode": 5,
			  "value": "#f98026",
			  "priority": 24
			},
			{
			  "key": "ATL.light.animation",
			  "mode": 5,
			  "value": "{\"type\": \"torch\",\"speed\": 1,\"intensity\": 1}",
			  "priority": 25
			}
		],
		flags: {
			dae: {
				selfTarget: false,
				stackable: "none",
				durationExpression: "",
				macroRepeat: "none",
				specialDuration: ["turnEndSource"],
				transfer: false
			}
		},
		disabled: false
	};

	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actorToken.actor.uuid, effects: [effectData] });
}
