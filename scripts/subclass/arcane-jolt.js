/*
    When either you hit a target with an attack roll using a magic weapon or your Steel Defender hits a target, you can
    channel magical energy through the strike to create one of the following effects:

    Destructive Energy. The target takes an extra 2d6 Force damage.

    Restorative Energy. Choose one creature or object you can see within 30 feet of the target. Healing energy flows
    into the chosen recipient, restoring 2d6 Hit Points to it.

    You can use this energy a number of times equal to your Intelligence modifier (minimum of once), but you can do so
    no more than once per turn. You regain all expended uses when you finish a Long Rest.
*/
const optionName = "Arcane Jolt";
const version = "14.5.0";
const timeFlag = "last-arcane-jolt";

try {
    if (args[0].macroPass === "DamageBonus" && workflow.hitTargets.size && HomebrewHelpers.isAvailableThisTurn(actor, timeFlag)) {
        const targetToken = workflow.hitTargets.first();

        // check feature uses
        const maxValue = macroItem.system.uses.max;
        const spentValue = macroItem.system.uses.spent;

        if (spentValue < maxValue) {
            const content = `
				<label style="margin-right: 10px;"><input type="radio" name="choice" value="Destructive" checked> Destructive Energy</label>
				<label style="margin-right: 10px;"><input type="radio" name="choice" value="Restorative"> Restorative Energy</label>`;

            const result = await foundry.applications.api.DialogV2.wait({
                window: { title: "Apply Arcane Jolt?" },
                form: { closeOnSubmit: true },
                content: content,
                buttons: [
                    {
                        action: "Cast",
                        default: true,
                        label: "Cast",
                        callback: (event, button, dialog) => {
                            return button.form.elements.spells.value
                        }
                    },
                    {
                        action: "Pass",
                        default: false,
                        label: "Pass",
                        callback: () => "Pass"
                    },
                ],
                rejectClose: false,
                modal: true,
                position: {
                    width: 400
                }
            });

            if (result === "Destructive") {
                await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
                return new CONFIG.Dice.DamageRoll(`2d6[${optionName}]`, {}, {type: 'force', properties: [...rolledItem.system.properties]});
            }
            else if (result === "Restorative") {
                await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);

                let potentialTargets = await MidiQOL.findNearby(null, targetToken, 30, {canSee: true});
                const healTarget = await HomebrewHelpers.pickTarget(potentialTargets, `${optionName} - select healed target:`)
                if (healTarget) {
                    const targetUuids = [healTarget.document.uuid];
                    const activity = macroItem.system.activities.getName("Restorative Energy");
                    if (activity) await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
