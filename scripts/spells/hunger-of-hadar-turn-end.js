/*
    Any creature that starts its turn in the area takes 2d6 Cold damage. Any creature that ends its turn there must
    succeed on a Dexterity saving throw or take 2d6 Acid damage from otherworldly tentacles.

    Using a Higher-Level Spell Slot. The Cold or Acid damage (your choice) increases by 1d6 for each spell slot level above 3.
 */
const version = "13.5.0";
const optionName = "Hunger of Hadar";

let targetToken = event.data.token;
if (targetToken) {
    const sourceItem = await fromUuid(region.flags['region-attacher'].itemUuid);
    if (sourceItem) {

        // synthetic activity use
        const activity = sourceItem.system.activities.find(a => a.identifier === 'end-of-turn-save');
        if (activity) {
            let targetUuids = [targetToken.uuid];

            const options = {
                midiOptions: {
                    targetUuids: targetUuids,
                    noOnUseMacro: true,
                    configureDialog: false,
                    showFullCard: false,
                    ignoreUserTargets: true,
                    checkGMStatus: true,
                    autoRollAttack: true,
                    autoRollDamage: "always",
                    fastForwardAttack: true,
                    fastForwardDamage: true,
                    workflowData: true
                }
            };

            await MidiQOL.completeActivityUse(activity.uuid, options, {}, {});
        }
        else {
            ui.notifications.error(`${optionName}: ${version} - missing end of turn save activity`);
        }
    }
    else {
        ui.notifications.error(`${optionName}: ${version} - missing source item`);
    }
}

