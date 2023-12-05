const version = "11.0";
const optionName = "Wand of Magic Missiles";
const damageType = "force";

try {
	if (args[0].macroPass === "preItemRoll") {
		if (workflow.targets.size < 1) {
			ui.notifications.error(`${optionName}  - no targets selected`);
			return false;
		}

		if (item.system.uses < 1) {
			ui.notifications.error(`${optionName} is out of charges`);
			return false;
		}
	}
	else if (args[0].macroPass === "postActiveEffects") {
		const currentCharges = item.system.uses.value;

		// Ask how many charges to use
		let chargeCount = 0;
		const options = Array.fromRange(currentCharges + 1).reduce((acc, e) => acc += `<option value="${e+1}">${e+1}</option>`, "");
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: "Conditional Damage",
				content: `Charges to expend: <select id="charge-count">${options}</select>`,
				buttons: {
					ok: {
						icon: '<i class="fas fa-check"></i>',
						label: "Confirm",
						callback: async (html) => {
							const val = Number(html[0].querySelector("#charge-count").value);
							resolve(val);
						}
					}
				},
				default: "ok"
			}).render(true);
		});
		chargeCount = await dialog;
		await item.update({"system.uses.value": currentCharges - chargeCount + 1}); // +1 because of the auto consumption

		const missileCount = 2 + Number(chargeCount);

		// check for need to select targets
		if (workflow.targets.size === 1) {
			let target = workflow.targets.first();
			await launchMissiles(target, missileCount);
		}
		else {
			let targetList = workflow.targets.reduce((list, target) => {
				return list + `<tr><td style="width: 75%">${target.name}</td><td style="width: 25%"><input type="num" id="target" min="0" max="${missileCount}" name="${target.id}"></td></tr>`
			}, "");

			let the_content = `<p>You have <b>${missileCount}</b> total ${item.name}'s.</p><form class="flexcol"><table><tbody><tr><th>Target</th><th>Missiles</th></tr>${targetList}</tbody></table></form>`;

			let dialog = new Promise(async (resolve, reject) => {
				let errorMessage;
				new Dialog({
					title: `${item.name} Targets`,
					content: the_content,
					buttons: {
						damage: {
							label: "Cast", callback: async (html) => {
								let spentTotal = 0;
								let selected_targets = html.find('input#target');
								for (let get_total of selected_targets) {
									spentTotal += Number(get_total.value);
								}

								if (spentTotal > missileCount) {
									ui.notifications.info("More missile targets selected than available, results will be clipped");
								}

								if (spentTotal === 0) {
									errorMessage = `The spell fails, No missiles targeted.`;
									ui.notifications.error(errorMessage);
								}
								else {
									let sentMissiles = 0;
									for (let selected_target of selected_targets) {
										let damageNum = selected_target.value;
										if (damageNum != null) {
											let targetCount = Number(damageNum);
											if ((targetCount + sentMissiles) > missileCount) {
												targetCount = missileCount - sentMissiles;
											}

											if (targetCount < 1)
												break;

											let target_id = selected_target.name;
											let targetToken = canvas.tokens.get(target_id);
											sentMissiles += targetCount;
											await launchMissiles(targetToken, targetCount);
										}
									}
								}
								resolve();
							}
						}
					},
					close: async (html) => {
						if(errorMessage) reject(new Error(errorMessage));
					},
					default: "damage"
				}).render(true);
			});
			await dialog;
		}
	}
} catch (err)  {
	console.error(`${optionName} : ${version}`, err);
}

async function launchMissiles(targetToken, missileCount){
	for (let i = 0; i < missileCount; i++) {
		let damageRoll = new Roll(`1d4+1[${damageType}]`).evaluate({ async: false });
		await game.dice3d?.showForRoll(damageRoll);
		await anime(token, targetToken);
		await new MidiQOL.DamageOnlyWorkflow(actor, targetToken, damageRoll.total, damageType, [targetToken], damageRoll, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemData: item, itemCardId: "new" });
	}
}

async function anime(token, target) {
	new Sequence()
		.effect()
		.file("jb2a.magic_missile.blue")
		.atLocation(token)
		.stretchTo(target)
		.play()
}
