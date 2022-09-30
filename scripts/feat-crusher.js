const version = "0.1.0";

try {
	// Watch for a hit
	if (args[0].hitTargets?.length === 0) return;

	let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
	let actor = workflow?.actor;
	let ttoken = canvas.tokens.get(args[0].hitTargets[0].object.id);
	const tactor = args[0].hitTargets[0].actor;
	
	// verify needed data
	if (!actor || !ttoken || !tactor) {
		console.error("Missing data for Crusher");
		return;
	}

	// make sure it's an allowed attack
	if (workflow.damageDetail.filter(i=>i.type === "bludgeoning").length < 1) {
		console.log("Crusher not allowed: not bludgeoning");
		return;
	}
	
	// if a critical apply the debuff
	if(workflow.isCritical) {
		const effect_sourceData = {
			changes: [{ key: "flags.midi-qol.grants.advantage.attack.all", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: 1, priority: 20 }
			],
			origin: args[0].itemUuid,
			duration: game.combat ? { rounds: 1, turns:0, startRound: `${game.combat.round}`, startTurn: `${game.combat.turn}`, startTime: `${game.time.worldTime}`} : {seconds: 6, startTime: `${game.time.worldTime}`},
			icon: "systems/dnd5e/icons/skills/weapon_42.jpg",
			label: "Crusher feat - Grants advantage on all attacks",
			flags: {dae: {specialDuration: ['turnStartSource']}},
		}
		if (tactor.effects.find(i=>i.data.label==="Crusher feat - Grants advantage on all attacks")) {
			let effect = tactor.effects.find(i=>i.data.label==="Crusher feat - Grants advantage on all attacks");
			await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: args[0].hitTargetUuids[0], effects: [effect.id] });
		}
		await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].hitTargetUuids[0], effects: [effect_sourceData] });
	}
	
	// Check for availability i.e. once per actors turn
	if (!isAvailableThisTurn() || !game.combat) {
		return;
	}

	// Ask for move
	const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;

	let dialog = new Promise((resolve, reject) => {
		new Dialog({
			title: "Crusher's feat move target 5ft",
			content: "Do you want to move the target 5ft in a direction of your choice?",
			buttons: {
				one: {
					icon: '<i class="fas fa-check"></i>',
					label: "Yes",
					callback: () => resolve(true)
				},
				two: {
					icon: '<i class="fas fa-times"></i>',
					label: "No",
					callback: () => {resolve(false)}
				}
			},
			default: "two"
		}).render(true);
	});

	let result = await dialog;
	if(result) { 
		applyTargetMove(ttoken, combatTime) 
	}

} catch (err) {
    console.error(`Crusher feat ${version}`, err);
}

function isAvailableThisTurn() {
	if (game.combat) {
	  const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
	  const lastTime = actor.getFlag("midi-qol", "crusherTime");
	  if (combatTime === lastTime) {
	   console.log("Crusher move: already moved for Crusher this turn");
	   return false;
	  }
	  
	  return true;
	}
	
	return false;
}

async function applyTargetMove(ttoken, time) {
	const sourceCenter = args[0].hitTargets[0].object.center;
	const maxRange = 5;
	console.log(sourceCenter)
	let cachedDistance = 0;
	let distance = 0;
	let ray;
	
	const checkDistance = async (crosshairs) => {
	   while (crosshairs.inFlight) {
	       await warpgate.wait(100);
	       ray = new Ray(sourceCenter, crosshairs);
           distance = canvas.grid.measureDistances([{ ray }], { gridSpaces: true })[0]
           if(canvas.grid.isNeighbor(ray.A.x/canvas.grid.w,ray.A.y/canvas.grid.w,ray.B.x/canvas.grid.w,ray.B.y/canvas.grid.w) === false || canvas.scene.tokens.filter(i=>i.object.center.x===ray.B.x).filter(t=>t.object.center.y===ray.B.y).length > 0) {
                crosshairs.icon = 'icons/svg/hazard.svg'
            } 
            else {
                crosshairs.icon = args[0].hitTargets[0].object.data.img
            }
            crosshairs.draw()
            crosshairs.label = `${distance}/${maxRange} ft`
	   }
    }
	
	const callbacks = {
            show: checkDistance
        }
    let {x,y,cancelled} = await warpgate.crosshairs.show({ size: args[0].hitTargets[0].data.width, icon: args[0].hitTargets[0].object.data.img, label: '0 ft.', interval: -1 }, callbacks);
    
	if (distance > 5) {
        ui.notifications.error(`${name} has a maximum range of ${maxRange} ft. Pick another position`)
        return cancelled;
    }
    if(canvas.scene.tokens.filter(i=>i.object.center.x===ray.B.x).filter(t=>t.object.center.y===ray.B.y).length > 0) {
        ui.notifications.error(`Cannot move the ${args[0].hitTargets[0].object.name} on top of another token`)
        return cancelled;
    }
    if(cancelled) return;

	await actor.setFlag('midi-qol', 'crusherTime', `${time}`);
	
	// move the target
	const targetDoc = ttoken.document;
	let newCenter = ray.project(1);
	newCenter = canvas.grid.getSnappedPosition(newCenter.x - targetDoc.object.w / 2, newCenter.y - targetDoc.object.h / 2, 1);
	const isAllowedLocation = canvas.sight.testVisibility({x: newCenter.x, y: newCenter.y}, {object: targetDoc.Object});
	if(!isAllowedLocation) return ChatMessage.create({content: `${targetDoc.name} hits a wall`});
	console.log("Moving token to: " + newCenter);
	const mutationData = { token: {x: newCenter.x, y: newCenter.y}};
	await warpgate.mutate(targetDoc, mutationData, {}, {permanent: true});
}
