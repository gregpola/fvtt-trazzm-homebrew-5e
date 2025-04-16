/*
    A silvery beam of pale light shines down in a 5-foot-radius, 40-foot-high Cylinder centered on a point within range.
    Until the spell ends, Dim Light fills the Cylinder, and you can take a Magic action on later turns to move the
    Cylinder up to 60 feet.

    When the Cylinder appears, each creature in it makes a Constitution saving throw. On a failed save, a creature takes
    2d10 Radiant damage, and if the creature is shape-shifted (as a result of the Polymorph spell, for example), it
    reverts to its true form and can’t shape-shift until it leaves the Cylinder. On a successful save, a creature takes
    half as much damage only. A creature also makes this save when the spell’s area moves into its space and when it
    enters the spell’s area or ends its turn there. A creature makes this save only once per turn.

    Using a Higher-Level Spell Slot.The damage increases by 1d10 for each spell slot level above 2.
 */
const optionName = "Moonbeam";
const version = "12.4.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

// the enter or end turn macro
let targetToken = event.data.token;
if (targetToken) {
    let [targetCombatant] = game.combat.getCombatantsByToken(targetToken);
    if (!targetCombatant) return;

    const flagName = `moonbeam-${region.id}`;
    if (!HomebrewHelpers.perTurnCheck(targetCombatant, flagName, event.name)) return;
    await HomebrewHelpers.setTurnCheck(targetCombatant, flagName);

    // get cast data
    let sourceActor = targetToken.actor; // default
    let sourceToken = targetToken; // default
    let saveDC = 14;
    let diceCount = 2;
    const itemUuid = region.getFlag('region-attacher', 'itemUuid');
    const sourceItem = await fromUuid(itemUuid);
    if (sourceItem) {
        if (sourceItem.actor) {
            sourceActor = sourceItem.actor;
            sourceToken = canvas.scene.tokens.find(t => t.actor.id === sourceActor.id);
            saveDC = sourceItem.actor.system.attributes.spelldc;
            diceCount = 2 + (sourceItem.system.level - 2);
        }
    }

    // roll save
    const config = { undefined, ability: "con", target: saveDC };
    const dialog = {};
    const message = { data: { speaker: ChatMessage.implementation.getSpeaker({ actor: targetToken.actor }) } };
    let saveResult = await targetToken.actor.rollSavingThrow(config, dialog, message);
    const divisor = saveResult[0].isSuccess ? 2 : 1;

    // apply damage
    const damageRoll = await new CONFIG.Dice.DamageRoll(`${diceCount}d10/${divisor}`, {}, {type: 'radiant'}).evaluate();
    await new MidiQOL.DamageOnlyWorkflow(sourceActor, sourceToken, null, null, [targetToken], damageRoll, {flavor: 'Struck by moon light', itemCardId: "new", itemData: sourceItem?.toObject()});
}
