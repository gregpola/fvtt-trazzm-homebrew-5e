const version = "0.1.0";
const optionName = "Blazing Revival";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const actor = await game.actors.get(args[0].actor._id);
		await game.dfreds.effectInterface.removeEffect({effectName: 'Incapacitated', uuid:actor.uuid});
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
