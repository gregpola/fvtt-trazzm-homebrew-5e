const version = "11.0";
const optionName = "Crusher";
const lastArg = args[args.length - 1];
const effectLabel = "Crusher feat - Grants advantage on all attacks";

try {
	if (args[0].macroPass === "DamageBonus" && workflow.hitTargets.size > 0) {
		let targetToken = workflow.hitTargets.first();

		// make sure it's an allowed attack
		if (workflow.damageDetail.filter(i=>i.type === "bludgeoning").length < 1) {
			console.log(`${optionName} not allowed: not a bludgeoning attack`);
			return {};
		}
	
		// if a critical apply the debuff
		if (workflow.isCritical) {
			const effect_sourceData = {
				changes: [{ key: "flags.midi-qol.grants.advantage.attack.all", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: 1, priority: 2}],
				origin: lastArg.itemUuid,
				duration: game.combat ? { rounds: 1, turns:0, startRound: `${game.combat.round}`, startTurn: `${game.combat.turn}`, startTime: `${game.time.worldTime}`} : {seconds: 6, startTime: `${game.time.worldTime}`},
				icon: "icons/weapons/hammers/hammer-double-stone.webp",
				name: effectLabel,
				flags: {dae: {specialDuration: ['turnStartSource']}},
			}
			
			let effect = targetToken.actor.effects.find(ef => ef.name === effectLabel);
			if (effect) {
				await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [effect.id] });
			}
			await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: lastArg.hitTargetUuids[0], effects: [effect_sourceData] });
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
			let position = await getTokenMovePosition(targetToken, 5);
			if (!position.cancelled) {
				// check for collision
				const isAllowedLocation = canvas.effects.visibility.testVisibility({x: position.x, y: position.y}, {object: targetToken});
				if(!isAllowedLocation) {
					ui.notifications.error(`${optionName} - Cannot move the ${targetToken.name} on top of another token`)
					return;
				}
				
				// set the usage flag
				await actor.setFlag('midi-qol', 'crusherTime', `${combatTime}`);
				
				// move the token
				let newCenter = canvas.grid.getSnappedPosition(position.x - targetToken.width / 2, position.y - targetToken.height / 2, 1);
				const mutationData = { token: {x: newCenter.x, y: newCenter.y}};
				await warpgate.mutate(targetToken.document, mutationData, {}, {permanent: true});				
			}
		}
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

async function getTokenMovePosition(token, maxRange) {
	// Setup warpgate crosshairs
	const tokenCenter = token.center;
	let cachedDistance = 0;
	
	const checkDistance = async(crosshairs) => {
		while (crosshairs.inFlight) {
			// wait for initial render
			await warpgate.wait(100);
			const ray = new Ray( tokenCenter, crosshairs );
			const distance = canvas.grid.measureDistances([{ray}], {gridSpaces:true})[0]

			// only update if the distance has changed
			if (cachedDistance !== distance) {
			  cachedDistance = distance;     
			  if (distance > maxRange) {
				  crosshairs.icon = 'icons/svg/hazard.svg';
			  } else {
				  crosshairs.icon = token.document.texture.src;
			  }

			  crosshairs.draw();
			  crosshairs.label = `${distance} ft`;				  
			}
		}
	};

	const callbacks = {
		show: checkDistance
	};
		
	const config = {
		drawIcon: true,
		interval: token.width % 2 === 0 ? 1 : -1,
		size: token.w / canvas.grid.size
	};
	
	if (typeof token.document !== 'undefined') {
		config.drawIcon = true;
		config.icon = token.document.texture.src;
		config.label = token.name;
	}

	// Show warpgate crosshairs to pick desired destination
	const position = await warpgate.crosshairs.show(config, callbacks);
	if (cachedDistance > maxRange) {
		console.log(`getTokenMovePosition() - exceeded maximum range of ${maxRange} ft`);
		position.cancelled = true;
	}
	
	return position;
}
