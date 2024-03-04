const version = "11.0";
const optionName = "Absorb Elements";
const elements = { acid: "acid", cold: "cold", fire: "fire", lightning: "lightning", thunder: "thunder" };

try {
	if (args[0].macroPass === "postActiveEffects") {
		let msgHistory = game.messages.reduce((list, message) => {
			let damage = message.flags["midi-qol"]?.damageDetail;
			if (damage) list.push(damage);
			return list;
		}, []);

		let triggeringDamage = msgHistory[msgHistory.length - 1];
		let damageType;
		if (triggeringDamage && triggeringDamage.length > 0) {
			damageType = elements[triggeringDamage[0].type.toLowerCase()];
		}

		if (damageType) {
			// add damage resistance
			let effectDataResistance = {
				name: optionName + "- Damage Resistance",
				icon: workflow.item.img,
				origin: workflow.item.uuid,
				changes: [
					{ key: `system.traits.dr.value`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: `${damageType}`, priority: 20 }
				],
				disabled: false,
				flags: { dae: { specialDuration: ["turnStartSource"] } },
			};
			await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectDataResistance] });

			// add weapon daamage bonus effect
			const spellLevel = workflow.castData.castLevel;
			let effectDataAttack = {
				name: optionName + "- Damage Bonus",
				icon: workflow.item.img,
				origin: workflow.item.uuid,
				changes: [
					{ key: `system.bonuses.mwak.damage`, mode: 2, value: `${spellLevel}d6[${damageType}]`, priority: 20 },
					{ key: `system.bonuses.msak.damage`, mode: 2, value: `${spellLevel}d6[${damageType}]`, priority: 21 }
				],
				disabled: false,
				flags: { dae: { specialDuration: ["1Hit", "turnEndSource"] } },
			};
			await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectDataAttack] });
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}


/*
	Reaction condition:

	reaction === 'isDamaged' &&

	workflow.damageDetail.some(d => ['acid', 'cold', 'fire', 'lightning', 'thunder'].includes(d.type.toLowerCase())) || ['acid', 'cold', 'fire', 'lightning', 'thunder'].some(dt => workflow.item.formula.toLowerCase().includes(dt)) || ['acid', 'cold', 'fire', 'lightning', 'thunder'].some(dt => workflow.item.damage.versatile.toLowerCase().includes(dt))
 */
