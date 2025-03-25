/*
    Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 7 (1d10 + 2) piercing damage, and the target must
    make a DC 11 Constitution saving throw, taking 18 (4d8) poison damage on a failed save, or half as much damage on a
    successful one. If the poison damage reduces the target to 0 hit points, the target is stable but Poisoned for 1 hour,
    even after regaining hit points, and is Paralyzed while poisoned in this way.
*/
const version = "12.3.0";
const optionName = "Tunnel Spider Bite";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.hitTargets.first();
        if (targetToken) {
            const hpValue = targetToken.actor.system.attributes.hp.value;
            if (hpValue <= 0) {
                // check poison immunity
                const hasPoisonImmunity = targetToken.actor.system.traits.di.value.has('poison');
                if (!hasPoisonImmunity) {
                    await HomebrewEffects.applyPoisonedEffect(targetToken.actor, workflow.item.uuid, undefined, 3600);
                    await HomebrewEffects.applyParalyzedEffect(targetToken.actor, workflow.item.uuid, undefined, 3600);
                }
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
