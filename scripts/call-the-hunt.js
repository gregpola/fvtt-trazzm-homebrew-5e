/*
	The beast within you grows so powerful that you can spread its ferocity to others and gain resilience from them joining your hunt. When you enter your rage, you can choose a number of other willing creatures you can see within 30 feet of you equal to your Constitution modifier (minimum of one creature). You gain 5 temporary hit points for each creature that accepts this feature. Until the rage ends, the chosen creatures can each use the following benefit once on each of their turns: when the creature hits a target with an attack roll and deals damage to it, the creature can roll a d6 and gain a bonus to the damage equal to the number rolled.

	You can use this feature a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest.
*/
const version = "10.0.0";
const optionName = "Call the Hunt";
const flagName = "call-the-hunt";
const timeFlag = "CallTheHuntTime";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	
	if (args[0].macroPass === "preItemRoll") {
		let rageEffect = actor.effects.find(i => i.label === "Rage");
		if (!rageEffect) {
			ui.notifications.error(`${optionName}: not raging`);
			return false;
		}
		
		return true;
	}	
	else if (args[0] === "on") {
		let maxTargets = Math.max(actor.system.abilities.con.mod, 1);
		
		// build available target's list
		let targetChoices = [];
		const allies = MidiQOL.findNearby(1, actorToken, 30);
		for (var i = 0; i < allies.length; i++) {
			targetChoices.push({ type: "checkbox", label: allies[i].name, value: allies[i].actor.uuid, options: "rageTargets" });
		}
		
		const menuOptions = {};
		menuOptions["buttons"] = [
			{ label: "Add to Hunt", value: true },
			{ label: "Cancel", value: false }
		];
		menuOptions["inputs"] = Array.from(targetChoices);
		let choices = await warpgate.menu(menuOptions, { title: `${optionName} - max of ${maxTargets}`, options: { height: "100%" } });
		let targetButtons = choices.buttons;
		
		if (!targetButtons) {
			return console.log("No targets selected");
		}

		let huntChoices = choices.inputs.filter(Boolean);
		if (!huntChoices || huntChoices.length < 1) {
			return console.log("No targets selected (2)");
		}
		
		if (huntChoices.length > maxTargets) {
			ui.notifications.error(`${optionName}: too many selections, ${maxTargets - huntChoices.length} will not join the hunt`);
		}
		
		// apply damage bonus to allies
		let packMembers = [];
		for (var i = 0; i < huntChoices.length && i < maxTargets; i++) {
			let tactor = MidiQOL.MQfromActorUuid(huntChoices[i]);
			if (tactor) {
				await applyDamageBonus(tactor, actor.uuid, lastArg.origin);
				packMembers.push(huntChoices[i]);
			}
			else {
				console.error(`Unable to locate actor: ${huntChoices[i]}`);
			}
		}
		
		// store actor id's for removal when Rage ends
		await actor.setFlag('world', flagName, {packMembers});

		// apply temp HP to barbarian
		const tempHP = Math.min(maxTargets, huntChoices.length) * 5;
		if(!actor.system.attributes.hp.temp || (actor.system.attributes.hp.temp < tempHP)) {
			await actor.update({ "system.attributes.hp.temp" : tempHP });
		}
		
	}
	else if (args[0] === "off") {
		await removeAllyEffects(actor);
	}
	else if (args[0] === "each") {
		let rageEffect = actor.effects.find(i => i.label === "Rage");
		if (!rageEffect) {
			await removeAllyEffects(actor);
		}
	}
	else if (args[0].macroPass === "DamageBonus") {
		// make sure it was an attack roll
		if (!["mwak", "rwak", "msak", "rsak"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName} - not an attack roll`);
			return {};
		}

		// Check for availability i.e. once per actors turn
		if (!isAvailableThisTurn(actor) || !game.combat) {
			return {};
		}

		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		await actor.setFlag('midi-qol', timeFlag, `${combatTime}`);
		const damageRoll = await new Roll('1d6').evaluate({ async: false });
		await game.dice3d?.showForRoll(damageRoll);
		return {damageRoll: `${damageRoll.total}`, flavor: `${optionName} Damage`};
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function isAvailableThisTurn(actor) {
	if (game.combat) {
	  const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
	  const lastTime = actor.getFlag("midi-qol", timeFlag);
	  if (combatTime === lastTime) {
		  console.log(`${optionName} already used this turn`);
		  return false;
	  }
	  
	  return true;
	}
	
	return false;
}

async function removeAllyEffects(actor) {
	// get the allies that joined the hunt
	let allies = actor.getFlag('world', flagName);
	if (allies && allies.packMembers) {
		for (var i = 0; i < allies.packMembers.length; i++) {
			let tactor = MidiQOL.MQfromActorUuid(allies.packMembers[i]);
			let optionEffect = tactor.effects.find(i => i.label === optionName);
			if (optionEffect) {
				await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tactor.uuid, effects: [optionEffect.id] }); 
			}
		}
	}
}

// Apply damage bonus to the target 
async function applyDamageBonus(targetActor, actorId, origin) {
	const effectData = {
		label: optionName,
		icon: "icons/commodities/treasure/horn-carved-banded.webp",
		origin: actorId,
		changes: [
			{
				key: 'flags.dnd5e.DamageBonusMacro',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: `ItemMacro.${origin}`,
				priority: 20
			}
		],
		flags: {
			dae: {
				selfTarget: false,
				stackable: "none",
				durationExpression: "",
				macroRepeat: "none",
				specialDuration: [],
				transfer: false
			}
		},
		disabled: false
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: [effectData] });
}
