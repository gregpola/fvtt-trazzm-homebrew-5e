/*
    Squirming, ebony tentacles fill a 20-foot square on ground that you can see within range. For the duration, these
    tentacles turn the ground in that area into &Reference[DifficultTerrain].

    Each creature in that area makes a Strength saving throw. On a failed save, it takes 3d6 Bludgeoning damage, and it
    has the &Reference[Restrained apply=false] condition until the spell ends. A creature also makes that save if it
    enters the area or ends it turn there. A creature makes that save only once per turn.

    A Restrained creature can take an action to make a [[/check ability=str skill=ath dc=@attributes.spell.dc]] check
    against your spell save DC, ending the condition on itself on a success.
*/
const optionName = "In Evard's Black Tentacles";
const version = "14.5.0";
const timeFlag = "last-tentacle-damage";

try {
    if (args[0] === "on") {
        console.debug(`${optionName}: ${version} ---> ON`);
        await applyTokenHandler(actor, token, effect);
    }
    else if (args[0] === "off") {
        console.debug(`${optionName}: ${version} ---> OFF`);
    }
    else if (args[0] === "each" && lastArgValue.turn === 'endTurn') {
        console.debug(`${optionName}: ${version} ---> EACH`);
        await applyTokenHandler(actor, token, effect);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyTokenHandler(actor, token, effect) {
    if (actor && effect && HomebrewHelpers.perTurnCheck(actor, timeFlag, 'tokenTurnEnd')) {
        const effectSource = await effect.getSource();
        //const sourceActor = await fromUuid(effectSource.system.sourceActorUuid);
        const sourceItem = await fromUuid(effectSource.system.sourceItemUuid);

        if (sourceItem) {
            const tokenHandler = await sourceItem.system.activities.find(a => a.identifier === 'token-handler');
            if (tokenHandler) {
                const targetUuids = [token.document.uuid];
                await HomebrewHelpers.setTurnCheck(actor, timeFlag);
                await MidiQOL.completeActivityUse(tokenHandler, {midiOptions: {targetUuids}});
            }
        }
    }
}