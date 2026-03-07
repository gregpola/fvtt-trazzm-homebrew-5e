/*
	Choose a creature that you can see within range. Positive energy washes through the target, restoring 70 Hit Points.
	This spell also ends the Blinded, Deafened, and Poisoned conditions on the target.

	Using a Higher-Level Spell Slot. The healing increases by 10 for each spell slot level above 6.
*/
const version = "13.5.0";
const optionName = "Heal";
const condition_list = new Set(["blinded", "deafened", "poisoned"]);

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.targets) {
            // find all applicable effects
            let actorEffects = Array.from(targetToken.actor.allApplicableEffects());
            let blindedEffects = actorEffects.filter(s => s.statuses.has('blinded'));
            let deafenedEffects = actorEffects.filter(s => s.statuses.has('deafened'));
            let poisonedEffects = actorEffects.filter(s => s.statuses.has('poisoned'));

            // remove effects
            if (blindedEffects) {
                const effectIdList = blindedEffects.map(obj => obj.id);
                await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: targetToken.actor.uuid, effects: effectIdList});
            }

            if (deafenedEffects) {
                const effectIdList = deafenedEffects.map(obj => obj.id);
                await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: targetToken.actor.uuid, effects: effectIdList});
            }

            if (poisonedEffects) {
                const effectIdList = poisonedEffects.map(obj => obj.id);
                await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: targetToken.actor.uuid, effects: effectIdList});
            }

            // clear any statuses
            condition_list.forEach(async function(value) {
                await targetToken.actor.toggleStatusEffect(value.toLowerCase(), {active: false});
            });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
