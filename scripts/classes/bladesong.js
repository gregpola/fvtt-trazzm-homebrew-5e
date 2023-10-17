/*
	You can invoke an elven magic called the Bladesong, provided that you aren’t wearing medium or heavy armor or using a shield. It graces you with supernatural speed, agility, and focus.

	You can use a bonus action to start the Bladesong, which lasts for 1 minute. It ends early if you are incapacitated, if you don medium or heavy armor or a shield, or if you use two hands to make an attack with a weapon. You can also dismiss the Bladesong at any time (no action required).

	While your Bladesong is active, you gain the following benefits:

	You gain a bonus to your AC equal to your Intelligence modifier (minimum of +1).
	Your walking speed increases by 10 feet.
	You have advantage on Dexterity (Acrobatics) checks.
	You gain a bonus to any Constitution saving throw you make to maintain your concentration on a spell. The bonus equals your Intelligence modifier (minimum of +1).
	You can use this feature a number of times equal to your proficiency bonus, and you regain all expended uses of it when you finish a long rest.
*/
const version = "10.0.0";
const optionName = "Bladesong"

try {
	if (args[0].macroPass === "preItemRoll") {
		const lastArg = args[args.length - 1];
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		
		// make sure the character is not wearing medium armor, heavy armor, or a shield
		let armor = actor.items.filter(i => (i.type === `equipment`) && i.system.equipped && ["medium","heavy","shield"].includes(i.system.armor?.type));
		if (armor && armor.length > 0) {
			ui.notifications.error(`${optionName}: unable to activate because you have an ineligible item equipped`);
			return false;
		}
		
		return true;
	}
	
} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}
