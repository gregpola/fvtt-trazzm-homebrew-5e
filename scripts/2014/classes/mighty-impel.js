/*
    Your connection to giant strength allows you to hurl both allies and enemies on the battlefield. As a bonus action
    while raging, you can choose one Medium or smaller creature within your reach and move it to an unoccupied space you
    can see within 30 feet of yourself. An unwilling creature must succeed on a Strength saving throw
    (DC equals 8 + your proficiency bonus + your Strength modifier) to avoid the effect.

    If, at the end of this movement, the thrown creature isn’t on a surface or liquid that can support it, the creature
    falls, taking damage as normal and landing prone.
*/
const version = "12.3.0";
const optionName = "Mighty Impel";

try {
    const targetToken = workflow.targets.first();

    if (args[0].macroPass === "preItemRoll") {
        if (targetToken) {
            // check range
            const tokenDistance = MidiQOL.computeDistance(targetToken, token);
            let maxRange = HomebrewHelpers.naturalReach(actor);
            if (tokenDistance > maxRange) {
                ui.notifications.error(`${optionName} - target is too far away`);
                return false;
            }
        }
        else {
            ui.notifications.error(`${optionName} - no target selected`);
            return false;
        }

    }
    else if (args[0].macroPass === "postActiveEffects") {
        if (targetToken) {
            // ally?
            if (targetToken.document.disposition === token.document.disposition) {
                // no save
                await throwToken(token, targetToken);
            }
            else {
                const dc = 8 + actor.system.attributes.prof + actor.system.abilities.str.mod;
                const flavor = `${CONFIG.DND5E.abilities["str"].label} DC${dc} ${optionName}`;
                let saveRoll = await targetToken.actor.rollAbilitySave("str", {flavor: flavor, damageType: "push"});
                await game.dice3d?.showForRoll(saveRoll);
                if (saveRoll.total < dc) {
                    await throwToken(token, targetToken);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function throwToken(sourcetoken, targetToken) {
    let origin = {x: sourcetoken.center.x, y: sourcetoken.center.y};

    let position = await new Portal()
        .color("#0f4018")
        .texture(targetToken.document.texture.src)
        .origin(origin)
        .range(30)
        .pick();

    await new Portal()
        .setLocation(position)
        .origin(targetToken)
        .teleport();
}
