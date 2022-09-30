const version = "0.1.0";
const resourceName = "Superiority Dice";
const optionName = "Menacing Attack";

try {
	if (args[0].macroPass === "DamageBonus") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		let target = args[0].targets[0];
		let tactor = target?.actor;
		
		// validate targeting
		if (!actor || !target) {
		  console.log(`${optionName}: no target selected`);
		  return {};
		}

		// make sure it's an allowed attack
		const at = args[0].item?.data?.actionType;
		if (!at || !["mwak","rwak"].includes(at)) {
			console.log(`${optionName}: not an eligible attack: ${at}`);
			return {};
		}
		
		// make sure they have superiority dice remaining
		let resKey = findResource(actor);
		if (!resKey) {
			console.log(`${optionName}: no resource found`);
			return {};
		}
		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			console.log(`${optionName}: out of resource`);
			return {};
		}
		
		// ask if they want to use Goading Attack
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `Combat Maneuver: ${optionName}`,
				content: `<p>Use ${optionName}? (${points} superiority dice remaining)</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/magic/control/fear-fright-monster-green.webp" width="50" height="50"></>',
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
		
		let useGA = await dialog;
		if (useGA) {
			let used = await decrimentSuperiorityDice(actor, resKey);
			const supDie = actor.data.data.scale["battle-master"]["superiority-die"].substr(1);
			
			const dc = 8 + actor.data.data.attributes.prof + actor.data.data.abilities.str.mod; // or dex
			const flavor = `${CONFIG.DND5E.abilities["wis"]} DC${dc} ${optionName || ""}`;
			let saveRoll = (await tactor.rollAbilitySave("wis", {flavor})).total;
			if (saveRoll < dc) {
				await markAsFrightened(tactor.uuid,actor.uuid);
			}
			
			// add damage bonus
			const diceMult = args[0].isCritical ? 2: 1;
			let damageType = args[0].item.data.damage.parts[0][1];
			return {damageRoll: `${diceMult}${supDie}[${damageType}]`, flavor: optionName};
		}
		
	}

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
}

function decrimentSuperiorityDice(actor, resKey) {
	const points = actor.data.data.resources[resKey].value;
	if (!points) {
		ui.notifications.error(`${resourceName} - resource pool is empty`);
		return false;
	}
	
	consumeResource(actor, resKey, 1);
	return true;
}

async function markAsFrightened(targetId, actorId) {
	const effectData = {
		label: "Frightened",
		icon: "icons/magic/control/fear-fright-monster-green.webp",
		origin: actorId,
		changes: [
			{
				key: 'macro.CE',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: "Frightened",
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
					"turnEndSource"
				],
				transfer: false
			}
		},
		disabled: false
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetId, effects: [effectData] });
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
