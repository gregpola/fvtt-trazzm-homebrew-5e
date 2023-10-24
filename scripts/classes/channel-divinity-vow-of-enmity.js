/*
	As a bonus action, you can utter a vow of enmity against a creature you can see within 10 feet of you, using your
	Channel Divinity. You gain advantage on attack rolls against the creature for 1 minute or until it drops to 0 hit
	points or falls unconscious.
 */
const version = "11.1";
const optionName = "Vow of Enmity"
const channelDivinityName = "Channel Divinity (Paladin)";
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
	else if (args[0].macroPass === "preAttackRoll") {
		const actorEffect = actor?.effects.find(i=>i.name === optionName);
		const targetEffect = workflow.targets.first()?.actor.effects.find(i=>i.name === optionName && i.origin === actorEffect?.origin);

		if (actorEffect && targetEffect) {
			workflow.advantage = "true";
		}
	}
	
} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}
