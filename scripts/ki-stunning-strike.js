/*
	Starting at 5th level, you can interfere with the flow of ki in an opponent's body. When you hit another creature with a melee weapon attack, you can spend 1 ki point to attempt a stunning strike. The target must succeed on a Constitution saving throw or be stunned until the end of your next turn.
*/	
const version = "10.0.0";
const resourceName = "Ki Points";
const optionName = "Stunning Strike";
const optionCost = 1;

try {
	const lastArg = args[args.length - 1];
		
	if (args[0].macroPass === "DamageBonus") {
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const targetActor = lastArg.hitTargets[0].actor;
		const targetToken = game.canvas.tokens.get(lastArg.hitTargets[0].id);

		// make sure it's an allowed attack
		if (!["mwak"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName} not allowed: not an mwak`);
			return;
		}

		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			console.log(`${optionName}: ${resourceName}: - no resource found`);
			return {};
		}

		// check available points
		const points = actor.system.resources[resKey].value;
		if (!points) {
			console.log(`${optionName}: ${resourceName}: - out of resources`);
			return {};
		}
				
		if (points < optionCost) {
			console.log(`${optionName}: ${resourceName} - not enough points (need ${optionCost})`);
			return {};
		}
		
		let dialog = new Promise((resolve, reject) => {
		  new Dialog({
		  // localize this text
		  title: optionName,
		  content: `<p>Use Stunning Strike? (${points} Ki available)</p>`,
		  buttons: {
			  one: {
				  icon: '<i class="fas fa-check"></i>',
				  label: "Yes",
				  callback: () => { resolve(true) }
			  },
			  two: {
				  icon: '<i class="fas fa-times"></i>',
				  label: "No",
				  callback: () => { resolve(false) }
			  }
		  },
		  default: "two"
		  }).render(true);
		});
	   let useFeature = await dialog;

		if (useFeature) {
			const abilityBonus = actor.system.abilities.wis.mod;
			const dc = 8 + actor.system.attributes.prof + abilityBonus;
			const flavor = `${CONFIG.DND5E.abilities["con"]} DC${dc} ${optionName || ""}`;
			
			let saveRoll = await targetActor.rollAbilitySave("con", {flavor});
			await game.dice3d?.showForRoll(saveRoll);
			if (saveRoll.total < dc) { 
				// Apply stunned
				const effectData = {
					label: "Stunned",
					icon: "modules/dfreds-convenient-effects/images/stunned.svg",
					origin: actor.uuid,
					duration: {startTime: game.time.worldTime, seconds: 60},
					changes: [
						{
							key: 'macro.CE',
							mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
							value: "Stunned",
							priority: 20
						}
					],
					flags: {
						dae: {
							selfTarget: false,
							stackable: "none",
							durationExpression: "",
							macroRepeat: "none",
							specialDuration: ["turnEndSource"],
							transfer: false
						}
					},
					disabled: false
				};
				
				await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: [effectData] });
			}
			
			await consumeResource(actor, resKey, optionCost);
		}
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
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
