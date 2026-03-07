/*
    This weapon starts each day with 3 charges, and refreshes with a long rest. When you hit with a thrown attack using
    this weapon, you can expend one charge to do one of the following actions:

    Distracting Strike. When you hit a creature with a weapon attack, you can expend one charge to distract the creature,
    giving your allies an opening. The next attack roll against the target by an attacker other than you has advantage
    if the attack is made before the start of your next turn.

    Trip Attack. When you hit a creature with a weapon attack, you can expend one charge to attempt to knock the target
    down. If the target is large or smaller, it must make a Strength saving throw. On a failed save, you knock the
    target prone.

    Goading Attack. When you hit a creature with a weapon attack, you can expend one charge to attempt to goad the
    target into attacking you. The target must make a Wisdom saving throw. On a failed save, the target has disadvantage
    on all attack rolls against targets other than you until the end of your next turn.
 */
const version = "13.5.0";
const optionName = "Tacticians Gambit";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
        // TODO make sure the actor hit with a thrown attack
        const targetToken = workflow.hitTargets.first();
        const isThrown = workflow.attackMode === "thrown";
        let eligibleAttack = targetToken && isThrown;

        // make sure the actor has charges remaining
        let usesLeft = macroItem.system.uses?.value ?? 0;

        // check size for trip
        const eligibleForTrip = HomebrewHelpers.isLargeOrSmaller(targetToken)

        if (usesLeft && eligibleAttack) {
            let content = `<p>Do you want to use a special ability? (${usesLeft} uses remaining)</p>
						<label style="margin-right: 10px;"><input type="radio" name="choice" value="no" checked>   No </label>
						<label style="margin-right: 10px;"><input type="radio" name="choice" value="distract" >   Distracting Strike </label>
						<sub style="margin-left: 15px; margin-bottom: 10px;">The next attack roll against the target by an attacker other than you has advantage if the attack is made before the start of your next turn</sub>
						<label style="margin-right: 10px;"><input type="radio" name="choice" value="goad">   Goading Attack </label>
                        <sub style="margin-left: 15px; margin-bottom: 10px;">The target must make a Wisdom saving throw. On a failed save, the target has disadvantage on all attack rolls against targets other than you until the end of your next turn</sub>`;

            if (eligibleForTrip) {
                content += `<label style="margin-right: 10px; margin-bottom: 10px;"><input type="radio" name="choice" value="trip">  Trip Attack </label>`;
                content += '<sub style="margin-left: 15px; margin-bottom: 10px;">On a failed save, you knock the target prone</sub>'
            }

            let optionPicked = await foundry.applications.api.DialogV2.prompt({
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

            const options = {
                midiOptions: {
                    targetUuids: [targetToken.actor.uuid],
                    noOnUseMacro: false,
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

            if (optionPicked === 'distract') {
                let activity = await macroItem.system.activities.find(a => a.identifier === 'distracting-strike');
                if (activity) {
                    MidiQOL.completeActivityUse(activity, options, {}, {});
                }
            }
            else if (optionPicked === 'trip') {
                let activity = await macroItem.system.activities.find(a => a.identifier === 'trip-attack');
                if (activity) {
                    MidiQOL.completeActivityUse(activity, options, {}, {});
                }
            }
            else if (optionPicked === 'goad') {
                let activity = await macroItem.system.activities.find(a => a.identifier === 'goading-attack');
                if (activity) {
                    MidiQOL.completeActivityUse(activity, options, {}, {});
                }
            }
        }
    }
    else if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isAttacked") {
        let maneuverEffect = HomebrewHelpers.findEffect(actor, 'Distracted');
        if (maneuverEffect) {
            await MidiQOL.socket().executeAsGM('removeEffects', {
                'actorUuid': actor.uuid,
                'effects': [maneuverEffect.id]
            });
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
