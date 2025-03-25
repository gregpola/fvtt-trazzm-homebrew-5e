const version = "12.3.0";
const optionName = "Sentinel Reprisal Attack";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "sentinel-reprisal";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let sentinelFlag = actor.getFlag(_flagGroup, flagName);
        if (sentinelFlag) {
            let chosenWeapon = await fromUuid(sentinelFlag.weaponUuid);
            if (chosenWeapon) {
                chosenWeapon.prepareData();
                chosenWeapon.prepareFinalAttributes();

                const options = {
                    showFullCard: false,
                    createWorkflow: true,
                    versatile: false,
                    configureDialog: false,
                    targetUuids: [`${sentinelFlag.targetUuid}`],
                    workflowOptions: {
                        autoRollDamage: 'onHit',
                        autoFastDamage: true
                    }
                };

                const attackRoll = await MidiQOL.completeItemUse(chosenWeapon, {}, options);
                if (attackRoll) {
                    console.log(attackRoll);
                }
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
