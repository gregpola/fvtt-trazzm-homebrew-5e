/*
	As an action, you present your holy symbol and speak a prayer censuring fiends and undead, using your Channel Divinity.
	Each fiend or undead that can see or hear you within 30 feet of you must make a Wisdom saving throw. If the creature
	fails its saving throw, it is turned for 1 minute or until it takes damage.

	A turned creature must spend its turns trying to move as far away from you as it can, and it can’t willingly move to
	a space within 30 feet of you. It also can’t take reactions. For its action, it can use only the Dash action or try
	to escape from an effect that prevents it from moving. If there’s nowhere to move, the creature can use the Dodge action.
*/
const version = "12.3.0";
const optionName = "Turn the Unholy";
const targetTypes = ["undead", "fiend"];

const resistanceEffectData = {
	name: "Turn Advantage",
	origin: workflow.item.uuid,
	icon: "icons/skills/melee/shield-damaged-broken-orange.webp",
	changes: [{
		key: "flags.midi-qol.advantage.ability.save.wis",
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
};


try {
	if (args[0].macroPass === "preambleComplete") {
		let validTargets = [];

		for (let t of workflow.targets) {
			// skip non-undead targets
			if (!targetTypes.some(type => (MidiQOL.typeOrRace(t.actor) || "").toLowerCase().includes(type))) continue;
			if (HomebrewHelpers.hasTurnImmunity(t.actor)) continue;

			// skip dead targets
			if (t.actor.system.attributes.hp.value < 1) continue;

			// add resistance effect
			if (HomebrewHelpers.hasTurnResistance(t.actor)) {
				await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: t.actor.uuid, effects: [resistanceEffectData]});
			}

			validTargets.push(t);
		}

		HomebrewHelpers.updateTargets(validTargets);

	}

} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}
