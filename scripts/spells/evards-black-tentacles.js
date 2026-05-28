/*
    Squirming, ebony tentacles fill a 20-foot square on ground that you can see within range. For the duration, these
    tentacles turn the ground in that area into &Reference[DifficultTerrain].

    Each creature in that area makes a Strength saving throw. On a failed save, it takes 3d6 Bludgeoning damage, and it
    has the &Reference[Restrained apply=false] condition until the spell ends. A creature also makes that save if it
    enters the area or ends it turn there. A creature makes that save only once per turn.

    A Restrained creature can take an action to make a [[/check ability=str skill=ath dc=@attributes.spell.dc]] check
    against your spell save DC, ending the condition on itself on a success.
*/
const optionName = "Evard's Black Tentacles";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            await targetToken.actor.toggleStatusEffect('restrained', {active: true});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
