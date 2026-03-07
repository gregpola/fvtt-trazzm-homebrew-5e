/*
    When you're within 5 feet of a creature on your turn, you can expend one Superiority Die and switch places with that
    creature, provided you spend at least 5 feet of movement and the creature is willing and doesn't have the
    Incapacitated condition. This movement doesn't provoke Opportunity Attacks.

    Roll the Superiority Die. Until the start of your next turn, you or the other creature (your choice) gains a bonus
    to AC equal to the number rolled.
*/
const optionName = "Bait and Switch";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.targets.first();
        if (targetToken) {
            // ask who gets the AC bonus
            const content = '<p>Who gets the AC bonus?</p>' +
                `<label><input type="radio" name="choice" value="self" checked>  ${actor.name} </label>` +
                `<label><input type="radio" name="choice" value="target">  ${targetToken.name} </label>`;

            let acTarget = await foundry.applications.api.DialogV2.prompt({
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

            if (acTarget) {
                let targetArray = [];
                if (acTarget === 'self') {
                    targetArray.push(actor.uuid);
                }
                else {
                    targetArray.push(targetToken.actor.uuid);
                }

                const options = {
                    midiOptions: {
                        targetUuids: targetArray,
                        noOnUseMacro: false,
                        configureDialog: false,
                        showFullCard: false,
                        ignoreUserTargets: true,
                        checkGMStatus: false,
                        autoRollAttack: true,
                        autoRollDamage: "always",
                        fastForwardAttack: true,
                        fastForwardDamage: true,
                        workflowData: false
                    }
                };

                let activity = await macroItem.system.activities.find(a => a.identifier === 'ac-bonus');
                if (activity) {
                    MidiQOL.completeActivityUse(activity, options, {}, {});
                }

                await HomebrewMacros.swapTokenPositions(token, targetToken);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
