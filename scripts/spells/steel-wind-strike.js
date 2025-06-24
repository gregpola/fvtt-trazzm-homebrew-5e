/*
    You flourish the weapon used in the casting and then vanish to strike like the wind. Choose up to five creatures you
    can see within range. Make a melee spell attack against each target. On a hit, a target takes 6d10 Force damage.
*/
const optionName = "Steel Wind Strike";
const version = "12.4.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.targets) {
            await HomebrewMacros.moveToTarget(token, targetToken);
            await HomebrewMacros.wait(1000);

            let activity = macroItem.system.activities.getName("sws-attack");
            if (activity) {
                const options = {
                    midiOptions: {
                        targetsToUse: new Set([targetToken]),
                        noOnUseMacro: false,
                        configureDialog: false,
                        showFullCard: false,
                        ignoreUserTargets: false,
                        checkGMStatus: true,
                        autoRollAttack: true,
                        autoRollDamage: "always",
                        fastForwardAttack: true,
                        fastForwardDamage: true,
                        workflowData: false
                    }
                };

                await anime(token, targetToken);
                await MidiQOL.completeActivityUse(activity, options, {}, {});
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.falchion.melee.01.white")
        .atLocation(token)
        .stretchTo(target)
        .play()
}
