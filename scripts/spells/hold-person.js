/*
	Handle the humanoid restriction
*/
const optionName = "Hold Person";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let failedCount = workflow.failedSaves.size;
        let removedData = [];

        for (let targetToken of workflow.failedSaves) {
            if (MidiQOL.typeOrRace(targetToken.actor) !== 'humanoid') {
                const targetActorEffects = Array.from(targetToken.actor.allApplicableEffects());
                const holdEffects = targetActorEffects.filter(eff => eff.name === optionName);
                if (holdEffects.length > 0) {
                    let effectIds = [];

                    for (let effect of holdEffects) {
                        const effectOrigin = await fromUuid(effect.origin);
                        if (effectOrigin.parent === actor) {
                            effectIds.push(effect.id);
                        }
                    }

                    if (effectIds.length > 0) {
                        failedCount--;
                        removedData.push({actorUuid: targetToken.actor.uuid, effectIds: effectIds});
                    }
                }
            }
        }

        if (failedCount < 1) {
            await HomebrewEffects.removeConcentrationEffectByName(actor, optionName);
        }
        else {
            for (let data of removedData) {
                await MidiQOL.socket().executeAsGM('removeEffects', {
                    'actorUuid': data.actorUuid,
                    'effects': data.effectIds
                });
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
