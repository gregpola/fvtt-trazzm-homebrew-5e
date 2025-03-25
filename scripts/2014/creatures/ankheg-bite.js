/*
    Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) slashing damage plus 3 (1d6) acid damage.
    If the target is a Large or smaller creature, it is grappled (escape DC 13). Until this grapple ends, the ankheg can
    bite only the grappled creature and has advantage on attack rolls to do so.
 */
const version = "12.3.0";
const optionName = "Ankheg Bite";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "ankheg-bite";

try {
    if (args[0].macroPass === "preAttackRoll") {
        const target = workflow.targets.first();
        if (target) {
            let attachedEffect = target.actor.getRollData().effects.find(eff => eff.name === 'Ankheg Grappled' && eff.origin === workflow.item.uuid);
            if (attachedEffect) {
                workflow.advantage = true;
            }
        }
    }
    else if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.hitTargets.first();
        if (targetToken) {
            if (["tiny", "sm", "med", "lg"].includes(targetToken.actor.system.traits.size)) {
                await HomebrewMacros.applyGrappled(token, targetToken, item, 13);
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
