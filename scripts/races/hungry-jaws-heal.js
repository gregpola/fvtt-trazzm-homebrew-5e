/*
	You can throw yourself into a feeding frenzy. As a bonus action, you can make a special attack with your Bite. If the
	attack hits, it deals its normal damage, and you gain temporary hit points equal to your proficiency bonus. You can
	use this trait a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest.
*/
const version = "12.3.0";
const optionName = "Hungry Jaws";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// Self Heal
		const tempHP = actor.system.attributes.prof;
		const damageRoll = await new Roll(`${tempHP}`).evaluate();
		await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "temphp", [token], damageRoll,
			{flavor: `${optionName}`, itemCardId: args[0].itemCardId});
		await ChatMessage.create({
			content: `${actor.name} feeds on the flesh of their enemy`,
			speaker: ChatMessage.getSpeaker({actor: actor})
		});
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
