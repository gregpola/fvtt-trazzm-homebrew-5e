/*
    In response to being hit by a ranged weapon attack, the brawler deflects the missile. The damage it takes from the
    attack is reduced by 10 (1d10 + 5).
*/
const version = "11.0";
const optionName = "Deflect Missiles";
const damageReductionEffectName = "Deflect Missiles - Damage Reduction";

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

            // set reaction used
            await MidiQOL.setReactionUsed(rollingActor);
        }
        else {
            console.error(`${optionName}: ${version}`, "Missing rollingActor");
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
