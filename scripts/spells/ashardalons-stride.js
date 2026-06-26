/*
	The billowing flames of a dragon blast from your feet, granting you explosive speed. For the duration, your speed
	increases by 20 feet and moving doesn’t provoke opportunity attacks.

	When you move within 5 feet of a creature or an object that isn’t being worn or carried, it takes 1d6 fire damage
	from your trail of heat. A creature or object can take this damage only once during a turn.

	At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, increase your speed by 5 feet
	for each spell slot level above 3rd. The spell deals an additional 1d6 fire damage for each slot level above 3rd.
*/
const optionName = "Ashardalon's Stride";
const version = "14.5.0";

try {
    if (args[0] === "on") {
        if (lastArgValue && lastArgValue.tokenUuid) {
            const originActor = (await fromUuid(lastArgValue.origin)).actor;
            await applySpellDamage(token, originActor, macroItem, 'tokenEnter');
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

// target token must be a document
async function applySpellDamage(targetToken, originActor, sourceItem, eventName) {
    if (targetToken) {
        // make sure the target is not flagged as never target
        const neverTargetFlag = targetToken.actor.getFlag("midi-qol", "neverTarget");
        if (neverTargetFlag) {
            console.log(`${optionName} - skipping target ${targetToken.name} - flagged as neverTarget`);
            return;
        }

        let targetCombatant = game.combat.getCombatantByToken(targetToken.document);
        if (targetCombatant) {
            const flagName = `ashardalon-stride-${originActor.id}`;
            if (HomebrewHelpers.perTurnCheck(targetCombatant, flagName, eventName)) {
                // synthetic activity use
                const activity = sourceItem.system.activities.find(a => a.identifier === 'apply-damage');
                if (activity) {
                    await HomebrewHelpers.setTurnCheck(targetCombatant, flagName);
                    let targetUuids = [targetToken.document.uuid];

                    // get the actor owner
                    let actorUser = MidiQOL.playerForActor(actor);
                    if (!actorUser?.active) {
                        console.info(`${optionName} - unable to locate the actor player, sending to GM`);
                        actorUser = game.users?.activeGM;
                    }

                    const options = {
                        midiOptions: {
                            targetUuids: targetUuids,
                            noOnUseMacro: false,
                            configureDialog: false,
                            showFullCard: false,
                            ignoreUserTargets: true,
                            checkGMStatus: true,
                            autoRollAttack: true,
                            autoRollDamage: "always",
                            fastForwardAttack: true,
                            fastForwardDamage: true,
                            asUser: actorUser.id,
                            workflowData: true
                        }
                    };

                    await MidiQOL.completeActivityUse(activity.uuid, options, {}, {});
                }
            }
        }
    }
}
