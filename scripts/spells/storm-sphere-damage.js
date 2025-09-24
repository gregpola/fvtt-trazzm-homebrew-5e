const version = "13.5.0";
const optionName = "Storm Sphere";

let targetToken = event.data.token;
if (targetToken) {
    const sourceItem = await fromUuid(region.flags['region-attacher'].itemUuid);
    if (sourceItem) {

        // synthetic activity use
        const activity = sourceItem.system.activities.find(a => a.identifier === 'storm-damage');
        if (activity) {
            const options = {
                midiOptions: {
                    targetsToUse: new Set([targetToken]),
                    noOnUseMacro: false,
                    configureDialog: false,
                    showFullCard: false,
                    ignoreUserTargets: true,
                    checkGMStatus: true,
                    autoRollAttack: true,
                    autoRollDamage: "always",
                    fastForwardAttack: true,
                    fastForwardDamage: true,
                    workflowData: false
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
