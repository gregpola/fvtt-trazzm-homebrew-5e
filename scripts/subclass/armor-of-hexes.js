/*
    When you take damage from the cursed target of your Hex, you can take a Reaction to reduce the damage taken by an
    amount equal to 2d8 plus your Charisma modifier. You can use this feature a number of times equal to your Charisma
    modifier, and you regain all expended uses when you finish a Long Rest.
*/
const optionName = "Armor of Hexes";
const version = "12.4.0";

try {
    if (args[0].macroPass === "preItemRoll") {
        let isHexed = false;
        const attackingActor = workflow.workflowOptions.item.actor;
        if (attackingActor) {
            const originStart = `Actor.${actor.id}.`;

            for (let effect of workflow.workflowOptions.item.actor.getRollData().effects) {
                if (effect.name.startsWith("Hexed ") && effect.origin.startsWith(originStart) && effect.statuses.has("cursed")) {
                    isHexed = true;
                    break;
                }
            }
        }

        if (!isHexed) {
            ui.notifications.error(`${optionName}: ${version} - attacker is not hexed`);
            return false;
        }

    }
    else if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isDamaged") {
        const damageItem = workflow.damageItem;
        let reducedDamage = await new Roll(`2d8 + ${actor.system.abilities.cha.mod}`).roll();
        await game.dice3d?.showForRoll(reducedDamage);
        const value = -Math.min(damageItem.totalDamage, reducedDamage.total);
        MidiQOL.modifyDamageBy({damageItem, value, reason: optionName})
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
