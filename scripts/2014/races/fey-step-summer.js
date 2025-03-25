const version = "12.3.0";
const optionName = "Fey Step (Summer)";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// transport the caster
		const maxRange = item.system.range.value ?? 30;
		await HomebrewMacros.teleportToken(token, maxRange);

		await wait(1000);
		const potentialTargets = MidiQOL.findNearby(null, token, 5);
		if (potentialTargets.length === 0) {
			console.log(`${optionName} - no targets within 5 feet for flames`);
			return;
		}

		const pb = actor.system.attributes.prof;
		let damageRoll = await new Roll(`${pb}[fire]`).evaluate({async: false});
		await new MidiQOL.DamageOnlyWorkflow(actor, token.document, pb, "fire", potentialTargets,
			damageRoll, {flavor: `${optionName}`, itemCardId: args[0].itemCardId});
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); });}