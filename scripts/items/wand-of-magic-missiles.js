const version = "10.0.0";
const optionName = "Wand of Magic Mssiles";
const damageType = "force";
let damage_target = [];
let damage_result = [];
const lastArg = args[args.length - 1];

try {
	const itemD = lastArg.item;
	const itemUuid = await fromUuid(lastArg.uuid);
	const {value} = itemD?.system.uses ?? 0;

	if (args[0].macroPass === "preItemRoll") {
		if (lastArg.targets.length < 1) {
			ui.notifications.error(`${optionName}  - no targets selected`);
			return false;
		}
		
		if (value === 0) {
			ui.notifications.error(`${optionName} is out of charges`);
			return false;
		}
		
		return true;
	}
	else if (args[0].macroPass === "postActiveEffects") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow.actor;
		let target = args[0].targets[0];
		let tactor = target?.actor;
		const tokenD = canvas.tokens.get(lastArg.tokenId);
		
		// Ask how many charges to use
		let chargeCount = 0;
		const options = Array.fromRange(value + 1).reduce((acc, e) => acc += `<option value="${e+1}">${e+1}</option>`, "");
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
		await item.update({"system.uses.value": value - chargeCount + 1}); // +1 because of the auto comsumption

		// Ask how many missiles at each target
		const missileCount = 2 + Number(chargeCount);
		if (lastArg.targets.length === 1) {
			let target = canvas.tokens.get(lastArg.targets[0].id);
	
			for (let i = 0; i < missileCount; i++) {
				damageRoll = new Roll(`1d4+1[${damageType}]`).evaluate({ async: false });
				await game.dice3d?.showForRoll(damageRoll);
				await anime(tokenD, target);
				await MidiQOL.applyTokenDamage([{ damage: damageRoll.total, type: damageType }], damageRoll.total, new Set([target]), itemUuid, new Set());
			}
			
			damage_target.push(`<div class="midi-qol-flex-container"><div>hits</div><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}"> ${target.name}</div><div><img src="${target.document.texture.src}" width="30" height="30" style="border:0px"></div></div>`);
			
			await hitList();
			await rollList();

		}
		else {
			let targetList = lastArg.targets.reduce((list, target) => { return list + `<tr><td>${target.name}</td><td><input type="num" id="target" min="0" max="${missileCount}" name="${target.id}"></td></tr>` }, "");
			let the_content = `<p>You have <b>${missileCount}</b> total ${itemD.name}'s.</p><form class="flexcol"><table width="100%"><tbody><tr><th>Target</th><th>Missiles</th></tr>${targetList}</tbody></table></form>`;
			let targetDialog = new Promise(async (resolve, reject) => {
				let errorMessage;
				new Dialog({
					title: `${itemD.name} Damage`,
					content: the_content,
					buttons: {
						damage: {
							label: "Damage", callback: async (html) => {
								let spentTotal = 0;
								let selected_targets = html.find('input#target');
								for (let get_total of selected_targets) {
									spentTotal += Number(get_total.value);
								}
								if (spentTotal > missileCount) {
									errorMessage = `The spell fails, You assigned more bolts then you have.`;
									return ui.notifications.error(errorMessage);
								}
								if (spentTotal === 0) {
									errorMessage = `The spell fails, No bolts spent.`;
									return ui.notifications.error(errorMessage);
								}
								
								for (let selected_target of selected_targets) {
									let damageNum = selected_target.value;
									if (damageNum != null) {
										let target_id = selected_target.name;
										let get_target = canvas.tokens.get(target_id);
										let totalDamage = 0;
										
										for (let i = 0; i < damageNum; i++) {
											damageRoll = new Roll(`1d4+1[${damageType}]`).evaluate({ async: false });
											await game.dice3d?.showForRoll(damageRoll);
											await anime(tokenD, get_target);
											await MidiQOL.applyTokenDamage([{ damage: damageRoll.total, type: damageType }], damageRoll.total, new Set([get_target]), itemUuid, new Set());
											totalDamage += damageRoll.total;
										}
										
										damage_target.push(`<div class="midi-qol-flex-container"><div>hits</div><div class="midi-qol-target-npc midi-qol-target-name" id="${get_target.id}"> ${get_target.name} [x${damageNum}|<b>${totalDamage}</b>]</div><div><img src="${get_target.document.texture.src}" width="30" height="30" style="border:0px"></div></div>`);

									}
								}

								await hitList();
								await rollList();
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
			await targetDialog;
		}
	}
	
} catch (err)  {
    console.error(`${optionName} ${version}`, err);
}

async function hitList() {
    let damage_list = damage_target.join('');
    let damage_results = `<div><div class="midi-qol-nobox">${damage_list}</div></div>`;
    let chatMessage = await game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    let searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
    let replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${damage_results}`;
    content = await content.replace(searchString, replaceString);
    return chatMessage.update({ content: content });
}

async function rollList() {
    let damage_results = damage_result.join('');
    let chatMessage = await game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    let searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    let replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${damage_results}`;
    content = await content.replace(searchString, replaceString);
    return chatMessage.update({ content: content });
}

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.magic_missile.purple")        
        .atLocation(token)
        .stretchTo(target)
    .play()
}