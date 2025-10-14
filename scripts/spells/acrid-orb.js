/*
    You create an orb of acid gel and fling it at one creature within
    range. Make a ranged spell attack against the target. On a hit,
    the target takes 2d6 acid damage. Whether the attack hits or
    misses, the orb explodes. The target and each creature within 5
    feet of it must succeed on a Dexterity saving throw or take 2d6
    acid damage.
*/
const optionName = "Acrid Orb";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let initialTarget = workflow.targets.first();
        if (initialTarget) {
            const targets = MidiQOL.findNearby(null, initialTarget, 5, { includeToken: true });
            //const targetUuids = targets.map(t => t.document.uuid);

            let activity = await item.system.activities.find(a => a.identifier === "orb-explosion");
            if (activity) {
                const options = {
                    midiOptions: {
                        targetsToUse: new Set(targets),
                        noOnUseMacro: false,
                        configureDialog: false,
                        showFullCard: false,
                        ignoreUserTargets: true,
                        checkGMStatus: false,
                        autoRollAttack: true,
                        autoRollDamage: "always",
                        fastForwardAttack: true,
                        fastForwardDamage: true,
                        workflowData: true
                    }
                };

                await MidiQOL.completeActivityUse(activity, options, {}, {});
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
