/*
	Choose a manufactured metal object, such as a metal weapon or a suit of heavy or medium metal armor, that you can see
	within range. You cause the object to glow red-hot. Any creature in physical contact with the object takes 2d8 fire
	damage when you cast the spell. Until the spell ends, you can use a bonus action on each of your subsequent turns to
	cause this damage again.

	If a creature is holding or wearing the object and takes the damage from it, the creature must succeed on a
	Constitution saving throw or drop the object if it can. If it doesn't drop the object, it has disadvantage on attack
	rolls and ability checks until the start of your next turn.

	At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d8 for each slot level above 2nd.
*/
const version = "12.3.0";
const optionName = "Heat Metal Ongoing Damage";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "heat-metal";
const mutationName = "heat-metal-mutation";

try {
    if (args[0].macroPass === "preItemRoll") {
        let flag = actor.getFlag(_flagGroup, flagName);
        if (flag) {
            let targetToken = canvas.scene.tokens.get(flag.tokenId);
            if (!targetToken) {
                await removeSourceActorEffect(actor);
                ui.notifications.info(`${optionName}: no target found`);
                return false;
            }

            const heatedItem = targetToken.actor.items.get(flag.itemId);
            if (!heatedItem) {
                ui.notifications.info(`${optionName}: target doesn't have the heated item`);
                return false;
            }
        }
        else {
            await removeSourceActorEffect(actor);
            ui.notifications.info(`${optionName}: no effect found`);
            return false;
        }
    }
    else if (args[0].macroPass === "preambleComplete") {
        let flag = actor.getFlag(_flagGroup, flagName);
        if (flag) {
            // set the item target
            game.user.updateTokenTargets([flag.tokenId]);
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function removeSourceActorEffect(actor) {
    const ongoingDamageItem = actor.items.find(i => i.name === "Heat Metal Damage");
    if (ongoingDamageItem) {
        ongoingDamageItem.delete();
    }
}