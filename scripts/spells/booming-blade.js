/*
    You brandish the weapon used in the spell’s casting and make a melee attack with it against one creature within
    5 feet of you. On a hit, the target suffers the weapon attack’s normal effects and then becomes sheathed in booming
    energy until the start of your next turn. If the target willingly moves 5 feet or more before then, the target takes
    1d8 thunder damage, and the spell ends.

    This spell’s damage increases when you reach certain levels. At 5th level, the melee attack deals an extra 1d8
    thunder damage to the target on a hit, and the damage the target takes for moving increases to 2d8. Both damage
    rolls increase by 1d8 at 11th level (2d8 and 3d8) and again at 17th level (3d8 and 4d8).
*/
const optionName = "Booming Blade";
const version = "13.5.1";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "booming-sheathed";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.hitTargets.first();
        if (targetToken !== undefined) {
            // make sure the weapon has Booming Blade on it
            const bbEnchantment = item.effects.find(e => e.type === 'enchantment' && e.name.startsWith('Booming Blade'));
            if (bbEnchantment) {
                await applyMoveEffect(targetToken, macroItem);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyMoveEffect(targetToken, macroItem) {
    let activity = await macroItem.system.activities.find(a => a.identifier === 'sheath-in-booming-energy');
    if (activity) {
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

        await MidiQOL.completeActivityUse(activity, options, {}, {});
    }
}
