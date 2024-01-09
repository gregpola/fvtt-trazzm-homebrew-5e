/*
    Starting at 3rd level, you can use your reaction to deflect or catch the missile when you are hit by a ranged weapon
    attack. When you do so, the damage you take from the attack is reduced by 1d10 + your Dexterity modifier + your monk level.

    If you reduce the damage to 0, you can catch the missile if it is small enough for you to hold in one hand and you
    have at least one hand free. If you catch a missile in this way, you can spend 1 Ki point to make a ranged attack
    with the weapon or piece of ammunition you just caught, as part of the same reaction. You make this attack with
    proficiency, regardless of your weapon proficiencies, and the missile counts as a monk weapon for the attack, which
    has a normal range of 20 feet and a long range of 60 feet.
*/
const version = "11.1";
const optionName = "Deflect Missiles";
const damageReductionEffectName = "Deflect Missiles - Damage Reduction";
const kiName = "Ki";
const cost = 1;
let throwbackItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', 'Deflect Missiles - Throwback');

try {
    const { [0]:{ actor:rollingActor, workflow: { item: rollingItem }, macroPass, options:{actor:reactionActor} } } = args ?? {};
    if(!macroPass) return ui.notifications.error(`${reactionItemName} macro error. Do you have sheet hooks options enabled in Item Macro's module settings? If yes please turn it off or complain to thatlonelybugbear!`);

    if (macroPass === "isHit") {
        if (reactionActor) {
            const hasUsedReaction = MidiQOL.hasUsedReaction(reactionActor);

            if (rollingItem.system.actionType === "rwak" && !hasUsedReaction) {
                const reactionItem = reactionActor.items.getName(optionName);
                if (reactionItem) {
                    const activation = deepClone(reactionItem.system.activation)
                    activation.type = "reactiondamage";
                    reactionItem.update({"system.activation": activation});
                }
            }
        }
        else {
            console.error(`${optionName}: ${version}`, "Missing reactionActor");
        }
    }
    else if (macroPass === "postActiveEffects") {
        console.log("posActiveEffects");
        // set the item back to reactionmanual
        if (rollingActor) {
            const reactionItem = rollingActor.items.getName(optionName);
            if (reactionItem) {
                const activation = deepClone(reactionItem.system.activation)
                activation.type = "reactionmanual";
                reactionItem.update({"system.activation":activation});
            }

            // check for throw back
            const effect =  rollingActor.effects.find(ef=>ef.name === damageReductionEffectName);
            if (effect) {
                const change = effect.changes.find(change => change.key === "flags.midi-qol.DR.rwak");
                if (change) {
                    const drAmount = Number(change.value);
                    if (drAmount >= workflow.workflowOptions.damageTotal) {
                        // check ki points
                        let kiFeature = rollingActor.items.find(i => i.name === kiName);
                        if (!kiFeature) {
                            console.error(`${optionName} - no Ki feature`);
                            await setReactionUsed(rollingActor);
                            return;
                        }

                        let usesLeft = kiFeature.system.uses?.value ?? 0;
                        if (!usesLeft || usesLeft < cost) {
                            console.error(`${optionName} - not enough Ki remaining`);
                            await setReactionUsed(rollingActor);
                            return;
                        }

                        const throwBack = await Dialog.confirm({
                            title: game.i18n.localize("Return Missile"),
                            content: `<p>Throw the missile back at the attacker</p><p>(costs 1 of ${usesLeft} Ki)</p>`,
                        });

                        if (throwBack) {
                            const theItem = await fromUuid(workflow.workflowOptions.sourceItemUuid);
                            const theItemDamageParts = theItem.system.damage.parts;
                            const theItemDamageTerm = theItemDamageParts[0][0];
                            const theItemDamageType = theItemDamageParts[0][1];
                            const modIndex = theItemDamageTerm.indexOf("@mod");

                            let baseDamage = theItemDamageTerm;
                            if (modIndex > -1) {
                                baseDamage = theItemDamageTerm.substring(0, modIndex).trim();
                            }

                            // get the monk's ability modifier
                            let abilityToUse = "dex";
                            if (rollingActor.system.abilities.str.mod > rollingActor.system.abilities.dex.mod) {
                                abilityToUse = "str";
                            }
                            throwbackItem.system.ability = abilityToUse;

                            // apply the item damage data to the throwback item
                            let damageParts = throwbackItem.system.damage.parts;
                            damageParts[0][0] = baseDamage + ' + @mod';
                            damageParts[0][1] = theItemDamageType;
                            throwbackItem.system.damage.parts = damageParts;

                            // get the target
                            const targetTokenOrActor = await fromUuid(workflow.workflowOptions.sourceActorUuid);
                            const targetActor = targetTokenOrActor.actor ?? targetTokenOrActor;
                            const target = targetActor.token ?? targetActor.getActiveTokens()?.shift();

                            // throw it
                            let throwFeature = new CONFIG.Item.documentClass(throwbackItem, {'parent': rollingActor});
                            let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions([target.uuid]);
                            await MidiQOL.completeItemUse(throwFeature, config, options);
                            await warpgate.wait(250);

                            // reduce Ki
                            const newValue = kiFeature.system.uses.value - cost;
                            await kiFeature.update({"system.uses.value": newValue});
                        }
                    }
                }
            }

            // set reaction used
            await setReactionUsed(rollingActor);
        }
        else {
            console.error(`${optionName}: ${version}`, "Missing rollingActor");
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function setReactionUsed(actor) {
    if (!MidiQOL.hasUsedReaction(actor)) {
        await MidiQOL.setReactionUsed(actor);
    }
}
