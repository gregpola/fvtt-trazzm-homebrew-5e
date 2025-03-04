/*
	You can direct your magic to absorb damage while your Bladesong is active. When you take damage, you can use your
	reaction to expend one spell slot and reduce that damage to you by an amount equal to five times the spell slot’s level.
*/
const version = "10.0.0";
const optionName = "Song of Defense";

try {

	if (args[0].macroPass === "preItemRoll") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		
		// make sure the actor has Bladesong active
		let effect = actor.effects.find(i=> i.label === "Bladesong");
		if (!effect) {
			await ChatMessage.create({ content: `${actor.name} - unable to use ${optionName} because Bladesong is not active` });
			return false;
		}
		
		// make sure damage is greater than 0
		let damageReceived = lastArg.workflow.workflowOptions.damageTotal;
		if (damageReceived < 1) {
			await ChatMessage.create({ content: `${actor.name} - unable to use ${optionName} because they didn't take damage` });
			return false;
		}

		// check for available spell slots
		let spells = actor.system.spells;
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

		// build the dialog content
		let content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 5px;"><label>What spell level do you want to use?</label></div>
				<div class="flexrow" style="margin-bottom: 10px;"><label>Received ${damageReceived} damage (reduced by five times the spell level)?</label></div>
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
						icon: '<p> </p><img src = "icons/equipment/shield/heater-crystal-blue.webp" width="30" height="30"></>',
						label: `${optionName}`,
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
			await actor.update({[`system.spells.spell${slot}.value`]: getProperty(actor, `system.spells.spell${slot}.value`) - 1});
			
			// apply the defense
			const damageRemoved = slot * 5;
			await addDamageReduction(lastArg.itemId, actor.uuid, damageRemoved);
			await ChatMessage.create({
				content: `${actor.name} - used ${optionName} to stop ${damageRemoved} damage`,
				speaker: ChatMessage.getSpeaker({ actor: actor })});
			return true;
		}
		else
			return false;
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}

async function addDamageReduction(origin, actorId, amount) {
	const effectData = {
		label: optionName,
		icon: "icons/equipment/shield/heater-crystal-blue.webp",
		origin: origin,
		changes: [
			{
				key: 'flags.midi-qol.DR.all',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: `${amount}`,
				priority: 20
			}
		],
		flags: {
			dae: {
				selfTarget: false,
				stackable: "none",
				durationExpression: "",
				macroRepeat: "none",
				specialDuration: [
					"isAttacked"
				],
				transfer: false
			}
		},
		disabled: false
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actorId, effects: [effectData] });
}
