/*
	As an action, you present your holy symbol and speak a prayer of denunciation, using your Channel Divinity. Choose
	one creature within 60 feet of you that you can see. That creature must make a Wisdom saving throw, unless it is
	immune to being Frightened. Fiends and undead have disadvantage on this saving throw.

	On a failed save, the creature is Frightened for 1 minute or until it takes any damage. While frightened, the creature’s
	speed is 0, and it can’t benefit from any bonus to its speed.

	On a successful save, the creature’s speed is halved for 1 minute or until the creature takes any damage.
 */
const version = "12.3.0";
const optionName = "Abjure Enemy";

const disadvantageEffect = {
	name: `${optionName} - save disadvantage`,
	origin: workflow.item.uuid,
	icon: "icons/skills/melee/shield-damaged-broken-orange.webp",
	changes: [{
		key: "flags.midi-qol.disadvantage.ability.save.wis",
		mode: 5,
		priority: 20,
		value: true
	}],
	duration: {
		turns: 1
	},
	flags: {
		dae: {
			specialDuration: ['isSave']
		}
	}
}

const halfMovementEffect = {
	name: `${optionName} - half movement`,
	icon: "icons/magic/control/fear-fright-monster-purple-blue.webp",
	origin: workflow.item.uuid,
	duration: {startTime: game.time.worldTime, seconds: 60},
	changes: [
		{
			key: 'system.attributes.movement.all',
			mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
			value: '* 0.5',
			priority: 20
		}
	],
	flags: {
		dae: {
			specialDuration: ['isDamaged']
		}
	},
	disabled: false
}


try {
	if (args[0].macroPass === "preambleComplete") {
		let validTargets = [];

		for (let t of workflow.targets) {
			// skip ineligible targets
			if (HomebrewHelpers.hasConditionImmunity(t.actor, "frightened")) continue;
			if (t.actor.system.attributes.hp.value < 1) continue;

			// check for disadvantage
			if (["undead", "fiend"].includes(MidiQOL.typeOrRace(t.actor))) {
				await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: t.actor.uuid, effects: [disadvantageEffect]});
			}

			validTargets.push(t);
		}

	}
	else if (args[0].macroPass === "postSave") {
		// Handle the saved actors that get half movement
		let targets = workflow.saves;
		if (targets && targets.size > 0) {
			for (let t of targets) {
				await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: t.actor.uuid, effects: [halfMovementEffect]});
			}
		}
	}
	
} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}
