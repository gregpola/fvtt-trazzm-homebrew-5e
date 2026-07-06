/*
    Power from Beyond. Once per turn, when you cast a Bard spell with a spell slot that deals damage or restores Hit
    Points, roll 1d6. You gain a bonus equal to the number rolled to one of the spell’s damage rolls or to the total Hit
    Points the spell restores.

    Spiritual Manifestation. Whenever you cast Spirit Guardians, you can modify it so the spirits also guard against worldly
    threats. When you cast the spell in this way, you and allies within the spell’s Emanation have Half Cover. Once you
    modify the spell in this way, you can’t do so again until you finish a Short or Long Rest.
*/
const optionName = "Empowered Channeling";
const version = "14.5.0";
const timeFlag = "empowered-channeling-time";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
        // Spiritual Manifestation
        if (rolledItem.type === "spell" && rolledItem.name === "Spirit Guardians") {
            // check uses
            const maxValue = macroItem.system.uses.max;
            const spentValue = macroItem.system.uses.spent;

            if (spentValue < maxValue) {
                // ask if they want to modify the spell
                const result = await foundry.applications.api.DialogV2.wait({
                    window: { title: optionName },
                    form: { closeOnSubmit: true },
                    content: '<p>Whenever you cast Spirit Guardians, you can modify it so the spirits also guard against worldly threats. When you cast the spell in this way, you and allies within the spell’s Emanation have Half Cover. Once you modify the spell in this way, you can’t do so again until you finish a Short or Long Rest.</p>',
                    buttons: [
                        {
                            action: "Modify",
                            default: true,
                            label: "Modify",
                            callback: () => "Modify"
                        },
                        {
                            action: "Pass",
                            default: false,
                            label: "Pass",
                            callback: () => "Pass"
                        },
                    ],
                    position: {
                        width: 400
                    },
                    rejectClose: false,
                    modal: true
                });

                if (result === "Modify") {
                    // add the aura effect
                    const coverAura = macroItem.effects.getName("Spiritual Manifestation");
                    if (coverAura) {
                        let newEffect = await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: actor.uuid, effects: [coverAura]});
                        if (newEffect && newEffect.length) {
                            await MidiQOL.addConcentrationDependent(actor, newEffect[0], rolledItem);
                        }

                        // update used
                        const newValue = spentValue + 1;
                        await macroItem.update({"system.uses.spent": newValue});
                    }
                }
            }
        }
    }
    else if (args[0].macroPass === "DamageBonus") {
        // Power from Beyond
        if (rolledItem.type === "spell" && rolledItem.system.sourceClass === "bard" && item.level > 0) {
            if (HomebrewHelpers.isAvailableThisTurn(actor, timeFlag)) {
                let content = `<p>Apply ${optionName} to this casting?</p>` +
                    '<sub>Available once per turn</sub>';

                // ask if they want to use the option
                const proceed = await foundry.applications.api.DialogV2.prompt({
                    content: content,
                    rejectClose: false,
                    ok: {
                        callback: (event, button, dialog) => {
                            return true;
                        }
                    },
                    window: {
                        title: `${optionName}`,
                    },
                    position: {
                        width: 400
                    }
                });

                if (proceed) {
                    await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
                    return new CONFIG.Dice.DamageRoll(`1d6[${optionName}]`, {}, {type:workflow.defaultDamageType, properties: [...rolledItem.system.properties]});
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
