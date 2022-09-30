const version = "0.1.0";
const resourceName = "Superiority Dice";
const optionName = "Sweeping Attack";

try {
	if (args[0].macroPass === "DamageBonus") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		let atoken = canvas.tokens.get(args[0].tokenId);
		let target = args[0].hitTargets[0];
		let ttoken = canvas.tokens.get(target.object.id);

		// make sure it's an allowed attack
		const at = args[0].item?.data?.actionType;
		if (!at || !["mwak"].includes(at)) {
			console.log(`${optionName}: not an eligible attack: ${at}`);
			return {};
		}

		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			return ui.notifications.error(`${resourceName} - no resource found`);
		}

		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			console.log(`${resourceName} - resource pool is empty`);
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
						icon: '<p> </p><img src = "icons/skills/melee/strike-slashes-red.webp" width="50" height="50"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
						label: "<p>No</p>",
						callback: () => { resolve(false) }
					}
				},
				default: "two"
			}).render(true);
		});
		
		let useManeuver = await dialog;
		if (useManeuver) {
			consumeResource(actor, resKey, 1);
			const supDie = actor.data.data.scale["battle-master"]["superiority-die"];
			
			// find nearby foes
			const potentialTargets = MidiQOL.findNearby(null, ttoken, 5, null);
			if (!potentialTargets) {
				return ui.notifications.error(`${resourceName} - no targets within reach`);
			}
			
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
							let hitSuccess = args[0].attackTotal >= newTarget.actor.data.data.attributes.ac.value;
							
							// apply damage to the new target
							if (hitSuccess) {
								let damageType = args[0].item.data.damage.parts[0][1];
								// TODO apply damage to the new target
								//return {damageRoll: `${supDie}[${damageType}]`, flavor: optionName};
								const damageRoll = await new Roll(`${supDie}[${damageType}]`).evaluate({ async: true });
								if (game.dice3d) game.dice3d.showForRoll(damageRoll);
								
								const workflowItemData = duplicate(workflow.item.data);
								workflowItemData.data.target = { value: 1, units: "", type: "creature" };
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

function findResource(actor) {
	for (let res in actor.data.data.resources) {
		if (actor.data.data.resources[res].label === resourceName) {
		  return res;
		}
    }
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const points = actor.data.data.resources[resKey].value;
		const pointsMax = actor.data.data.resources[resKey].max;
		let resources = duplicate(actor.data.data.resources);
		resources[resKey].value = Math.clamped(points - cost, 0, pointsMax);
		await actor.update({"data.resources": resources});
	}
}
