const optionName = "Sheathed in Booming Energy";
const version = "13.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "booming-sheathed";

try {
    if (args[0] === "on") {
        const hookId = Hooks.on('moveToken', tokenMoved);
        await actor.setFlag(_flagGroup, _flagName, { hook: hookId, itemId: item.uuid});

    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyMoveDamage(targetToken, macroItem) {
    let activity = macroItem.system.activities.getName("Booming Move Damage");
    if (activity) {
        const options = {
            midiOptions: {
                targetsToUse: new Set([targetToken]),
                noOnUseMacro: false,
                configureDialog: false,
                showFullCard: false,
                ignoreUserTargets: true,
                checkGMStatus: true,
                autoRollAttack: true,
                autoRollDamage: "always",
                fastForwardAttack: true,
                fastForwardDamage: true,
                workflowData: false
            }
        };

        await MidiQOL.completeActivityUse(activity, options, {}, {});
    }
}

async function tokenMoved(token, movement, options, user) {
    if (token.actor) {
        let flag = token.actor.getFlag(_flagGroup, _flagName);
        if (flag) {
            const isFinalMovement = !movement.pending.waypoints.length;
            if (isFinalMovement) {
                Hooks.off('moveToken', flag.hook);

                // get the source item
                const sourceItem = await fromUuid(flag.itemId);
                await token.actor.unsetFlag(_flagGroup, _flagName);
                if (sourceItem) {
                    await applyMoveDamage(token, sourceItem);
                }
            }
        }
    }
}
