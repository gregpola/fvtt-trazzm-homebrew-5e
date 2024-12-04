/*
	The bond with your wildfire spirit can save you from death. If the spirit is within 120 feet of you when you are reduced to 0 hit points and thereby fall Unconscious, you can cause the spirit to drop to 0 hit points. You then regain half your hit points and immediately rise to your feet.

	Once you use this feature, you can’t use it again until you finish a long rest.
*/
const version = "11.1";
const optionName = "Blazing Revival";
const spiritEffect = "Wildfire Spirit";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// make sure the actor is currently knocked out
		if (actor.system.attributes.hp.value > 0 ) {
			ui.notifications.error(`${optionName} - not knocked out`);
			return;
		}

		let effect = HomebrewHelpers.findEffect(actor, spiritEffect);
		if (effect) {
			// apply the heal
			const healAmount = actor.system.attributes.hp.max / 2;
			const healingType = "healing";						
			let healDamage = new Roll(`${healAmount}`).evaluate({ async: false });
			new MidiQOL.DamageOnlyWorkflow(actor, token, healDamage.total, healingType, [token], healDamage, { flavor: `(${CONFIG.DND5E.healingTypes[healingType]})`, itemCardId: lastArg.itemCardId, useOther: false });
			
			// remove unconscious and prone and Wildfire spirit
			await HomebrewEffects.removeEffectByName(actor, 'Incapacitated');
			await HomebrewEffects.removeEffectByName(actor, 'Prone');
			await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
		}
		else {
			ui.notifications.error(`${optionName} - no wildfire spirit found`);
		}
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
