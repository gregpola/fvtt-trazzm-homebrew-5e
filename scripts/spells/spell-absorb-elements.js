const version = "10.0.0";
const optionName = "Absorb Elements";
const elements = { acid: "acid", cold: "cold", fire: "fire", lightning: "lightning", poison: "poison" };

try {
	const lastArg = args[args.length - 1];
	let msgHistory = game.messages.reduce((list, message) => {
		let damage = message.flags?.midiqol?.undoDamage;
		if (damage) list.push(damage);
		return list;
	}, []);
	let lastAttack = msgHistory[msgHistory.length - 1];
	let attackData = lastAttack.find(i=> i.tokenId === lastArg.tokenId);
	let damageType = attackData.damageItem.damageDetail[0][0].type;
	let type = elements[damageType];
	
	if (args[0].macroPass === "preItemRoll") {
		if (type === undefined || null) {
			ui.notifications.error(`The spell fizzles, ${CONFIG.DND5E.damageTypes[damageType]} is not an element absorbed`);
			return false;
		}

		return true;
	}
	else if (args[0].macroPass === "postActiveEffects") {
		let tokenD = canvas.tokens.get(lastArg.tokenId);
		let spellLevel = lastArg.spellLevel;
		let gameRound = game.combat ? game.combat.rounds : 0;
		let itemD = lastArg.item;
		let timeD = itemD.duration.value;
		
		let effectDataAttack = [{
			label: itemD.name,
			icon: itemD.img,
			changes: [
				{ key: `bonuses.mwak.damage`, mode: 2, value: `${spellLevel}d6[${damageType}]`, priority: 20 },
				{ key: `bonuses.msak.damage`, mode: 2, value: `${spellLevel}d6[${damageType}]`, priority: 20 }
			],
			origin: lastArg.uuid,
			disabled: false,
			duration: { rounds: timeD, seconds: timeD * 12, startTime: game.time.worldTime, startRound: gameRound },
			flags: { dae: { specialDuration: ["1Hit", "turnEndSource"] } },
		}]
		await tokenD.actor.createEmbeddedDocuments("ActiveEffect", effectDataAttack);
		
		let effectDataResistance = [{
			label: itemD.name,
			icon: itemD.img,
			changes: [
				{ key: `traits.dr.value`, mode: 2, value: `${damageType}`, priority: 20 }
			],
			origin: lastArg.uuid,
			disabled: false,
			duration: { rounds: timeD, seconds: timeD * 12, startTime: game.time.worldTime, startRound: gameRound },
			flags: { dae: { specialDuration: ["turnEndSource"] } },
		}]
		await tokenD.actor.createEmbeddedDocuments("ActiveEffect", effectDataResistance);
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
