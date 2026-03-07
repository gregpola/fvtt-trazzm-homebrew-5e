/*
    Handles all the post attack combat maneuvers in a single dialog to minimize the prompts.

    These are the maneuvers handled by this macro:
        - Disarming Attack
        - Distracting Strike
        - Goading Attack
        - Maneuvering Attack
        - Menacing Attack
        - Pushing Attack
        - Trip Attack
*/
const optionName = "Maneuver Handler";
const version = "13.5.0";
const optionsArray = ['Disarming Attack', 'Distracting Strike', 'Goading Attack', 'Maneuvering Attack', 'Menacing Attack', 'Pushing Attack', 'Trip Attack'];

try {
    if (args[0].macroPass === "DamageBonus" && rolledActivity.type === 'attack' && rolledActivity.name !== 'Use Maneuver') {
        // make sure the character has superiority dice available
        const combatSuperiority = actor.items.getName("Combat Superiority");
        if (combatSuperiority) {
            const maxValue = combatSuperiority.system.uses.max;
            const spentValue = combatSuperiority.system.uses.spent;

            if (spentValue < maxValue) {
                // build the dialog content
                let content = `<label>Select the maneuver to apply to this attack:</label>`;
                content += `<sub style="margin-left: 15px;">(${maxValue - spentValue} superiority dice remaining)</sub>`;
                content += '<sub style="margin-left: 15px; margin-bottom: 10px;">Note you cannot use more than one maneuver per attack</sub>';

                let availableManeuvers = actor.items.filter(i => i.type === 'feat' && i.system.type.subtype === 'maneuver' && optionsArray.includes(i.name));
                if (availableManeuvers.length > 0) {
                    let options_content = '';
                    for (let maneuver of availableManeuvers) {
                        options_content += `<option value=${maneuver.id}>${maneuver.name}</option>`;
                    }

                    content += `<p><select name="choice">${options_content}</select></p>`;
                    content += '<div style="margin-bottom: 10px;" />';

                    // prompt the player for the option to use
                    const result = await foundry.applications.api.DialogV2.wait({
                        window: { title: "Combat Superiority Options" },
                        form: { closeOnSubmit: true },
                        content: content,
                        buttons: [
                            {
                                action: "Cast",
                                default: true,
                                label: "Use Maneuver",
                                callback: (event, button, dialog) => {
                                    return button.form.elements.choice.value;
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
                        modal: true
                    });

                    if (result === null || result === "Pass") {
                        return {};
                    }

                    // Use the chosen maneuver
                    const selectedManeuver = availableManeuvers.find(i => i.id === result);
                    if (selectedManeuver) {
                        let activity = selectedManeuver.system.activities.getName("Use Maneuver");
                        if (activity) {
                            for (let targetToken of workflow.hitTargets) {
                                const options = {
                                    midiOptions: {
                                        targetUuids: [targetToken.actor.uuid],
                                        noOnUseMacro: false,
                                        configureDialog: false,
                                        showFullCard: true,
                                        ignoreUserTargets: true,
                                        checkGMStatus: false,
                                        autoRollAttack: true,
                                        autoRollDamage: "always",
                                        fastForwardAttack: true,
                                        fastForwardDamage: true,
                                        workflowData: true
                                    }
                                };

                                await MidiQOL.completeActivityUse(activity.uuid, options, {}, {});
                            }
                        }
                        else {
                            ui.notifications.error(`${optionName}: ${version} - missing Use Maneuver activity in ${selectedManeuver.name}`);
                        }

                        // return the damage bonus  @scale.battle-master.superiority.die
                        const damageType = workflow.defaultDamageType;
                        const diceMult = workflow.isCritical ? 2: 1;
                        const fullSupDie = actor.system.scale["battle-master"].superiority.die;
                        return {damageRoll: `${diceMult}${fullSupDie}[${damageType}]`, flavor: selectedManeuver.name};
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
