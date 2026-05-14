/*
	As an action, you can assist your master in combat against one enemy. Until the start of your next turn, your master
	has advantage on all attack rolls against the target of your storm mark.
*/
const optionName = "Storm Mark";
const version = "13.5.0";
const effectKey = 'flags.automated-conditions-5e.grants.attack.advantage';

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.targets.first();
        const summonFlag = actor.getFlag('dnd5e', 'summon');
        if (targetToken && summonFlag) {
            const summonOrigin = await fromUuid(summonFlag.origin);
            if (summonOrigin) {
                const owner = summonOrigin.parent;

                if (owner) {
                    const ownerToken = MidiQOL.tokenForActor(owner);
                    if (ownerToken) {
                        // update the effect on the target
                        //const markedEffect = targetToken.actor.effects.find(e => e.name === 'markedEffect');
                        const markedEffect = await findEffectBySourceActor(targetToken.actor, 'Storm Marked', actor);
                        if (markedEffect) {
                            const theChange = markedEffect.changes.find(change => change.key === effectKey);
                            if (theChange) {
                                await markedEffect.update({
                                    changes: [{
                                        key: effectKey,
                                        value: `'${ownerToken.id}' === tokenId`,
                                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                        priority: 20
                                    }]});

                            }
                        }
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function findEffectBySourceActor(actor, effectName, sourceActor) {
    const targetActorEffects = Array.from(actor.allApplicableEffects());
    const matchingEffects = targetActorEffects.filter(eff => eff.name === effectName);

    if (matchingEffects.length > 0) {
        for (let effect of matchingEffects) {
            if (effect.origin) {
                const effectOrigin = await fromUuid(effect.origin);
                if (effectOrigin) {
                    let parent = effectOrigin.parent;
                    while (parent && parent !== sourceActor) {
                        parent = parent.parent;
                    }

                    if (parent) {
                        return effect;
                    }
                }
            }
        }
    }

    return undefined;
}
