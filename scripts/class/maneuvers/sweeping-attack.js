/*
	When you hit a creature with a melee attack roll using a weapon or an Unarmed Strike, you can expend one Superiority
	Die to attempt to damage another creature. Choose another creature within 5 feet of the original target and within
	your reach. If the original attack roll would hit the second creature, it takes damage equal to the number you roll
	on your Superiority Die. The damage is of the same type dealt by the original attack.
*/
const optionName = "Sweeping Attack";
const version = "13.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "sweeping-attack";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preDamageRoll" && rolledActivity.name !== 'Use Maneuver') {
        const targetToken = workflow.hitTargets.first();
        const allowedAttack = ["mwak"].includes(workflow.activity.actionType);

        let usesLeft = 0;
        const combatSuperiority = actor.items.getName("Combat Superiority");
        if (combatSuperiority) {
            const maxValue = combatSuperiority.system.uses.max;
            const spentValue = combatSuperiority.system.uses.spent;
            usesLeft = maxValue - spentValue;
        }

        if (targetToken && allowedAttack && usesLeft) {
            let newTarget = undefined;

            // find nearby foes
            const nearTarget = MidiQOL.findNearby([CONST.TOKEN_DISPOSITIONS.FRIENDLY, CONST.TOKEN_DISPOSITIONS.NEUTRAL], targetToken, 5, {canSee: true});

            // eliminate targets not close enough for the current attack
            const maxRange = Math.max(Number(item.system.range.value), item.system.range.reach);
            let nearActor = MidiQOL.findNearby(null, token, maxRange, {canSee: true});
            let potentialActor = [];

            if (nearTarget && nearActor) {
                potentialTargets = nearActor.filter(value => nearTarget.includes(value));
                if (!potentialTargets || potentialTargets.length === 0) {
                    return;
                }
            }

            // ask if they want to use the feature and who to attack
            let target_content = ``;
            for (let t of potentialTargets) {
                target_content += `<option value=${t.actor.uuid}>${t.name}</option>`;
            }

            let content = `<p>Use ${optionName}? (${usesLeft} superiority dice remaining)</p>`
                + `<p><select name="targets">${target_content}</select></p>`;

            let targetId = await foundry.applications.api.DialogV2.prompt({
                content: content,
                rejectClose: false,
                ok: {
                    callback: (event, button, dialog) => {
                        return button.form.elements.targets.value
                    }
                },
                window: {
                    title: `${optionName}`,
                },
                position: {
                    width: 400
                }
            });

            if (targetId) {
                let activity = macroItem.system.activities.getName("Use Maneuver");
                if (activity) {
                    // attack classification
                    // to hit bonus
                    // damage type
                    await macroItem.setFlag(_flagGroup, _flagName, {
                        attackTotal: workflow.attackTotal,
                        damageType: workflow.defaultDamageType
                    });

                    const options = {
                        midiOptions: {
                            targetUuids: [targetId],
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
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
