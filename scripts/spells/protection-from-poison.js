/*
	You touch a creature and end the Poisoned condition on it. For the duration, the target has Advantage on saving
	throws to avoid or end the Poisoned condition, and it has Resistance to Poison damage.
*/
const optionName = "Protection from Poison";
const version = "14.5.0";

try {
    const targetToken = workflow.targets.first();
    if (args[0].macroPass === "postActiveEffects" && targetToken) {
        if (actor.statuses.has('poisoned')) {
            // remove the effects that contribute the removed condition
            let actorEffects = Array.from(targetToken.actor.allApplicableEffects());
            let removedEffects = actorEffects.filter(s => s.statuses.has('poisoned'));
            if (removedEffects) {
                const effectIdList = removedEffects.map(obj => obj.id);
                await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: targetToken.actor.uuid, effects: effectIdList});
            }

            await targetToken.actor.toggleStatusEffect('poisoned', {active: false});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
