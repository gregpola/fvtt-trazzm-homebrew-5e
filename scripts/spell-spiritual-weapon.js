const version = "10.0.0";
const optionName = "Spiritual Weapon";

try {
	const origin = args[0].itemUuid;
	if (origin) {
		const removeList = actor.effects.filter(ae => ae.origin === origin && getProperty(ae, "flags.dae.transfer") !== 3).map(ae=>ae.id);
		await actor.deleteEmbeddedDocuments("ActiveEffect", removeList)
	}
	
	const lastArg = args[args.length - 1];
	const tokenD = canvas.tokens.get(lastArg.tokenId);
	const actorD = tokenD.actor;
	const actorData = actorD.getRollData();

	let spellStat = actorData.attributes.spellcasting;
	if (spellStat === "") spellStat = "wis";
	const spellcasting = actorData.abilities[spellStat].mod;
	const spellLevel = lastArg.workflow.castData.castLevel;
	const attackDice = 1 + Math.floor((spellLevel-2)/2);

	const updates = {
		Item: {
			"Spiritual Weapon Attack": {
				"system.properties.mgc": true,
				"system.attackBonus": `${Number(actorData.attributes.prof) + Number(spellcasting) + Number(actorData.bonuses.msak.attack)}`,
				"system.damage.parts":[[`${attackDice}d8 + ${spellcasting}`,"force"]]
		}
	  }
	}

	const actorsWeapon = "Spiritual Weapon (" + actor.name + ")";
	const result = await warpgate.spawn(actorsWeapon,  {embedded: updates}, {}, {});
	if (result.length !== 1) return;
	const createdToken = game.canvas.tokens.get(result[0]);
	await anime(tokenD, createdToken);
	
	await createdToken.actor.items.getName("Spiritual Weapon Attack").update({"system.proficient": false});
	const targetUuid = `Scene.${canvas.scene.id}.Token.${result[0]}`;

	await actor.createEmbeddedDocuments("ActiveEffect", [{
		label: "Summon", 
		icon: args[0].item.img, 
		origin,
		duration: {seconds: 60, rounds:10},
		"flags.dae.stackable": false,
		changes: [{key: "flags.dae.deleteUuid", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: [targetUuid]}]
	}]);
	
} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.misty_step.02.blue")       
        .atLocation(target)
		.scaleToObject(1)
		.play();
}