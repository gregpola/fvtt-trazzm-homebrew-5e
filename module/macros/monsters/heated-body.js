const version = "12.3.0";

export async function heatedBodyRemorhaz({speaker, actor, token, character, item, args}) {
    if (args[0].macroPass === "isDamaged") {
        if (["mwak", "msak"].includes(item.system.actionType)) {
            const attackingActor = item.parent;
            const attackingToken = canvas.tokens.get(args[0].tokenId);
            if (attackingActor && MidiQOL.computeDistance(token, attackingToken) <= 5) {
                const damageRoll = await new CONFIG.Dice.DamageRoll('3d6', {}, { type: 'fire', appearance: { colorset: 'fire' } }).evaluate();
                await game.dice3d?.showForRoll(damageRoll);
                await new MidiQOL.DamageOnlyWorkflow(actor, token, null, null, [attackingToken], damageRoll, {itemCardId: "new", itemData: item.toObject()});
            }
        }
    }
}

export async function heatedBody2d6({speaker, actor, token, character, item, args}) {
    if (args[0].macroPass === "isDamaged") {
        if (["mwak", "msak"].includes(item.system.actionType)) {
            const attackingActor = item.parent;
            const attackingToken = canvas.tokens.get(args[0].tokenId);
            if (attackingActor && MidiQOL.computeDistance(token, attackingToken) <= 5) {
                const damageRoll = await new CONFIG.Dice.DamageRoll('2d6', {}, { type: 'fire', appearance: { colorset: 'fire' } }).evaluate();
                await game.dice3d?.showForRoll(damageRoll);
                await new MidiQOL.DamageOnlyWorkflow(actor, token, null, null, [attackingToken], damageRoll, {itemCardId: "new", itemData: item.toObject()});
            }
        }
    }
}
