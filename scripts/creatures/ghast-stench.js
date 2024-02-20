/*
	Any creature that starts its turn within 5 feet of the ghast must succeed on a DC 10 Constitution saving throw or be
	poisoned until the start of its next turn. On a successful saving throw, the creature is immune to the ghast's
	Stench for 24 hours.
 */
const version = "11.1";
const optionName = "Ghast Stench";
const immunityEffect = "ghast-stench-immunity";
const saveFlavor = `${CONFIG.DND5E.abilities["wis"].label} DC${10} ${optionName}`;

try {
	if (args[0] === "on") {
		console.log(`${optionName}: ON`);
	}
	else if (args[0] === "off") {
		console.log(`${optionName}: OFF`);
	}
	else if (args[0] === "each") {
		console.log(`${optionName}: EACH`);
		// actor is the target
		// source actor item.actor
		if (!hasImmunity(actor, item.actor)) {
			let saveRoll = await actor.rollAbilitySave("con", {flavor: saveFlavor, damageType: "poison"});
			if (saveRoll.total < 10) {
				await applyPoisonedEffect(actor, item.actor);
			}
			else {
				await addImmunity(actor, item.actor);
			}
		}
	}

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}

function hasImmunity(targetActor, ghastActor) {
	const hasImmunity = targetActor.effects?.find(ef => ef.name === immunityEffect && ef.origin === ghastActor.uuid);
	const isGhast = targetActor.items.find(i => i.name === optionName);
	return hasImmunity || isGhast;
}

async function addImmunity(targetActor, ghastActor) {
	const effectData = {
		name: immunityEffect,
		icon: "icons/magic/nature/root-vine-caduceus-healing.webp",
		origin: ghastActor.uuid,
		duration: {startTime: game.time.worldTime, seconds: 86400},
		changes: [],
		disabled: false
	}
	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: [effectData] });
}

async function applyPoisonedEffect(targetActor, ghastActor) {
	let effectData = [{
		name: optionName,
		icon: 'icons/consumables/potions/potion-jar-corked-labeled-poison-skull-green.webp',
		origin: ghastActor.uuid,
		transfer: false,
		disabled: false,
		duration: {startTime: game.time.worldTime, seconds: 6},
		changes: [
			{ key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Poisoned", priority: 20 }
		],
		flags: {
			dae: {
				selfTarget: false,
				stackable: "none",
				durationExpression: "",
				macroRepeat: "none",
				specialDuration: ["turnStart"],
				transfer: false
			}
		},
	}];
	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: effectData });
}
