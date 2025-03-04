/*
	Starting at 2nd level, you can use your Channel Divinity to heal the badly injured.

	As an action, you present your holy symbol and evoke healing energy that can restore a number of hit points equal to
	five times your cleric level. Choose any creatures within 30 feet of you, and divide those hit points among them. This
	feature can restore a creature to no more than half of its hit point maximum. You can’t use this feature on an undead
	or a construct.
*/
const version = "12.3.0";
const optionName = "Preserve Life"

try {
	if (args[0].macroPass === "postActiveEffects") {
		// find nearby allies
		const friendlyTargets = MidiQOL.findNearby(1, token, 30);
		const neutralTargets = MidiQOL.findNearby(0, token, 30);
		let possibleTargets = [token, ...friendlyTargets, ...neutralTargets];
		const recipients = possibleTargets.filter(filterRecipient);
		
		// roll the total HP to spend
		const clericLevel = actor.classes.cleric?.system.levels ?? 0;
		if (!clericLevel) {
			return ui.notifications.error(`${optionName} - caster is not a cleric`);
		}
		const totalHealing = 5 * clericLevel;
		
		// ask which ones to heal and how much
		// One row per potential target
		let rows = "";
		for (var i = 0; i < recipients.length; i++) {
			let r = recipients[i];
			// get the max hp per recipient
			let half = Math.ceil(r.actor.system.attributes.hp.max / 2);
			let eligible = ((half > r.actor.system.attributes.hp.value) ? (half - r.actor.system.attributes.hp.value) : 0);
			let recipientMax = Math.min(totalHealing, eligible);
			let row = `<div class="flexrow" style="margin-bottom: 5px;"><label style="margin-right: 10px;">${r.name}</label>`
				+ `<input name="target" id="${r.id}" type="number" min="0" max="${recipientMax}" step="1" value="0"/>`
				+ `<label style="margin-left: 10px;">(max: ${recipientMax})</label>`
				+ `</div>`;
			rows += row;
		}
		
		// build the dialog content
		let content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>Distribute the ${totalHealing} healing available:</label></div>
				<div id="targetRows" class="flexcol"style="margin-bottom: 10px;">
					${rows}
				</div>
			</div>
		  </form>`;


		let targetData = await foundry.applications.api.DialogV2.prompt({
			window: {title: `${optionName}`},
			content: content,
			ok: {
				label: "Heal",
				callback: (event, button, dialog) => {
					let spent = 0;
					let resultData = [];

					for (let healTarget of button.form.elements.target) {
						let targetMax = Number(healTarget.max);
						let targetHeal = Math.min(healTarget.valueAsNumber, targetMax);
						if (targetHeal > 0) {
							spent += targetHeal;

							// get the target token
							let targetToken = canvas.tokens.get(healTarget.id);
							if (targetToken) {
								resultData.push({target: targetToken, healing: targetHeal});
							}
						}
					}

					if (spent > totalHealing) {
						ui.notifications.error(`${optionName}: too much healing distributed`);
						return undefined;
					}

					return resultData;
				}
			}
		});

		if (targetData) {
			for (let td of targetData) {
				const damageRoll = await new Roll(`${td.healing}`).evaluate();
				await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "healing", [td.target], damageRoll,
					{flavor: `${optionName}`, itemCardId: args[0].itemCardId});
			}
		}
	}
	
} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}

function filterRecipient(r) {
	// check for not allowed types
	if (["undead", "construct"].includes(MidiQOL.typeOrRace(r.actor))) {
		return false;
	}

	let half = (r.actor.system.attributes.hp.max / 2);
	let eligible = ((half > r.actor.system.attributes.hp.value) ? (half - r.actor.system.attributes.hp.value) : 0);

	return eligible > 0;
}
