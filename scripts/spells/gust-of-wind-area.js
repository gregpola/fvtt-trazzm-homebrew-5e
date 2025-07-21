/*
    A Line of strong wind 60 feet long and 10 feet wide blasts from you in a direction you choose for the duration. Each
    creature in the Line must succeed on a Strength saving throw or be pushed 15 feet away from you in a direction
    following the Line. A creature that ends its turn in the Line must make the same save.

    Any creature in the Line must spend 2 feet of movement for every 1 foot it moves when moving closer to you.

    The gust disperses gas or vapor, and it extinguishes candles and similar unprotected flames in the area. It causes
    protected flames, such as those of lanterns, to dance wildly and has a 50 percent chance to extinguish them.

    As a Bonus Action on your later turns, you can change the direction in which the Line blasts from you.
*/
const optionName = "Gust of Wind";
const version = "12.4.0";

let targetToken = event.data.token;
if (targetToken) {
    const originActor = await fromUuid(region.flags['region-attacher'].actorUuid);
    //const sourceItem = await fromUuid(region.flags['region-attacher'].itemUuid);

    let targetCombatant = game.combat.getCombatantByToken(targetToken);
    if (targetCombatant) {
        const saveDC = originActor.system.attributes.spelldc;
        const saveFlavor = `${CONFIG.DND5E.abilities["con"].label} DC${saveDC} ${optionName}`;

        let saveRoll = await targetToken.actor.rollAbilitySave("con", {flavor: saveFlavor});
        if (saveRoll.total < saveDC) {
            const attackerToken = MidiQOL.tokenForActor(originActor);
            const pushedToken = MidiQOL.tokenForActor(targetCombatant.actor);
            await HomebrewMacros.pushTarget(attackerToken, pushedToken, 3);
        }
    }
}
