/*
	As a Bonus Action, you can apply a poison dose to a weapon or piece of ammunition. Once applied, the poison retains
	its potency for 1 minute or until you deal damage with the poisoned item, whichever is shorter. When a creature
	takes damage from the poisoned item, that creature must succeed on a Constitution saving throw (DC 8 plus the
	modifier of the ability increased by this feat and your Proficiency Bonus) or take 2d8 Poison damage and have the
	Poisoned condition until the end of your next turn.
*/
const version = "12.4.0";
const optionName = "Poisoner Poison";

const _flagGroup = "trazzm";
const abilityFlag = "flags.trazzm.ability";
const poisonedWeaponFlag = "poisoned-weapon";

try {
    if (args[0].macroPass === "postActiveEffects") {
        await HomebrewMacros.applyPoisonToWeapon(actor, item);

    } else if (args[0].macroPass === "DamageBonus") {
        const targetToken = workflow.hitTargets.first();
        if (targetToken) {
            // poison only lasts one hit for most weapons, three for ammo
            let flag = actor.getFlag(_flagGroup, poisonedWeaponFlag);
            if (flag && workflow.item._id === flag.itemId) {
                let apps = flag.applications;
                const itemName = flag.itemName;
                const itemId = flag.itemId;

                // check for expiration condition
                if (apps > 0) {
                    apps -= 1;
                    await actor.setFlag(_flagGroup, poisonedWeaponFlag, {
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
                    let abilityFlag = macroItem.getFlag(_flagGroup, abilityFlag);
                    let saveDC = 8 + actor.system.attributes.prof + (abilityFlag ? actor.system.abilities[abilityFlag].mod : actor.system.abilities.dex.mod);
                    const saveFlavor = `${CONFIG.DND5E.abilities["con"].label} DC${saveDC} ${optionName}`;

                    const saveRoll = await targetToken.actor.rollAbilitySave("con", {
                        flavor: saveFlavor,
                        damageType: "poison"
                    });

                    if (saveRoll.total < saveDC) {
                        await HomebrewEffects.applyPoisonedEffect(targetToken.actor, item);
                        return {damageRoll: `${damageDice}[poison]`, flavor: optionName};

                    } else {
                        return {damageRoll: `${damageDice}/2[poison]`, flavor: optionName};
                        
                    }
                }
            }
        }
    } else if (args[0] === "off") {
        await HomebrewMacros.removePoisonFromWeapon(actor);
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
