const version = "10.0.0";
const resourceName = "Superiority Dice";
const optionName = "Sweeping Attack";

const lastArg = args[args.length - 1];

try {
	if (lastArg.macroPass === "DamageBonus") {
		let workflow = MidiQOL.Workflow.getWorkflow(lastArg.uuid);
		let actor = workflow?.actor;
		let atoken = canvas.tokens.get(lastArg.tokenId);
		let target = lastArg.hitTargets[0];
		let ttoken = canvas.tokens.get(target.object.id);

		// make sure it's an allowed attack
		if (!["mwak"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}

		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			return ui.notifications.error(`${resourceName} - no resource found`);
		}

		const points = actor.system.resources[resKey].value;
		if (!points) {
			console.log(`${resourceName} - resource pool is empty`);
			return {};
		}
						
		// find nearby foes
		const potentialTargets = MidiQOL.findNearby(null, ttoken, 5);
		if (!potentialTargets) {
			console.log(`${resourceName} - no targets near your original target`);
			return {};
		}
	
		// ask if they want to use the option
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `Combat Maneuver: ${optionName}`,
				content: `<p>Use ${optionName}? (${points} superiority dice remaining)</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/skills/melee/strike-slashes-red.webp" width="30" height="30"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="30" height="30"></>',
						label: "<p>No</p>",
						callback: () => { resolve(false) }
					}
				},
				default: "two"
			}).render(true);
		});
		
		let useManeuver = await dialog;
		if (useManeuver) {
			await consumeResource(actor, resKey, 1);
			
			// ask which one to attack, will fail if they are too far away
			let newTarget = null;
			let target_content = ``;
			for (let t of potentialTargets) {
				target_content += `<option value=${t.id}>${t.name}</option>`;
			}			

			let content = `
				<div class="form-group">
				  <p><label>Available Targets : </label></p>
				  <p><select name="targets">
					${target_content}
				  </select></p>
				</div>`;
			
			new Dialog({
				title: "Choose your target",
				content,
				buttons:
				{
					Ok:
					{
						label: `Ok`,
						callback: async (html) => {
							let itemId = html.find('[name=targets]')[0].value;
							let newTarget = canvas.tokens.get(itemId);
			
							// check if the attack roll hits the new target
							let hitSuccess = lastArg.attackTotal >= newTarget.actor.system.attributes.ac.value;
							
							// apply damage to the new target
							if (hitSuccess) {
								const fullSupDie = actor.system.scale["battle-master"]["superiority-die"];
								let damageType = lastArg.item.system.damage.parts[0][1];
								const damageRoll = await new Roll(`${fullSupDie.die}[${damageType}]`).evaluate({ async: false });
								if (game.dice3d) game.dice3d.showForRoll(damageRoll);
								
								const workflowItemData = duplicate(workflow.item);
								workflowItemData.system.target = { value: 1, units: "", type: "creature" };
								workflowItemData.name = `${optionName} : secondary damage`;

								await new MidiQOL.DamageOnlyWorkflow(
									actor,
									atoken.data,
									damageRoll.total,
									damageType,
									[newTarget],
									damageRoll,
									{
										flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`,
										itemCardId: "new",
										itemData: workflowItemData,
										isCritical: false,
									}
								);
							}

							await consumeResource(actor, resKey, 1);
						}
					},
					Cancel:
					{
						label: `Cancel`
					}
				}
			}).render(true);
		}
	}
} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
}

// find the resource matching this feature
function findResource(actor) {
	if (actor) {
		for (let res in actor.system.resources) {
			if (actor.system.resources[res].label === resourceName) {
			  return res;
			}
		}
	}
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const {value, max} = actor.system.resources[resKey];
		if (!value) {
			ChatMessage.create({'content': '${resourceName} : Out of resources'});
			return false;
		}
		
		const resources = foundry.utils.duplicate(actor.system.resources);
		const resourcePath = `system.resources.${resKey}`;
		resources[resKey].value = Math.clamped(value - cost, 0, max);
		await actor.update({ "system.resources": resources });
		return true;
	}
}
