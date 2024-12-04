/*
	The drow attempts to magically summon a shadow demon (see the Monster Manual) with a 50 percent chance of success.
	If the attempt fails, the drow takes 5 (1d10) psychic damage. Otherwise, the summoned demon appears in an unoccupied
	space within 60 feet of its summoner, acts as an ally of its summoner, and can’t summon other demons. It remains for
	10 minutes, until it or its summoner dies, or until its summoner dismisses it as an action.
*/
const version = "12.3.0";
const optionName = "Summon Shadow Demon";

try {
	if (args[0].macroPass === "preItemRoll") {
		// roll failure chance
		let chanceRoll = await new Roll(`1d100`).evaluate();
		await game.dice3d?.showForRoll(chanceRoll);
		
		if (chanceRoll.total > 50) {
			const damageRoll = await new Roll(`1d10`).evaluate();
			await game.dice3d?.showForRoll(damageRoll);
			await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "psychic", [token], damageRoll,
			{ flavor: `${optionName} failure damage`, itemData: item, itemCardId: "new" });

			ChatMessage.create({
				content: 'Failed their attempt to summon',
				speaker: ChatMessage.getSpeaker({actor: actor})
			});
			return false;
		}
		
		return true;
	}
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
