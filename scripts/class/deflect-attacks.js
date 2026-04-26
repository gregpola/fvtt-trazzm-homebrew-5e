/*
    When an attack roll hits you and its damage includes Bludgeoning, Piercing, or Slashing damage, you can take a
    Reaction to reduce the attack's total damage against you. The reduction equals 1d10 plus your Dexterity modifier and
    Monk level.

    If you reduce the damage to 0, you can expend 1 Focus Point to redirect some of the attack's force. If you do so,
    choose a creature you can see within 5 feet of yourself if the attack was a melee attack or a creature you can see
    within 60 feet of yourself that isn't behind Total Cover if the attack was a ranged attack. That creature must
    succeed on a Dexterity saving throw or take damage equal to two rolls of your Martial Arts die plus your Dexterity
    modifier. The damage is the same type dealt by the attack.
*/
const optionName = "Deflect Attacks";
const version = "13.5.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isDamaged") {
        const damageTotal = workflow.damageItem.totalDamage;
        const damageReduced = actor.getFlag("world", "utilityRoll");
        await actor.unsetFlag("world", "utilityRoll");

        // reduce the damage
        await HomebrewHelpers.modifyDamageApplied(workflow.damageItem, -Math.min(damageTotal, damageReduced));

        // check for redirect
        if (damageReduced >= damageTotal) {
            // check the range
            const maxRange = ["mwak", "msak"].includes(rolledActivity.actionType) ? 5 : 60;

            // collect potential targets
            const nearTarget = MidiQOL.findNearby([CONST.TOKEN_DISPOSITIONS.HOSTILE, CONST.TOKEN_DISPOSITIONS.NEUTRAL], token, maxRange, {canSee: true});
            const monksFocus = actor.items.getName("Monk's Focus");

            if (monksFocus && (monksFocus.system.uses.spent < monksFocus.system.uses.max) && nearTarget && (nearTarget.length > 0) ) {
                const focusRemaining = monksFocus.system.uses.max - monksFocus.system.uses.spent;

                // build target data
                let targetContent = '';

                nearTarget.forEach((target) => {
                    var distance = MidiQOL.computeDistance(token, target);
                    var currentHP = target.actor.system.attributes.hp.value;
                    var maxHP = target.actor.system.attributes.hp.max;

                    let targetRow = `<tr>
                        <td style="width: 45%"><label><input type="radio" name="choice" value="${target.id}">  ${target.name}</label></td>
                        <td style="width: 20%"><img src="${target.document.texture.src}" width="50" height="50" /></td>
                        <td style="width: 15%">range=${distance}</td>
                        <td style="width: 20%">hp=${currentHP} of ${maxHP}</td></tr>`;

                    if (targetContent.length === 0) {
                        targetRow = `<tr>
                        <td style="width: 45%"><label><input type="radio" name="choice" value="${target.id}" checked>${target.name}</label></td>
                        <td style="width: 20%"><img src="${target.document.texture.src}" width="50" height="50" /></td>
                        <td style="width: 15%">range=${distance}</td>
                        <td style="width: 20%">hp=${currentHP} of ${maxHP}</td></tr>`;
                    }

                    targetContent += targetRow;
                });

                const content = `
			        <div class="form-group">
                        <table style="width:100%">
                            <thead>
                                <tr><th colspan="5">Do you want to use Deflect Missiles redirect attack?</th></tr>
                                <tr><th colspan="5"><sub>Focus Points remaining: ${focusRemaining}</sub></th></tr>
                            </thead>
                            <tbody>${targetContent}</tbody>
                        </table>
                    </div>`;

                // ask if they want to redirect
                const result = await foundry.applications.api.DialogV2.wait({
                    window: { title: `${optionName} - Redirect` },
                    form: { closeOnSubmit: true },
                    content: content,
                    buttons: [
                        {
                            action: "Attack",
                            default: true,
                            label: "Redirect",
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
                    return;
                }

                const targetToken = nearTarget.find(t => t.id === result);
                if (targetToken) {
                    let activity = macroItem.system.activities.getName("Redirect");
                    if (activity) {
                        const options = {
                            midiOptions: {
                                targetUuids: [targetToken.actor.uuid],
                                noOnUseMacro: true,
                                configureDialog: false,
                                showFullCard: false,
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
                    else {
                        ui.notifications.error(`${optionName}: ${version} - missing Redirect activity`);
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}