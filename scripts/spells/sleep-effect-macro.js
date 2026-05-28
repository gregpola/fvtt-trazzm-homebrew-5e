if (!effect.disabled) {
    await effect.update({disabled: true});

    // now trigger the follow up saving throw
    if (!(actor.system.traits.ci.custom.includes("Magical Sleep") || actor.system.traits.ci.value.has("exhaustion"))) {
        const sourceItem = await fromUuid(origin.origin);
        if (sourceItem) {
            const activity = sourceItem.system.activities.find(a => a.identifier === 'second-save');
            if (activity) {
                let targets = new Set();
                targets.add(token);

                // get the actor owner
                let actorUser = MidiQOL.playerForActor(actor);
                if (!actorUser?.active) {
                    console.info(`${optionName} - unable to locate the actor player, sending to GM`);
                    actorUser = game.users?.activeGM;
                }

                const options = {
                    midiOptions: {
                        targetsToUse: targets,
                        noOnUseMacro: true,
                        configureDialog: false,
                        showFullCard: true,
                        ignoreUserTargets: true,
                        checkGMStatus: false,
                        autoRollAttack: true,
                        autoRollDamage: "always",
                        fastForwardAttack: true,
                        fastForwardDamage: true,
                        asUser: actorUser.id,
                        workflowData: false
                    }
                };

                await MidiQOL.completeActivityUse(activity.uuid, options, {}, {});
            }
        }
    }
}