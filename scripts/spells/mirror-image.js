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
const version = "12.4.0";
const flagName = "flags.world.spell.MirrorImages";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isHit") {
        let spellEffect = HomebrewHelpers.findEffect(actor, "Mirror Image");
        if (spellEffect) {
            // check the attacking actor for unaffected traits
            const isBlind = workflow.actor.statuses.has("blinded");
            const canSee = workflow.token.detectionModes.some(d=>['blindsight', 'seeAll'].includes(d.id));

            if (isBlind || canSee) {
                console.log(`${optionName} - attacker is blind or has blind-sight/true-sight`);
                return;
            }

            let duplicates = foundry.utils.getProperty(actor, flagName);
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
                        await MidiQOL.socket().executeAsGM('removeEffects', {
                            actorUuid: actor.uuid,
                            effects: [spellEffect.id]
                        });
                    }
                    else {
                        await foundry.utils.setProperty(actor, flagName, newImageCount);
                    }

                    ChatMessage.create({
                        content: `Attack hits a mirror image and destroys it`,
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

