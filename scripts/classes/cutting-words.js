/*
	Also at 3rd level, you learn how to use your wit to distract, confuse, and otherwise sap the confidence and competence
	of others. When a creature that you can see within 60 feet of you makes an attack roll, an ability check, or a damage
	roll, you can use your reaction to expend one of your uses of Bardic Inspiration, rolling a Bardic Inspiration die
	and subtracting the number rolled from the creature’s roll. You can choose to use this feature after the creature
	makes its roll, but before the DM determines whether the attack roll or ability check succeeds or fails, or before
	the creature deals its damage. The creature is immune if it can’t hear you or if it’s immune to being Charmed.
 */
const version = "12.3.0";
const optionName = "Cutting Words";
// @scale.bard.inspiration

try {
	if (args[0].macroPass === "postActiveEffects") {
		// get the actor scale value
		const inspirationDie = actor.system.scale.bard["inspiration"];
		const cuttingWordsRoll = await new Roll(`${inspirationDie}`).evaluate();
		await game.dice3d.showForRoll(cuttingWordsRoll);
		ChatMessage.create({
			content: `${optionName} - ${actor.name} applies cutting words debuff of ${cuttingWordsRoll.total}`,
			speaker: ChatMessage.getSpeaker({actor: actor})
		});
	}
	
} catch (err)  {
    console.error(`${optionName} ${version}`, err);
}
