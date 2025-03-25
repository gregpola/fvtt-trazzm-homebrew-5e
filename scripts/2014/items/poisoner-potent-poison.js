const version = "12.3.0";
const optionName = "Poisoner Potent Poison";
const _poisonedWeaponFlag = "poisoned-weapon";
const damageDice = "2d8";
const saveDC = 14;
const saveFlavor = `${optionName} - ${CONFIG.DND5E.abilities["con"].label} DC ${saveDC}`;

try {
    if (args[0].macroPass === "preItemRoll") {
        // find the actor's items that can be poisoned
        // must be piercing or slashing
        let weapons = actor.items.filter(i => i.type === `weapon` && (i.system.damage.parts[0][1] === `piercing` || i.system.damage.parts[0][1] === `slashing`));
        if (!weapons || weapons.length < 1) {
            ui.notifications.error(`${optionName} - no appropriate weapons available`);
            return false;
        }
    }
    else if (args[0].macroPass === "postActiveEffects") {
        await HomebrewMacros.applyPoisonToWeapon(actor, item);
    }
    else if (args[0].macroPass === "DamageBonus") {
        const targetToken = workflow.hitTargets.first();
        if (targetToken) {
            // poison only lasts one hit for most weapons, three for ammo
            let flag = actor.getFlag(_flagGroup, _poisonedWeaponFlag);
            if (flag && workflow.item._id === flag.itemId) {
                let apps = flag.applications;
                const itemName = flag.itemName;
                const itemId = flag.itemId;

                // check for expiration condition
                if (apps > 0) {
                    apps -= 1;
                    await actor.setFlag(_flagGroup, _poisonedWeaponFlag, {
                        itemName: itemName,
                        itemId: itemId,
                        applications: apps
                    });

                    if (apps === 0) {
                        await HomebrewMacros.removePoisonFromWeapon(actor);
                        let effect = actor.effects.find(ef => ef.name === optionName);
                        if (effect) {
                            await MidiQOL.socket().executeAsGM("removeEffects", {
                                actorUuid: actor.uuid,
                                effects: [effect.id]
                            });
                        }
                    }

                    // request the saving throw
                    const saveRoll = await targetToken.actor.rollAbilitySave("con", {flavor: saveFlavor, damageType: "poison"});

                    if (saveRoll.total < saveDC) {
                        await applyPoisonedEffect(targetToken.actor, actor);
                        return { damageRoll: `${damageDice}[poison]`, flavor: optionName };
                    }
                    else {
                        return { damageRoll: `${damageDice}/2[poison]`, flavor: optionName };
                    }
                }
            }
        }
    }
    else if (args[0] === "off") {
        await HomebrewMacros.removePoisonFromWeapon(actor);
    }

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}

async function applyPoisonedEffect(targetActor, sourceActor) {
    let effectData = [{
        name: optionName,
        icon: 'icons/consumables/potions/potion-jar-corked-labeled-poison-skull-green.webp',
        origin: sourceActor.uuid,
        transfer: false,
        disabled: false,
        duration: {startTime: game.time.worldTime, seconds: 6},
        changes: [
            { key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Poisoned", priority: 20 }
        ],
        flags: {
            dae: {
                selfTarget: false,
                stackable: "none",
                durationExpression: "",
                macroRepeat: "none",
                specialDuration: ["turnEndSource"],
                transfer: false
            }
        },
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: effectData });
}
