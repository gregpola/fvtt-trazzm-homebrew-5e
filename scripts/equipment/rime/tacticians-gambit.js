const version = "14.5.1";
const optionName = "Tacticians Gambit";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
        const targetToken = workflow.hitTargets.first();
        let eligibleAttack = targetToken;

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

            const targetUuids = [targetToken.document.uuid];
            if (optionPicked === 'distract') {
                let activity = await macroItem.system.activities.find(a => a.identifier === 'distracting-strike');
                if (activity) {
                    await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
                }
            }
            else if (optionPicked === 'trip') {
                let activity = await macroItem.system.activities.find(a => a.identifier === 'trip-attack');
                if (activity) {
                    await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
                }
            }
            else if (optionPicked === 'goad') {
                let activity = await macroItem.system.activities.find(a => a.identifier === 'goading-attack');
                if (activity) {
                    await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
                }
            }
        }
    }
    else if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isAttacked") {
        let maneuverEffect = HomebrewEffects.findEffect(actor, 'Distracted');
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
