/*
	As an action, you present your holy symbol and speak a prayer of denunciation, using your Channel Divinity. Choose
	one creature within 60 feet of you that you can see. That creature must make a Wisdom saving throw, unless it is
	immune to being Frightened. Fiends and undead have disadvantage on this saving throw.

	On a failed save, the creature is Frightened for 1 minute or until it takes any damage. While frightened, the creature’s
	speed is 0, and it can’t benefit from any bonus to its speed.

	On a successful save, the creature’s speed is halved for 1 minute or until the creature takes any damage.
 */
const version = "11.0";
const optionName = "";
const channelDivinityName = "Channel Divinity (Paladin)";
const channelDivinityName = "Channel Divinity (Cleric)";
const cost = 1;

try {
	if (args[0].macroPass === "preItemRoll") {
		// check Channel Divinity uses available
		let channelDivinity = actor.items.find(i => i.name === channelDivinityName);
		if (channelDivinity) {
			let usesLeft = channelDivinity.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < cost) {
				console.error(`${optionName} - not enough ${channelDivinityName} uses left`);
				ui.notifications.error(`${optionName} - not enough ${channelDivinityName} uses left`);
			}
			else {
				const newValue = channelDivinity.system.uses.value - cost;
				await channelDivinity.update({"system.uses.value": newValue});
				return true;
			}
		}
		else {
			console.error(`${optionName} - no ${channelDivinityName} item on actor`);
			ui.notifications.error(`${optionName} - no ${channelDivinityName} item on actor`);
		}

		return false;
	}

} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}
