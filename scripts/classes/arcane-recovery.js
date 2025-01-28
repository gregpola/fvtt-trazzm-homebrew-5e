/*
	Arcane Recovery
	
	You have learned to regain some of your magical energy by studying your spellbook. 
	Once per day when you finish a short rest, you can choose expended spell slots to recover. 
	The spell slots can have a combined level that is equal to or less than half your wizard 
	level (rounded up), and none of the slots can be 6th level or higher.
	
	For example, if you’re a 4th-level wizard, you can recover up to two levels worth of 
	spell slots. You can recover either a 2nd-level spell slot or two 1st-level spell slots.
	
	*/
const version = "12.3.0";
const optionName = "Arcane Recovery";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "arcane-recovery-data";

try {
	if (args[0].macroPass === "preItemRoll") {
		await actor.unsetFlag(_flagGroup, flagName);

		const wizardLevel = actor.classes?.wizard?.system?.levels ?? 0;
		if (wizardLevel === 0) {
			ui.notifications.error(`${optionName} - character is not a Wizard`);
			return false;
		}

		// check for expended spell slots
		let proceed = false;
		for (let [key, {level, value, max}] of Object.entries(actor.system.spells)){
			if (level <= 6 && value < max) {
				proceed = true;
			}
		}

		if (proceed) {
			let recoveryData = await getRecoveryChoices(actor);
			if (Array.isArray(recoveryData)) {
				await actor.setFlag(_flagGroup, flagName, recoveryData);
				return true;
			}
		}
		else {
			ui.notifications.error(`${optionName} - no missing eligible spell slots`);
		}

		return false;

	}
	else if (args[0].macroPass === "postActiveEffects") {
		let recoveryData = actor.getFlag(_flagGroup, flagName);
		if (Array.isArray(recoveryData)) {
			// recover the slots
			for (let rowData of recoveryData) {
				let key = 'system.spells.' + rowData.slot + '.value';
				let currValue = foundry.utils.getProperty(actor, key);
				await actor.update({[key]: currValue + rowData.count});
			}

			await ChatMessage.create({content: `${actor.name} recovered spell slots`});
		}
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}

async function getRecoveryChoices(actor) {
	// How many slot points can be recovered
	const wizardLevel = actor.classes?.wizard?.system?.levels ?? 0;
	const recoveryPoints = Math.ceil(wizardLevel / 2);
	const maxLevel = Math.min(6, recoveryPoints);

	const rollData = foundry.utils.duplicate(actor.getRollData());
	const spells = rollData.spells;

	// build the checkbox content
	// loop through each spell level, building a row for each
	let rows = "";

	for (let [key, {level, value, max}] of Object.entries(spells)){
		if (key.startsWith('spell') && level <= maxLevel && value < max && level <= recoveryPoints) {
			let rowOptions = '';
			for (let c= 0; c <= max && c <= (max - value) && (c * level <= recoveryPoints); c++ ) {
				rowOptions += `<option value="${c}">${c}</option>`;
			}

			let row = `<div class="flexrow"><label>${CONFIG.DND5E.spellLevels[level]}</label>`;
			row += `<select id="${key}">${rowOptions}</select>`;
			row += `</div>`;
			rows += row;
		}
	}

	// build the dialog content
	let content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>Select the spell slots to recover. You can recover ${recoveryPoints} spell levels</label></div>
				<div id="slotRows" class="flexcol"style="margin-bottom: 10px;">
					${rows}
				</div>
			</div>
		  </form>`;

	let result = await foundry.applications.api.DialogV2.prompt({
		content: content,
		rejectClose: false,
		ok: {
			callback: (event, button, dialog) => {
				// count the cost of the selections
				let recoveredData = [];
				let spent = 0;
				var slots = document.getElementById("slotRows");
				var rowOptions = slots.getElementsByTagName("SELECT");
				for (var i = 0; i < rowOptions.length; i++) {
					if (rowOptions[i].value > 0) {
						let rowId = rowOptions[i].id;
						let lvl = Number(rowId[rowId.length - 1]);
						recoveredData.push({slot: rowId, count: rowOptions[i].value});
						spent += (rowOptions[i].value * lvl);
					}
				}

				if (spent > recoveryPoints) {
					ui.notifications.error(`${optionName} - too many spell levels selected`);
					return undefined;
				} else if (spent) {
					return recoveredData;
				}

				return undefined;
			}
		},
		window: {
			title: `${optionName}`,
		},
		position: {
			width: 500
		}
	});

	return result;
}
