/*
    A snowball forms in your hand which you must immediately launch or it will melt. Make a ranged spell attack against
    the target. On a hit, the target takes 1d8 cold damage and becomes chilled, unable to take reactions until the start
    of its next turn.

    The spell creates more than one snowball when you reach higher levels: two snowballs at 5th level, three snowballs
    at 11th level, and four snowballs at 17th level. You can direct the snowballs at the same target or at different ones.
    Make a separate attack roll for each snowball.
 */
const version = "10.0";
const optionName = "Wysard's Snowball";

try {
    const lastArg = args[args.length - 1];
    const actorToken = canvas.tokens.get(lastArg.tokenId);

    if (args[0].macroPass === "postActiveEffects") {
        const wf = scope.workflow;
        const level = Number(lastArg.spellLevel);
        let maxTargets = 1;
        if (level > 4)
            maxTargets++;
        if (level > 10)
            maxTargets++;
        if (level > 16)
            maxTargets++;

        // check target count
        let target = canvas.tokens.get(lastArg.targets[0].id);
        if (lastArg.targets.length === 1 || maxTargets === 1) {


        }
        else {
            // TODO Ask number of snowballs per target
            new Dialog({
                title: "Choose an Effect",
                buttons: {
                    one: {
                        label: "Blindness",
                        callback: async () => {
                            targets.forEach(target => {
                                applyBlindedEffect(wf.uuid, target.actor, saveDC);
                            });
                        }
                    },
                    two: {
                        label: "Deafness",
                        callback: async () => {
                            targets.forEach(target => {
                                applyDeafenedEffect(wf.uuid, target.actor, saveDC);
                            });
                        }
                    }
                },
            }).render(true);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
