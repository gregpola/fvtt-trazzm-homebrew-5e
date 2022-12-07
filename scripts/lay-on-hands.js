const version = "0.1.1";
const resourceName = "Lay on Hands";
let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
let actor = workflow.actor;
let target = args[0]?.targets[0];
let tactor = target?.actor;
let resKey = findResource(actor);

try {
	
	if (args[0].macroPass === "preambleComplete") {
		// check valid target
		if (!target || ["undead", "construct"].some(type => (tactor?.data.data.details.type?.value || "").toLowerCase().includes(type))) {
			return ui.notifications.error(`Please select a valid target.`);
		}
		
		// check resources
		if (!resKey) {
			return ui.notifications.error(`${resourceName} - no resource found`);
		}

		const available = actor.data.data.resources[resKey].value;
		if (!available) {
			return ui.notifications.error(`${resourceName} - resource pool is empty`);
		}
		
		// calculate the maximum heal possible
		const maxhp = Number(tactor?.data.data.attributes.hp.max);
		const currenthp = Number(tactor?.data.data.attributes.hp.value);
		const targetDamage = maxhp - currenthp;
		const maxHeal = Math.min(targetDamage, available);
		
		// ask which type of healing
		new Dialog({
		  title: "Lay on Hands",
		  content: `<p>Which <strong>Action</strong> would you like to do? (${available} points remaining)</p>
			<p>If Heal, how many hp to heal? (target is off ${targetDamage})<input id="mqlohpoints" type="number" min="0" step="1.0" max="${maxHeal}"></input></p>`,
		  buttons: {
			heal: {
				label: "<p>Heal</p>",
				icon: '<img src = "icons/magic/life/cross-flared-green.webp" width="50" height="50"></>',
				callback: async (html) => {
					const pts = Math.clamped(Math.floor(Number(html.find('#mqlohpoints')[0].value)), 0, maxHeal);
					const damageRoll = await new Roll(`${pts}`).evaluate({ async: true });
					await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "healing", [target], damageRoll, {flavor: "Lay on Hands", itemCardId: args[0].itemCardId});
					await consumeResource(actor, resKey, pts);
				}
			},
			cureDisease: {
				label: "Cure Disease",
				icon: '<img src = "icons/skills/wounds/blood-cells-disease-green.webp" width="50" height="50"></>',
				callback: async (html) => {
					let effect = tactor.effects.find( i=> i.data.label === "Diseased");
					if (effect) {
						let newEffects = tactor.effects.filter( i=> i.data.label !== "Diseased");
						await tactor.update({"effects": newEffects});
						await consumeResource(actor, resKey, 5);
					}
					else {
						console.error('${resourceName} - target is not diseased');
					}
				}
			},
			neutralizePoison: {
				label: "Neutralize Poison",
				icon: '<img src = "icons/skills/toxins/symbol-poison-drop-skull-green.webp" width="50" height="50"></>',
				callback: async (html) => {
					let effect = tactor.effects.find( i=> i.data.label === "Poisoned");
					if (effect) {
						let newEffects = tactor.effects.filter( i=> i.data.label !== "Poisoned");
						await tactor.update({"effects": newEffects});
						await consumeResource(actor, resKey, 5);
					}
					else {
						console.error('${resourceName} - target is not diseased');
					}
				}
			},
			abort: {
			  icon: '<i class="fas fa-cross"></i>',
			  label: "Cancel",
			  callback: () => { return; }
			},
		  },
		  default: "heal",
		}).render(true);
	}
	
} catch (err)  {
    console.error(`${resourceName} ${version}`, err);
}

// find the resource
function findResource(actor) {
	if (actor) {
		for (let res in actor.data.data.resources) {
			if (actor.data.data.resources[res].label === resourceName) {
			  return res;
			}
		}
	}
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			ChatMessage.create({'content': '${resourceName} : Out of resources'});
			return;
		}
		const pointsMax = actor.data.data.resources[resKey].max;
		let resources = duplicate(actor.data.data.resources); // makes a duplicate of the resources object for adjustments.
		resources[resKey].value = Math.clamped(points - cost, 0, pointsMax);
		await actor.update({"data.resources": resources});    // do the update to the actor.
	}
}
