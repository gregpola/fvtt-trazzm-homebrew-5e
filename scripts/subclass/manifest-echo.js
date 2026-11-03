/**
 *  You can use a bonus action to magically manifest an echo of yourself in an unoccupied space you can see within
 *  15 feet of you. This echo is a magical, translucent, gray image of you that lasts until it is destroyed, until you
 *  dismiss it as a bonus action, until you manifest another echo, or until you’re incapacitated.
 *
 *  Your echo has AC 14 + your proficiency bonus, 1 hit point, and immunity to all conditions. If it has to make a
 *  saving throw, it uses your saving throw bonus for the roll. It is the same size as you, and it occupies its space.
 *  On your turn, you can mentally command the echo to move up to 30 feet in any direction (no action required). If your
 *  echo is ever more than 30 feet from you at the end of your turn, it is destroyed.
 */
const optionName = "Manifest Echo";
const version = "14.5.0";
const summonEffectName = "Summon: Manifest Echo";

const SIZE_TO_GRID = {
    tiny: 0.5,
    sm: 1,
    med: 1,
    lg: 2,
    huge: 3,
    grg: 4,
};

try {
    if (args[0].macroPass === "preItemRoll") {
        Hooks.once("dnd5e.postSummon", async(activity, profile, tokens, options) => {
            // other updates not supported by the summoning profile
            const newSize = actor.system.traits.size;
            const newGrid = SIZE_TO_GRID[newSize];

            for (let t of tokens) {
                let newName = "Echo of " + actor.name;

                await t.update({
                    name: newName,
                    width: newGrid,
                    height: newGrid
                });
                await t.actor.update({
                    "name": newName,
                    "system.traits.size": newSize
                });
            }
        });
    }
    else if (args[0] === "each" && lastArgValue.turn === 'endTurn') {
        const summonEffect = HomebrewEffects.findEffect(actor, summonEffectName);
        if (summonEffect) {
            let newName = "Echo of " + actor.name;

            // get the echo
            let theEcho = actor.summonedCreatures.find(a => a.name === newName);
            if (theEcho) {
                const summonToken = MidiQOL.tokenForActor(theEcho);
                if (summonToken) {
                    const echoAvatarActive = HomebrewEffects.findEffect(actor, "Echo Avatar");
                    let maxDistance = echoAvatarActive ? 1000 : 30;

                    if (MidiQOL.computeDistance(summonToken, token) > maxDistance) {
                        ui.notifications.warn(`${optionName}: ${version} - you are too far from your echo, removing the summon`);
                        await MidiQOL.socket().executeAsGM('removeEffects', {
                            'actorUuid': actor.uuid,
                            'effects': [summonEffect.id]
                        });
                    }
                }
            }
        }
    }


} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
