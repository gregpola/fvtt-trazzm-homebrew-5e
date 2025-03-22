/*
	At 20th level, you can draw on your inner reserve of mystical power while entreating your patron to regain expended
	spell slots. You can spend 1 minute entreating your patron for aid to regain all your expended spell slots from your
	Pact Magic feature. Once you regain spell slots with this feature, you must finish a long rest before you can do so
	again.
 */
const version = "12.3.0";
const optionName = "Eldritch Master";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// get the actor's spells
		const spells = foundry.utils.duplicate(actor.system.spells);
		if (!spells) {
			return ui.notifications.error(`${optionName} - no spells found`);
		}

		const pactSlot = spells["pact"];
		if (!pactSlot) {
			return ui.notifications.error(`${optionName} - no pact spells found`);
		}

		// Replenish all pact slots
		let key = 'system.spells.pact.value';
		const value = pactSlot.max;
		await actor.update({[key]: value});
	}
} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}
