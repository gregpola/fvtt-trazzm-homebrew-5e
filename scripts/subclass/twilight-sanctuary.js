/**
 *  Whenever a creature (including you) ends its turn in the sphere, you can grant that creature one of these benefits:
 *
 *      + You grant it temporary hit points equal to 1d6 plus your cleric level.
 *      + You end one effect on it causing it to be charmed or frightened.
 */
const optionName = "Twilight Sanctuary";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.targets.first();
        if (targetToken) {
            // check for charmed or frightened condition
            const isCharmed = targetToken.actor.statuses.has("charmed");
            const isFrightened = targetToken.actor.statuses.has("frightened");

            let content =
                `<p>Choose the ${optionName} option for this turn:</p>
                <label><input type="radio" name="choice" value="temp" checked> Grant temporary hit points</label>`;

            if (isCharmed) {
                content += `<label><input type="radio" name="choice" value="charmed"> End Charmed condition</label>`;
            }

            if (isFrightened) {
                content += `<label><input type="radio" name="choice" value="frightened"> End Frightened condition</label>`;
            }

            // ask which
            const selection = await foundry.applications.api.DialogV2.prompt({
                content: content,
                rejectClose: false,
                ok: {
                    callback: (event, button, dialog) => {
                        return button.form.elements.choice.value;
                    }
                },
                window: {
                    title: `${optionName}`,
                },
                position: {
                    width: 400
                }
            });

            switch (selection) {
                case 'temp':
                    const activity = macroItem.system.activities.getName("Grant Temp HP");
                    if (activity) {
                        const targetUuids = [targetToken.uuid];
                        await MidiQOL.completeActivityUse(activity, {midiOptions: {targetUuids}});
                    }
                    break;
                case 'charmed':
                    await HomebrewEffects.removeCondition(targetToken.actor, "charmed");
                    break;
                case 'frightened':
                    await HomebrewEffects.removeCondition(targetToken.actor, "frightened");
                    break;
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
