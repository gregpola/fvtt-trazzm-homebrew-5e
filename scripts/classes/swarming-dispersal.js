const version = "12.3.0";
const optionName = "Swarming Dispersal";

try {
	if (args[0].macroPass === "postActiveEffects") {
		let gameRound = game.combat ? game.combat.rounds : 0;

		let effectDataResistance = [{
			label: item.name,
			icon: item.img,
			changes: [
				{ key: 'system.traits.dr.all', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: '1', priority: 20 }
			],
			origin: item.uuid,
			disabled: false,
			duration: { rounds: 1, seconds: 6, startTime: game.time.worldTime, startRound: gameRound },
			flags: { dae: { specialDuration: ["isDamaged"] } },
		}]
		await actor.createEmbeddedDocuments("ActiveEffect", effectDataResistance);
		
		// prompt for teleport location
		await HomebrewMacros.teleportToken(token, 30);
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
