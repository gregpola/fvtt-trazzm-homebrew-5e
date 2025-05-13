/*
    You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 Necrotic
    damage to the target whenever you hit it with an attack roll. Also, choose one ability when you cast the spell. The
    target has Disadvantage on ability checks made with the chosen ability.

    If the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action on a later turn to curse a new creature.
*/
const version = "12.4.1";
const optionName = "Hex";

try {
    if (args[0].macroPass === "DamageBonus") {
        if (!workflow.hitTargets.size) return {};

        // new spell just says attack roll
        if (!["rwak", "mwak", "rsak", "msak"].includes(macroActivity.actionType)) return {};

        const originStart = `Actor.${actor.id}.`;

        for (let targetToken of workflow.hitTargets) {
            let isMarked = false;

            for (let targetEffect of targetToken.actor?.getRollData()?.effects) {
                if (targetEffect.name.startsWith("Hexed ") && targetEffect.origin.startsWith(originStart) && targetEffect.statuses.has("cursed")) {
                    isMarked = true;
                    break;
                }
            }

            if (isMarked) {
                return new game.system.dice.DamageRoll('1d6', {}, {
                    isCritical: workflow.isCritical,
                    properties: ["mgc"],
                    type: "necrotic",
                    flavor: optionName
                });
            }
        }

        return {};
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
