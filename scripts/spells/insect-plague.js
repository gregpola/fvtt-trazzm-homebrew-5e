/*
    Swarming locusts fill a 20-foot-radius Sphere centered on a point you choose within range. The Sphere remains for
    the duration, and its area is Lightly Obscured and Difficult Terrain.

    When the swarm appears, each creature in it makes a Constitution saving throw, taking 4d10 Piercing damage on a
    failed save or half as much damage on a successful one. A creature also makes this save when it enters the spell’s
    area for the first time on a turn or ends its turn there. A creature makes this save only once per turn.

    Using a Higher-Level Spell Slot.The damage increases by 1d10 for each spell slot level above 5.
*/
const version = "12.4.0";
const optionName = "Insect Plague";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const lastAppliedFlag = "insectPlagueTime";

// the enter or end turn macro
const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;
let targetToken = event.data.token;
if (targetToken) {
    let appliedFlag = targetToken.actor.getFlag(_flagGroup, lastAppliedFlag);
    let sourceActor = targetToken.actor; // default
    let sourceToken = targetToken; // default

    let saveDC = 14;
    let diceCount = 4;
    const itemUuid = region.getFlag('region-attacher', 'itemUuid');
    const sourceItem = await fromUuid(itemUuid);
    if (sourceItem) {
        if (sourceItem.actor) {
            sourceActor = sourceItem.actor;
            sourceToken = canvas.scene.tokens.find(t => t.actor.id === sourceActor.id);
            saveDC = sourceItem.actor.system.attributes.spelldc;
            diceCount = 4 + (sourceItem.system.level - 5);
        }
    }

    if (!appliedFlag || (appliedFlag !== combatTime)) {
        const config = { undefined, ability: "con", target: saveDC };
        const dialog = {};
        const message = { data: { speaker: ChatMessage.implementation.getSpeaker({ actor: targetToken.actor }) } };
        let saveResult = await targetToken.actor.rollSavingThrow(config, dialog, message);
        const divisor = saveResult[0].isSuccess ? 2 : 1;

        // set flag
        await targetToken.actor.setFlag(_flagGroup, lastAppliedFlag, combatTime);

        // apply damage
        const damageRoll = await new CONFIG.Dice.DamageRoll(`${diceCount}d10/${divisor}`, {}, {type: 'piercing'}).evaluate();
        await new MidiQOL.DamageOnlyWorkflow(sourceActor, sourceToken, null, null, [targetToken], damageRoll, {flavor: 'Pierced by spikes', itemCardId: "new", itemData: sourceItem?.toObject()});
    }
}


// preItemRoll
const version = "12.4.0";
const optionName = "Insect Plague";

try {
    if (args[0].macroPass === "preItemRoll") {
        Hooks.once("createMeasuredTemplate", async (template) => {
            // look for visibility and region
            await template.update({'hidden': true});
        });

        Hooks.once("createRegion", async (region) => {
            // look for visibility and region
            await region.update({'visibility': 0});
        });
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
