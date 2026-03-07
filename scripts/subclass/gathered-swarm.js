/*
	Once on each of your turns, you can cause the swarm to assist you in one of the following ways, immediately after
	you hit a creature with an attack:

	- The attack’s target takes 1d6 piercing damage from the swarm.
	- The attack’s target must succeed on a Strength saving throw against your spell save DC or be moved by the swarm up
	    to 15 feet horizontally in a direction of your choice.
	- You are moved by the swarm 5 feet horizontally in a direction of your choice.
*/
const optionName = "Gathered Swarm";
const version = "13.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
        const targetToken = workflow.hitTargets.first();
        const isAttack = rolledActivity.type === 'attack';

        if (targetToken && isAttack) {
            // check for availability
            const maxValue = macroItem.system.uses.max;
            const spentValue = macroItem.system.uses.spent;

            if (spentValue < maxValue) {
                const scaleDamage = actor.system.scale.swarmkeeper['swarm-damage'];

                // ask if they want to use the feature
                let content = `<p>Apply ${optionName} to this attack?</p>` +
                    '<sub>Once on each of your turns, you can cause the swarm to assist you</sub>' +
                    '<label><input type="radio" name="choice" value="skip" checked> Skip for this attack</label>' +
                    `<label><input type="radio" name="choice" value="damage"> Target takes ${scaleDamage} piercing damage</label>` +
                    `<label><input type="radio" name="choice" value="moveTarget"> Attempt to move the target</label>` +
                    `<label><input type="radio" name="choice" value="moveSelf"> Move 5 feet in the direction of your choice</label>`;

                let featureOption = await foundry.applications.api.DialogV2.prompt({
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

                if (featureOption && (featureOption !== 'skip')) {
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

                    let optionIdentifier = undefined;
                    switch (featureOption) {
                        // extra damage
                        case 'damage':
                            optionIdentifier = 'swarm-damage';
                            break;

                        // move target
                        case 'moveTarget':
                            optionIdentifier = 'swarm-move';
                            break;

                        // move yourself
                        case 'moveSelf':
                            optionIdentifier = 'swarm-self-move';
                            break;
                    }

                    let activity = await macroItem.system.activities.find(a => a.identifier === optionIdentifier);
                    if (activity) {
                        MidiQOL.completeActivityUse(activity, options, {}, {});
                    }

                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
