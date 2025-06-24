/*
    You magically mark one creature you can see within range as your quarry. Until the spell ends, you deal an extra
    1d6 Force damage to the target whenever you hit it with an attack roll. You also have Advantage on any
    Wisdom (Perception) or Wisdom (Survival) check you make to find it.
*/
const version = "12.4.1";
const optionName = "Hunter's Mark";
const targetEffectName = "Hunters Marked";

try {
    if (args[0].macroPass === "DamageBonus") {
        if (!workflow.hitTargets.size) return {};

        // new spell just says attack roll
        if (!["rwak", "mwak", "rsak", "msak"].includes(macroActivity.actionType)) return {};

        const originStart = `Actor.${actor.id}.`;

        for (let targetToken of workflow.hitTargets) {
            let isMarked = false;

            for (let targetEffect of targetToken.actor?.getRollData()?.effects) {
                if ((targetEffect.name === targetEffectName) && targetEffect.origin.startsWith(originStart)) {
                    isMarked = true;
                    break;
                }
            }

            if (isMarked) {
                const diceMult = workflow.isCritical ? 2 : 1;
                const damageDie = actor.system.scale.ranger.mark.die;

                return new game.system.dice.DamageRoll(`${diceMult}${damageDie}`, {}, {
                    isCritical: workflow.isCritical,
                    properties: ["mgc"],
                    type: "force",
                    flavor: optionName
                });
            }
        }

        return {};
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
