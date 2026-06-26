const version = "14.5.1";
const optionName = "Experimental Elixir - Apply";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "experimental-elixir-choice";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetUuids = Array.from(workflow.targets).map(t => t.document.uuid);
        let elixirChoice = macroItem.getFlag(_flagGroup, _flagName);
        let elixirRollValue = 0;

        if (elixirChoice) {
            elixirRollValue = 6;
        }
        else {
            const elixirEffectRoll = await new Roll('1d6').evaluate();
            await game.dice3d?.showForRoll(elixirEffectRoll);
            elixirRollValue = elixirEffectRoll.total;
        }

        let activity;
        switch (elixirRollValue) {
            case 1:
                activity = macroItem.system.activities.getName('Healing');
                if (activity) await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
                break;

            case 2:
                activity = macroItem.system.activities.getName('Swiftness');
                if (activity) await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
                break;

            case 3:
                activity = macroItem.system.activities.getName('Resilience');
                if (activity) await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
                break;

            case 4:
                activity = macroItem.system.activities.getName('Boldness');
                if (activity) await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
                break;

            case 5:
                activity = macroItem.system.activities.getName('Flight');
                if (activity) await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
                break;

            case 6:
            {
                let optionRows = `<label><input type="radio" name="choice" value="Healing" checked>  Healing </label>` +
                    `<label><input type="radio" name="choice" value="Swiftness">  Swiftness </label>` +
                    `<label><input type="radio" name="choice" value="Resilience">  Resilience </label>` +
                    `<label><input type="radio" name="choice" value="Boldness">  Boldness </label>` +
                    `<label><input type="radio" name="choice" value="Flight">  Flight </label>`;

                let tableBody = optionRows;

                // ask which option to apply
                let content = `
                  <form>
                    <div>
                        <div><strong><label>Select the elixir option:</label></strong></div>
                    </div><hr />`;

                content += tableBody;
                content += '<hr /></form>';


                const result = await foundry.applications.api.DialogV2.prompt({
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

                if (result) {
                    activity = macroItem.system.activities.getName(result);
                    if (activity) await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
                }
            }
                break;
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
