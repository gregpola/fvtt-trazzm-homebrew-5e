/*
	As an action, you present your holy symbol and speak a prayer censuring fiends and undead, using your Channel Divinity.
	Each fiend or undead that can see or hear you within 30 feet of you must make a Wisdom saving throw. If the creature
	fails its saving throw, it is turned for 1 minute or until it takes damage.

	A turned creature must spend its turns trying to move as far away from you as it can, and it can’t willingly move to
	a space within 30 feet of you. It also can’t take reactions. For its action, it can use only the Dash action or try
	to escape from an effect that prevents it from moving. If there’s nowhere to move, the creature can use the Dodge action.
*/
const version = "11.3";
const optionName = "Turn the Unholy";
const channelDivinityName = "Channel Divinity (Paladin)";
const cost = 1;

const targetTypes = ["undead", "fiend"];
const immunity = ["Turn Immunity"];

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
	else if (args[0].macroPass === "preambleComplete") {
		// check target types
		for (let target of workflow.targets) {
			let creatureType = target.actor.system.details.type;

			// remove targets that are not applicable creatures (aka PCs etc)
			if ((creatureType === null) || (creatureType === undefined)) {
				workflow.targets.delete(target);
			}
			// remove creatures that are not undead or fiends
			else if (!targetTypes.some(type => (target?.actor.system.details.type?.value || "").toLowerCase().includes(type))) {
				workflow.targets.delete(target);
			}
			// remove creatures with turn immunity
			else if (target.actor.items.find(i => immunity.includes(i.name))) {
				workflow.targets.delete(target);
			}
		}

		game.user.updateTokenTargets(Array.from(workflow.targets).map(t => t.id));
	}

} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}
