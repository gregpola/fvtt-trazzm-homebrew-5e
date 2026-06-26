const optionName = "Reanimated Companion";
const version = "14.5.1";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // get the summoned
        const companionTokenDoc = workflow.summonedCreatures[0];
        const companion = companionTokenDoc.actor;

        // delete all the other summon's tokens
        let duplicatePlaceables = canvas.tokens.placeables.filter(t => t.id !== companionTokenDoc.id && t.name === companion.name);
        if (duplicatePlaceables.length) {
            await canvas.scene.deleteEmbeddedDocuments("Token", duplicatePlaceables.map(d => d.id));
        }

        if (companion) {
            const intMod = actor.system.abilities.int.mod;
            const actorDC = actor.system.attributes.spell.dc ?? 12;
            const modCount = actor.system.scale.reanimator["maximum-strange-modifications"];

            const deathBurstItem = companion.items.getName("Death Burst");
            if (deathBurstItem) {
                let saveActivity = deathBurstItem.system.activities.getName("Save");
                await saveActivity.update({
                    "save.dc.formula" : actorDC
                });
            }

            const dreadfulSwipeItem = companion.items.getName("Dreadful Swipe");
            if (dreadfulSwipeItem) {
                await dreadfulSwipeItem.update({
                    "system.damage.base.bonus" : intMod
                });
            }

            const improvedReanimationItem = companion.items.getName("Improved Reanimation");
            if (improvedReanimationItem) {
                if (deathBurstItem) {
                    let saveActivity = deathBurstItem.system.activities.getName("Save");
                    const damageParts = foundry.utils.duplicate(saveActivity.damage.parts);
                    damageParts[0].number = 4;

                    await saveActivity.update({
                        "damage.parts": damageParts
                    });
                }

                // add ignore necrotic resistance
                const ignoreResistanceEffect = HomebrewEffects.findEffect(companion, "Ignore Necrotic Resistance");
                if (ignoreResistanceEffect) {
                    await ignoreResistanceEffect.update({
                        "disabled": false
                    });
                }
            }

            // Ask which Strange Modification's to apply
            if (modCount > 0) {
                let content = `
                  <form>
                    <div><strong><label>Which Strange Modifications do you want to apply?</label></strong></div>
                    <hr />`;

                let strangeModRows = "";
                strangeModRows += `<div><input type="checkbox" value="arcane-conduit" style="margin-left:10px;" /><label style="margin-left: 10px;">Arcane Conduit</label></div>`;
                strangeModRows += `<div><input type="checkbox" value="ferocity" style="margin-left:10px;" /><label style="margin-left: 10px;">Ferocity</label></div>`;

                const macabreModifications = actor.items.getName("Macabre Modifications");
                if (macabreModifications) {
                    strangeModRows += `<div><input type="checkbox" value="bloated" style="margin-left:10px;" /><label style="margin-left: 10px;">Bloated</label></div>`;
                    strangeModRows += `<div><input type="checkbox" value="gaunt" style="margin-left:10px;" /><label style="margin-left: 10px;">Gaunt</label></div>`;
                    strangeModRows += `<div><input type="checkbox" value="moist" style="margin-left:10px;" /><label style="margin-left: 10px;">Moist</label></div>`;
                }

                content += `<div style="margin-bottom: 10px;"><strong><label>Select up to ${modCount} option(s):</label></strong></div>`;
                content += `<div id="strangeModOptions" class="flexcol" style="margin-bottom: 5px;"> ${strangeModRows}</div>`;
                content += '</form>';

                // show dialog
                let strangeModCost = 0;
                const selectedOptions = await foundry.applications.api.DialogV2.wait({
                    window: { title: `${optionName}` },
                    form: { closeOnSubmit: true },
                    content: content,
                    buttons: [
                        {
                            action: "Apply",
                            default: true,
                            label: "Apply Selected",
                            callback: (event, button, dialog) => {
                                // check the cunning strike options count
                                let strangeModChoices = [];

                                var grid = document.getElementById("strangeModOptions");
                                if (grid) {
                                    var checkBoxes = grid.getElementsByTagName("INPUT");
                                    for (var i = 0; i < checkBoxes.length; i++) {
                                        if (checkBoxes[i].checked) {
                                            strangeModChoices.push(checkBoxes[i].value);
                                            strangeModCost++;
                                        }
                                    }
                                }

                                if (strangeModChoices.length > modCount) {
                                    ui.notifications.error(`${optionName}: ${version} - too many options selected`);
                                    return { applyMods: false, options: []};
                                }

                                return { applyMods: true, options: strangeModChoices};
                            }
                        },
                        {
                            action: "Pass",
                            default: false,
                            label: "Pass",
                            callback: () => "Pass"
                        },
                    ],
                    rejectClose: false,
                    modal: true
                });

                // apply the modifications selected
                if (selectedOptions && selectedOptions.applyMods) {
                    if (selectedOptions.options.length > 0) {
                        for (let mod of selectedOptions.options) {
                            switch(mod) {
                                case "arcane-conduit":
                                    await handleArcaneConduit(actor);
                                    break;
                                case "ferocity":
                                    await handleFerocity(actor, dreadfulSwipeItem);
                                    break;
                                case "bloated":
                                    await handleBloated(actor, companion, intMod);
                                    break;
                                case "gaunt":
                                    await handleGaunt(actor, companion);
                                    break;
                                case "moist":
                                    await handleMoist(actor, companion, intMod);
                                    break;
                            }
                        }
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

/**
 *   You can cast spells as though you were in the companion’s space, but you must use your own senses. Once per turn,
 *   when you cast an Artificer spell from the Evocation or Necromancy school and deal damage while your companion is
 *   within 120 feet of you, you can add your Intelligence modifier to one damage roll of that spell.
 */
async function handleArcaneConduit(actor) {
    const strangeModsItem = actor.items.getName("Strange Modifications");
    if (strangeModsItem) {
        const damageBonusEffect = strangeModsItem.effects.find(e => e.name === 'Arcane Conduit');
        if (damageBonusEffect) {
            await damageBonusEffect.update({
                "disabled": false
            });
        }
    }
}

/**
 *  The damage die of the companion’s Dreadful Swipe increases to 1d6.
 */
async function handleFerocity(actor, dreadfulSwipeItem) {
    if (dreadfulSwipeItem) {
        await dreadfulSwipeItem.update({
            "system.damage.base.denomination" : 6
        });
    }
}

/**
 *  The companion becomes Large. Whenever it hits a Large or smaller creature with its Dreadful Swipe action, that
 *  creature is pushed up to 10 feet away from the companion. Additionally, you can add your Intelligence modifier to
 *  the damage dealt by the companion’s Death Burst.
 */
async function handleBloated(actor, companion, intMod) {
    // Enlarge the companion
    const companionToken = MidiQOL.tokenForActor(companion);
    await companionToken.document.update({
        width: newGrid,
        height: newGrid
    });
    await companion.update({ "system.traits.size": "lg" });

    // Add push to Dreadful Swipe
    const dreadfulSwipeItem = companion.items.getName("Dreadful Swipe");
    if (dreadfulSwipeItem) {
        let attackActivity = dreadfulSwipeItem.system.activities.getName("Attack");
        if (attackActivity) {
            await attackActivity.update({
                "midiProperties.triggeredActivityId" : "push-target",
                "midiProperties.triggeredActivityConsume" : false,
                "midiProperties.triggeredActivityConfigure" : false
            });
        }
    }

    // add damage to Death Burst
    const deathBurstItem = companion.items.getName("Death Burst");
    if (deathBurstItem) {
        let saveActivity = deathBurstItem.system.activities.getName("Save");
        const damageParts = foundry.utils.duplicate(saveActivity.damage.parts);
        damageParts[0].bonus = `${intMod}`;
        await saveActivity.update({
            "damage.parts": damageParts
        });
    }
}

/**
 * The companion’s Speed increases to 45 feet, and it gains a Climb Speed equal to its Speed. It can climb difficult
 * surfaces, including along ceilings, without needing to make an ability check. In addition, whenever a creature of
 * your choice starts its turn within a 10-foot Emanation originating from your companion, the creature must succeed on
 * a Wisdom saving throw against your spell save DC or have the Frightened condition until the start of its next turn.
 *
 * @param actor
 * @param companion
 * @returns {Promise<void>}
 */
async function handleGaunt(actor, companion) {
    const gauntMovement = HomebrewEffects.findEffect(companion, "Gaunt Movement");
    if (gauntMovement) {
        await gauntMovement.update({
            "disabled": false
        });
    }

    const gauntAura = HomebrewEffects.findEffect(companion, "Gaunt Aura");
    if (gauntAura) {
        await gauntAura.update({
            "disabled": false
        });
    }
}

async function handleMoist(actor, companion, intMod) {
    const moistItem = companion.items.getName("Moist");
    if (moistItem) {
        let damageActivity = moistItem.system.activities.getName("Acid Damage");
        const damageParts = foundry.utils.duplicate(damageActivity.damage.parts);
        damageParts[0].custom.formula = `${intMod}`;
        await damageActivity.update({
            "damage.parts": damageParts
        });
    }

    const moistEffect = HomebrewEffects.findEffect(companion, "Moist");
    if (moistEffect) {
        await moistEffect.update({
            "disabled": false
        });
    }
}