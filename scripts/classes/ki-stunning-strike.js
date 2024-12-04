/*
	Starting at 5th level, you can interfere with the flow of ki in an opponent's body. When you hit another creature with
	a melee weapon attack, you can spend 1 ki point to attempt a stunning strike. The target must succeed on a Constitution
	saving throw or be stunned until the end of your next turn.
*/	
const version = "12.3.0";
const kiName = "Ki";
const optionName = "Stunning Strike";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const targetToken = workflow.failedSaves.first();
		if (targetToken) {
			await HomebrewEffects.applyStunnedEffect(targetToken.actor, item, ['turnEndSource']);
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
