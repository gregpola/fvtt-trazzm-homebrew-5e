/*
	Any creature that starts its turn within 5 feet of the ghast must succeed on a DC 10 Constitution saving throw or be
	poisoned until the start of its next turn. On a successful saving throw, the creature is immune to the ghast's
	Stench for 24 hours.
 */
const version = "12.3.0";
const optionName = "Ghast Stench";
const immunityEffect = "ghast-stench-immunity";
const saveDC = 10;
const saveFlavor = `${CONFIG.DND5E.abilities["wis"].label} DC${saveDC} ${optionName}`;

try {
	if (args[0] === "on") {
	}
	else if (args[0] === "off") {
	}
	else if (args[0] === "each") {
		if (!hasImmunity(actor, item.actor)) {
			let saveRoll = await actor.rollAbilitySave("con", {flavor: saveFlavor, damageType: "poison"});
			if (saveRoll.total < saveDC) {
				await HomebrewEffects.applyPoisonedEffect(actor, macroItem.uuid);
			}
			else {
				await addImmunity(actor);
			}
		}
	}
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}

async function addImmunity(targetActor) {
	const effectData = {
		name: immunityEffect,
		icon: "icons/magic/nature/root-vine-caduceus-healing.webp",
		origin: macroItem.uuid,
		duration: {startTime: game.time.worldTime, seconds: 86400},
		changes: [],
		disabled: false
	}
	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: [effectData] });
}

function hasImmunity(targetActor, sourceActor) {
	const hasImmunity = targetActor.effects?.find(ef => ef.name === immunityEffect && ef.origin === macroItem.uuid);
	const hasPoisonImmunity = actor.system.traits.di.value.has('poison');
	return hasImmunity || hasPoisonImmunity || (targetActor === sourceActor);
}
