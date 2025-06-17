/*
    In addition, whenever a creature within 5 feet of you hits you with a melee attack roll, the shield erupts with
    flame. The attacker takes 2d8 Fire damage from a warm shield or 2d8 Cold damage from a chill shield.
*/
const optionName = "Fire Shield";
const version = "12.4.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isHit") {
        // get the attacker to check the distance and mwak or msak
        if (["mwak", "msak"].includes(rolledItem.system.actionType)) {
            const attacker = rolledItem.actor;
            const attackerToken = MidiQOL.tokenForActor(attacker);
            if (MidiQOL.computeDistance(attackerToken, token) > 5) return;

            // TODO get the type of shield
            const coldShield = HomebrewHelpers.findEffect(actor, 'Chill Shield');
            let activity = undefined;

            if (coldShield) {
                activity = macroItem.system.activities.find(a => a.identifier === 'fire-shield-cold-damage');
                await animeCold(token, attackerToken);
            }
            else {
                activity = macroItem.system.activities.find(a => a.identifier === 'fire-shield-fire-damage');
                await animeFire(token, attackerToken);
            }

            // synthetic activity use
            if (activity) {
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

async function animeFire(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.fire_bolt.orange.05ft")
        .atLocation(token)
        .stretchTo(target)
        .play()
}
