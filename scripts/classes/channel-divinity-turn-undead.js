/*
	As an action, you present your holy symbol and speak a prayer censuring the undead. Each undead that can see or hear
	you within 30 feet of you must make a Wisdom saving throw. If the creature fails its saving throw, it is turned for
	1 minute or until it takes any damage.

	A turned creature must spend its turns trying to move as far away from you as it can, and it can’t willingly move to
	a space within 30 feet of you. It also can’t take reactions. For its action, it can use only the Dash action or try
	to escape from an effect that prevents it from moving. If there’s nowhere to move, the creature can use the Dodge action.
 */
const version = "11.2";
const resourceName = "Channel Divinity";
const optionName = "Turn Undead";
const channelDivinityName = "Channel Divinity (Cleric)";
const cost = 1;

const targetTypes = ["undead"];
const immunity = ["Turn Immunity"];
const turnAdvantage = ["Turning Defiance"];
	
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
		for (let t of workflow.targets) {
			let creatureType = t.actor.system.details.type;

			// remove targets that are not applicable creatures (aka PCs etc)
			if ((creatureType === null) || (creatureType === undefined)) {
				workflow.targets.delete(t);
			}
			// remove creatures that are not undead 
			else if (!targetTypes.some(type => (t?.actor.system.details.type?.value || "").toLowerCase().includes(type))) {
				workflow.targets.delete(t);
			}
			// remove creatures with turn immunity
			else if (t.actor.items.find(i => immunity.includes(i.name))) {
				workflow.targets.delete(t);
			}
		}

		game.user.updateTokenTargets(Array.from(workflow.targets).map(t => t.id));
		
	}
	else if (args[0].macroPass === "preSave") {
		for (let t of workflow.targets) {
			let hasAdvantage = false;

			for (let ename of turnAdvantage) {
				if (t.actor.effects.find(ef => ef.name === ename)) {
					hasAdvantage = true;
					break;
				}
			}

			if (hasAdvantage) {
				const data = {
					changes: [{
						key: "flags.midi-qol.advantage.ability.save.all",
						mode: 0,
						priority: 20,
						value: "1"
					}],
					"duration": {"seconds": 1, "turns": 1},
					"flags": {"dae": {"specialDuration": ["isSave"]}},
					"icon": "icons/skills/melee/shield-damaged-broken-orange.webp",
					"name": "Turn Advantage",
					"origin": workflow.item.uuid
				};
				await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: t.actor.uuid, effects: [data]});
			}
		}
	}
	else if (args[0].macroPass === "postSave") {
		let targets = workflow.failedSaves;
		if (targets && targets.size > 0) {
			const maxCR = actor.system.scale.cleric["destroy-undead"]?.value ?? 0;

			for (let t of targets) {
				if (maxCR && (t.actor.system.details.cr <= maxCR)) {
					await t.actor.update({"system.attributes.hp.value": 0});
				}
			}
		}
		else {
			console.log("No targets failed their save");
		}		
	}
	
} catch (err) {
	console.error(`${workflow.itemData.name}: ${version}`, err);
}
