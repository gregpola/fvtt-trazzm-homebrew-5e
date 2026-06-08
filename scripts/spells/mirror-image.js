/*
    Three illusory duplicates of yourself appear in your space. Until the spell ends, the duplicates move with you and
    mimic your actions, shifting position so it’s impossible to track which image is real.

    Each time a creature hits you with an attack roll during the spell’s duration, roll a d6 for each of your remaining
    duplicates. If any of the d6s rolls a 3 or higher, one of the duplicates is hit instead of you, and the duplicate is
    destroyed. The duplicates otherwise ignore all other damage and effects. The spell ends when all three duplicates
    are destroyed.

    A creature is unaffected by this spell if it has the Blinded condition, Blindsight, or Truesight.
*/
const optionName = "Mirror Image";
const version = "14.5.1";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "mirror-image-count";

try {
    if (args[0].macroPass === "postActiveEffects") {
        await actor.setFlag(_flagGroup, _flagName, 3);
    }
    else if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isHit") {
        let spellEffect = HomebrewEffects.findEffect(actor, "Mirror Image");
        if (spellEffect) {
            // check the attacking actor for unaffected traits
            const tokenDistance = MidiQOL.computeDistance(token, workflow.token);
            const isBlind = workflow.actor.statuses.has("blinded"); // Infinity
            if (isBlind) {
                console.log(`${optionName} - attacker is blind`);
                return;
            }

            let isBlindsight = workflow.token.detectionModes.blindsight?.enabled;
            if (isBlindsight) {
                isBlindsight = workflow.token.detectionModes.blindsight.range >= tokenDistance;
            }
            if (isBlindsight) {
                console.log(`${optionName} - attacker has blind sight`);
                return;
            }

            let isTruesight = workflow.token.detectionModes.seeAll?.enabled;
            if (isTruesight) {
                isTruesight = workflow.token.detectionModes.seeAll.range >= tokenDistance;
            }
            if (isTruesight) {
                console.log(`${optionName} - attacker has true sight`);
                return;
            }

            let duplicates = actor.getFlag(_flagGroup, _flagName);
            if (duplicates) {
                let hitDuplicate = false;
                for (let j = 0; j < duplicates; j++) {
                    let checkRoll = await new Roll('1d6').evaluate();
                    if (checkRoll.total >= 3) {
                        hitDuplicate = true;
                        break;
                    }
                }

                if (hitDuplicate) {
                    const newImageCount = duplicates - 1;
                    if (newImageCount === 0) {
                        await actor.unsetFlag(_flagGroup, _flagName);
                        await MidiQOL.socket().executeAsGM('removeEffects', {
                            actorUuid: actor.uuid,
                            effects: [spellEffect.id]
                        });
                    }
                    else {
                        await actor.setFlag(_flagGroup, _flagName, newImageCount);
                    }

                    ChatMessage.create({
                        content: `Attack hit a mirror image, destroying it. (${newImageCount} remaining)`,
                        speaker: ChatMessage.getSpeaker({actor: actor})
                    });

                    workflow.hitTargets.delete(token);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

