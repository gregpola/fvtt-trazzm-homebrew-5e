/**
 *  As a bonus action, you can teleport, magically swapping places with your echo at a cost of 15 feet of your movement,
 *  regardless of the distance between the two of you.
 */
const optionName = "Manifest Echo - Swap Places";
const version = "14.5.0";
const summonEffectName = "Summon: Manifest Echo";

try {
    let failure = false;
    if (args[0].macroPass === "postActiveEffects") {
        const summonEffect = HomebrewEffects.findEffect(actor, summonEffectName);
        if (summonEffect) {
            let newName = "Echo of " + actor.name;

            // get the echo
            let theEcho = actor.summonedCreatures.find(a => a.name === newName);
            if (theEcho) {
                const summonToken = MidiQOL.tokenForActor(theEcho);

                if (summonToken) {
                    await HomebrewMacros.swapTokenPositions(token, summonToken);
                }
                else {
                    failure = true;
                }
            }
            else {
                failure = true;
            }
        }
        else {
            failure = true;
        }
    }

    if (failure) {
        ui.notifications.error(`${optionName}: ${version} - no Echo found`);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
