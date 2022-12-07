const version = "0.1.0";
const optionName = "Song of Defense";

try {
	let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
	let actor = workflow?.actor;
	const lastArg = args[args.length - 1];
	let itemD = lastArg.item;

	if (args[0].macroPass === "preItemRoll") {
		// make sure the actor has Bladesong active
		let effect = actor.data.effects.find(i=> i.data.label === "Bladesong");
		if (!effect) {
			await ChatMessage.create({ content: `${actor.name} - unable to use ${optionName} because Bladesong is not active` });
			return false;
		}			

		// check for available spell slots
		let spells = actor.data.data.spells;
		if (!spells) {
			await ChatMessage.create({ content: `${actor.name} - unable to use ${optionName} because they have no spells` });
			return false;
		}
		
		let rows = "";
		for(let [key, {value, max}] of Object.entries(spells)){
			if ((value > 0) && (max > 0)) {
				let row = `<div class="flexrow"><label>${CONFIG.DND5E.spellLevels[key.at(-1)]}</label><input type="checkbox" style="margin-right:10px;"/></div>`;
				rows += row;
			}
		}
		
		if (rows.length === 0) {
			await ChatMessage.create({ content: `${actor.name} - unable to use ${optionName} because they have no spell slots remaining` });
			return false;
		}

		// mae sure damage is greater than 0
		let damageReceived = workflow.workflowOptions.damageTotal;
		if (damageReceived < 1) {
			await ChatMessage.create({ content: `${actor.name} - unable to use ${optionName} because they didn't take damage` });
			return false;
		}
		const damageType = workflow.workflowOptions.damageDetail[0].type;
				
		// build the dialog content
		// TODO show how much damage received
		let content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 5px;"><label>What spell level do you want to use?</label></div>
				<div class="flexrow" style="margin-bottom: 10px;"><label>Received ${damageReceived} damage (damage is reduced by five times the spell level)?</label></div>
				<div id="slotRows" class="flexcol"style="margin-bottom: 10px;">
					${rows}
				</div>
			</div>
		  </form>
		`;

		// ask which spell slot to use
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content,
				buttons: {
					ok: {
						icon: '<p> </p><img src = "icons/equipment/shield/heater-crystal-blue.webp" width="50" height="50"></>',
						label: `Use ${optionName}`,
						callback: (html) => {
							let checked = 0;
							let slotLevel = 0;
							var grid = document.getElementById("slotRows");
							var checkBoxes = grid.getElementsByTagName("INPUT");
							for (var i = 0; i < checkBoxes.length; i++) {
								if (checkBoxes[i].checked) {
									var row = checkBoxes[i].parentNode;
									const l = checkBoxes[i].parentNode.firstElementChild.innerText.charAt(0);
									checked += Number(1);
									slotLevel = Number(l);
								}
							}
							
							// validate selection
							if (!checked) {
								resolve(0);
							}
							else if (checked > 1) {
								ui.notifications.error(`${optionName} - too many slot levels selected`);
								resolve(0);
							}
							else {
								resolve(slotLevel);
							}
							resolve(true);

						}
					},
					cancel: {
						label: `Cancel`,
						callback: () => { resolve(-1); }
					}
				},
				default: "ok"
			}).render(true);
		});
		
		let slot = await dialog;
		if (slot > 0) {
			// burn the slot
			await actor.update({[`data.spells.spell${slot}.value`]: getProperty(actor.data, `data.spells.spell${slot}.value`) - 1});
			
			// apply the defense -- this is a hack until I can figure out a better way
			let damageRemoved = slot * 5;
			const tempHP = Math.min(damageReceived, damageRemoved);
			//const newDamage = Math.max(damageReceived - damageRemoved, 0);
			/*const newDamageDetail = [{
				damage: newDamage,
				type: damageType
			}];
			setProperty(workflow, "workflowOptions.damageDetail", newDamageDetail);
			*/
			if(!actor.data.data.attributes.hp.temp || (actor.data.data.attributes.hp.temp < tempHP)) {
				await actor.update({ "data.attributes.hp.temp" : tempHP });
			}
			
			await ChatMessage.create({ content: `${actor.name} - used ${optionName} to stop ${damageRemoved} damage` });			
			return true;
		}
		else
			return false;
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
