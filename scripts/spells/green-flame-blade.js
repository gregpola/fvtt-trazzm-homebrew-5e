/*
	You brandish the weapon used in the spell’s casting and make a melee attack with it against one creature within 5 feet
	of you. On a hit, the target suffers the weapon attack’s normal effects, and you can cause green fire to leap from
	the target to a different creature of your choice that you can see within 5 feet of it. The second creature takes
	fire damage equal to your spellcasting ability modifier.

	This spell’s damage increases when you reach certain levels. At 5th level, the melee attack deals an extra 1d8 fire
	damage to the target on a hit, and the fire damage to the second creature increases to 1d8 + your spellcasting ability
	modifier. Both damage rolls increase by 1d8 at 11th level (2d8 and 2d8) and 17th level (3d8 and 3d8).
 */
const version = "12.4.0";
const optionName = "Green-Flame Blade";
const damageType = "fire";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.hitTargets.first();
        if (targetToken) {
            const cantripDice = 1 + Math.floor((HomebrewHelpers.getLevelOrCR(actor) + 1) / 6);
            await attackNearby(token, macroItem, targetToken, cantripDice);
        }
    }

} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("modules/fvtt-trazzm-homebrew-5e/assets/animations/Flames_01_Regular_Green_200x200.webm")
        .atLocation(target)
        .scaleToObject(2)
        .play();
}

/**
 * Makes a secondary attack on the chosen target.
 * @param {MidiQOL.Workflow} originWorkflow The spell's workflow.
 * @param {Token} primaryTargetToken The primary target's token
 * @param {Array} ignoreIds An array of actor's ids to be ignored as potential secondary targets.
 * @param {number} cantripDice the cantrip dice derived from the caster's level.
 * @returns {void}
 */
async function attackNearby(casterToken, gfbItem, primaryTargetToken, cantripDice) {
    // Get tokens 5 ft from primary target visible by caster
    const potentialTargets = await MidiQOL.findNearby([0, 1], primaryTargetToken, 5, {canSee: true});
    if (potentialTargets.length === 0) {
        console.warn(`${optionName}: No potential secondary target.`);
        return;
    }

    const secondaryTarget = await HomebrewHelpers.pickTarget(potentialTargets, `${optionName} - select leap target:`)
    if (secondaryTarget) {
        let activity = gfbItem.system.activities.getName("Leap Damage");
        if (activity) {
            const options = {
                midiOptions: {
                    targetsToUse: new Set([secondaryTarget]),
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

            await anime(casterToken, secondaryTarget);
            await MidiQOL.completeActivityUse(activity, options, {}, {});
        }
    }
}
