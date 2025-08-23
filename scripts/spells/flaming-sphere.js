/*
    You create a 5-foot-diameter sphere of fire in an unoccupied space on the ground within range. It lasts for the
    duration. Any creature that ends its turn within 5 feet of the sphere makes a Dexterity saving throw, taking 2d6
    Fire damage on a failed save or half as much damage on a successful one.
*/
const optionName = "Flaming Sphere";
const version = "12.4.0";

try {
    if (args[0] === "each" && lastArgValue.turn === 'endTurn') {
        await applySpellDamage(token.document, macroItem);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

// target token must be a document
async function applySpellDamage(targetToken, sourceItem) {
    if (targetToken) {
        let targetCombatant = game.combat.getCombatantByToken(targetToken);
        if (targetCombatant) {
            // synthetic activity use
            const activity = sourceItem.system.activities.find(a => a.identifier === 'flaming-aura-damage');
            if (activity) {
                let targetUuids = [targetToken.uuid];

                const options = {
                    midiOptions: {
                        targetUuids: targetUuids,
                        noOnUseMacro: true,
                        configureDialog: false,
                        showFullCard: false,
                        ignoreUserTargets: true,
                        checkGMStatus: true,
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
