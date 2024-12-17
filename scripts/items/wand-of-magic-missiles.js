const version = "12.3.0";
const optionName = "Wand of Magic Missiles";
const damageType = "force";

try {
	if (args[0].macroPass === "preItemRoll") {
		if (workflow.targets.size < 1) {
			ui.notifications.error(`${optionName}  - no targets selected`);
			return false;
		}

		if (item.system.uses.value < 1) {
			ui.notifications.error(`${optionName} is out of charges`);
			return false;
		}

		workflow.config.consumeUsage = false;
		workflow.config.needsConfiguration = false;
		workflow.options.configureDialog = false;
		return true;
	}
	else if (args[0].macroPass === "postActiveEffects") {
		const currentCharges = item.system.uses.value;

		// Ask how many charges to use
		const options = Array.fromRange(currentCharges).reduce((acc, e) => acc += `<option value="${e+1}">${e+1}</option>`, "");

		let chargeCount = await foundry.applications.api.DialogV2.prompt({
			window: {title: optionName},
			content: `<p>Charges to expend:</p><p><select id="charge-count">${options}</select></p>`,
			ok: {
				label: "Choose",
				callback: (event, button, dialog) => button.form.elements['charge-count'].value
			}
		});

		const newChargeValue = currentCharges - Number(chargeCount);
		await item.update({"system.uses.value": newChargeValue}); // +1 because of the auto consumption
		const missileCount = 2 + Number(chargeCount);

		// ask how many missiles per target
		if (workflow.targets.size === 1) {
			let target = workflow.targets.first();
			await launchMissiles(target, missileCount);
		}
		else {
			// ask how many missiles per target
			let targetList = workflow.targets.reduce((list, target) => {
				return list + `<tr><td style="width: 75%">${target.name}</td><td style="width: 25%"><input type="number" id="target" name="${target.name}" min="0" max="${missileCount}" step="1" value="1" autofocus></td></tr>`
			}, "");
			let content = `<p>You have <b>${missileCount}</b> total ${item.name}'s.</p><form class="flexcol"><table><tbody><tr><th>Target</th><th>Missiles</th></tr>${targetList}</tbody></table></form>`;

			let targetData = await foundry.applications.api.DialogV2.prompt({
				window: {title: `${item.name} Targets`},
				content: content,
				ok: {
					label: "Cast",
					callback: (event, button, dialog) => {
						let sentMissiles = 0;
						let resultData = [];

						for (let beamTarget of button.form.elements.target) {
							let targetCount = Number(beamTarget.value);
							if (targetCount > 0) {
								let actualCount = Math.min(targetCount, missileCount - sentMissiles);

								// get the target token
								let targetToken = workflow.targets.find(t => t.name === beamTarget.name);
								if (targetToken) {
									resultData.push({target: targetToken, count: actualCount});
								}

								sentMissiles += actualCount;
								if (sentMissiles === missileCount)
									break;
							}
						}

						return resultData;
					}
				}
			});

			if (targetData) {
				for (let td of targetData) {
					await launchMissiles(td.target, td.count);
				}
			}
		}

		// check for item destruction
		if (newChargeValue === 0) {
			let destroyRoll = await new Roll(`1d20`).evaluate();
			await game.dice3d?.showForRoll(destroyRoll);

			if (destroyRoll.total === 1) {
				ChatMessage.create({
					content: `${actor.name}'s ${item.name} crumbles into ashes and is destroyed`,
					speaker: ChatMessage.getSpeaker({actor: actor})
				});
				await actor.deleteEmbeddedDocuments('Item', [item.id]);
			}
		}
	}

} catch (err)  {
	console.error(`${optionName} : ${version}`, err);
}

async function launchMissiles(targetToken, missileCount){
	for (let i = 0; i < missileCount; i++) {
		let damageRoll = await new Roll(`1d4+1[${damageType}]`).evaluate();
		await game.dice3d?.showForRoll(damageRoll);
		await anime(token, targetToken);
		await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, damageType, [targetToken], damageRoll, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemData: item, itemCardId: args[0].itemCardId });
	}
}

async function anime(token, target) {
	new Sequence()
		.effect()
		.file("jb2a.magic_missile.purple")
		.atLocation(token)
		.stretchTo(target)
		.play()
}
