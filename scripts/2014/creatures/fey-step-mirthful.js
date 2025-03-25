const version = "12.3.0";
const optionName = "Fey Step";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const maxRange = item.system.range.value ?? 30;
		let position = await HomebrewMacros.teleportToken(token, maxRange);

		if (position) {
			await attemptCharm(actor, token);
		}
		else {
			ui.notifications.error(`${optionName} - invalid fey step location`);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function attemptCharm(actor, token) {
	// Ask which target to try to charm
	const potentialTargets = MidiQOL.findNearby(null, token, 10);
	if (potentialTargets.length === 0) {
		console.log(`${optionName} - no targets within 10 feet to charm`);
		return;
	}

	// build the radio options
	let options = [];
	for(let t of potentialTargets) {
		options.push({
			type: "radio",
			label: t.name,
			value: t.actor.uuid
		});
	}

	const menuOptions = {};
	menuOptions["buttons"] = [
		{ label: "Charm", value: true },
		{ label: "Cancel", value: false }
	];
	menuOptions["inputs"] = options;

	let choice = await HomebrewHelpers.menu(menuOptions,
		{ title: `Pick your charm target:`, options: { height: "100%", width: "150px" } });
	if(!choice.buttons) return;

	const selectedIndex = choice.inputs.indexOf(true);
	let targetId = options[selectedIndex].value;
	if (targetId) {
		const targetActor = MidiQOL.MQfromActorUuid(targetId);
		if (targetActor) {
			let saveDC = actor.system.attributes.spelldc;
			let spellDCFlag = actor.getFlag("fvtt-trazzm-homebrew-5e", "spell-dc");
			if (spellDCFlag) {
				saveDC = spellDCFlag;
			}
			const saveFlavor = `${CONFIG.DND5E.abilities["wis"].label} DC${saveDC} ${optionName}`;
			let saveRoll = await targetActor.rollAbilitySave("wis", {flavor: saveFlavor, damageType: "charm"});
			await game.dice3d?.showForRoll(saveRoll);

			if (saveRoll.total < saveDC) {
				await HomebrewEffects.applyCharmedEffect(targetActor, item, ["isDamaged"]);
			}
		}
	}
}
