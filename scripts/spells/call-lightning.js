const optionName = "Call Lightning";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // ask if in a storm

        const result = await foundry.applications.api.DialogV2.wait({
            window: { title: "Call Lightning" },
            form: { closeOnSubmit: true },
            content: 'Are you outdoors in a storm?',
            buttons: [
                {
                    action: "Yes",
                    default: true,
                    label: "Yes",
                    callback: () => "Yes"
                },
                {
                    action: "No",
                    default: false,
                    label: "No",
                    callback: () => "No"
                },
            ],
            rejectClose: true,
            modal: true,
            position: {
                width: 400
            }
        });

        let callDownActivity = await macroItem.system.activities.find(a => a.identifier === 'call-down-lightning');
        if (result === "Yes") {
            callDownActivity = await macroItem.system.activities.find(a => a.identifier === 'call-down-lightning-in-storm');
        }

        if (callDownActivity) {
            const hookId = Hooks.on("midi-qol.RollComplete", async (wf) => {
                if (wf.id !== workflow.id) return;
                Hooks.off("midi-qol.RollComplete", hookId);
                await MidiQOL.completeActivityUse(callDownActivity, {});
            });
        }
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
