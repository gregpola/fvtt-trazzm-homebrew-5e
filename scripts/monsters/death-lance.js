/*
	Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 8 (1d6 + 5) piercing damage plus 18 (4d8) necrotic damage.
	The target’s hit point maximum is reduced by an amount equal to the necrotic damage taken. This reduction lasts until
	the target finishes a long rest. The target dies if its hit point maximum is reduced to 0.
*/
const version = "12.4.0";
const optionName = "Death Lance";
const effectName = "Death Lance - HP Max Reduction";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.hitTargets.first();
        if (targetToken) {
            const nectroticDamage = args[0].damageDetail.find(i => i.type === "necrotic");

            if (nectroticDamage.damage > 0) {
                // apply hp max reduction
                //let currentTempMax = targetToken.actor.system.attributes.hp.tempmax;
                let currentEffect = HomebrewHelpers.findEffect(targetToken.actor, effectName);

                if (currentEffect) {
                    // update the existing
                    let updatedChanges = deepClone(currentEffect.changes);
                    let newValue = Number(updatedChanges[0].value);
                    updatedChanges[0].value = newValue - nectroticDamage.damage;
                    await currentEffect.update({changes: updatedChanges});
                }
                else {
                    await applyHitPointMaxReduction(targetToken.actor, nectroticDamage.damage, macroItem);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyHitPointMaxReduction(targetActor, damage, sourceItem) {
    let effectData = [{
        label: effectName,
        icon: 'icons/magic/fire/projectile-arrow-fire-orange.webp',
        origin: sourceItem.uuid,
        transfer: false,
        disabled: false,
        changes: [
            { key: 'system.attributes.hp.tempmax', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -damage, priority: 20 }
        ],
        flags: {
            dae: {
                specialDuration: ['longRest']
            }
        }
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: effectData });
}
