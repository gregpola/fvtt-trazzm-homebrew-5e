/*
    Protective magical frost surrounds you. You gain 5 Temporary Hit Points. If a creature hits you with a melee attack
    roll before the spell ends, the creature takes 5 Cold damage. The spell ends early if you have no Temporary Hit Points.
*/
const optionName = "Armor of Agathys";
const version = "12.4.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isHit") {
        if (["mwak", "msak"].includes(rolledItem.system.actionType)) {
            const attacker = rolledItem.actor;
            const attackerToken = MidiQOL.tokenForActor(attacker);

            const activity = macroItem.system.activities.find(a => a.identifier === 'frost-damage');
            if (activity) {
                await animeCold(token, attackerToken);

                let targets = new Set();
                targets.add(attackerToken);

                const options = {
                    midiOptions: {
                        targetsToUse: targets,
                        noOnUseMacro: true,
                        configureDialog: false,
                        showFullCard: true,
                        ignoreUserTargets: true,
                        checkGMStatus: false,
                        autoRollAttack: true,
                        autoRollDamage: "always",
                        fastForwardAttack: true,
                        fastForwardDamage: true,
                        workflowData: true
                    }
                };

                await MidiQOL.completeActivityUse(activity.uuid, options, {}, {});
            }
        }
    }
    else if (args[0].tag === "TargetOnUse" && args[0].macroPass === "preTargetDamageApplication") {
        // check for expiration
        if (workflow.damageItem.newTempHP <= 0) {
            await HomebrewEffects.removeEffectByName(actor, optionName);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function animeCold(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.ray_of_frost.blue.05ft")
        .atLocation(token)
        .stretchTo(target)
        .play()
}
