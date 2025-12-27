/*
	Once per turn when you hit a creature with an attack roll and deal Cold damage, you can temporarily negate the
	creature’s defenses. The creature subtracts [[/r 1d4]] from the next saving throw it makes before the end of your next turn.
*/
const optionName = "Cold Caster - Frostbite";
const version = "13.5.0";
const damageType = "cold";
const timeFlag = "cold-caster-frostbite-time";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postDamageRoll") {
        if (["mwak", "rwak", "msak", "rsak"].includes(rolledActivity.actionType)) {
            // make sure it's an allowed attack
            if (workflow.damageDetail.filter(i=>i.type === damageType).length < 1) {
                console.debug(`${optionName}: ${version} - not ${damageType} damage`);
                return;
            }

            const targetToken = workflow.targets.first();

            // ask the player if they want to use the feat
            if (HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) && game.combat) {
                const applyDebuff = await foundry.applications.api.DialogV2.confirm({
                    window: {
                        title: `${optionName}`,
                    },
                    content: `<p>Apply frostbite to ${targetToken.name}?</p>`,
                    rejectClose: false,
                    modal: true
                });

                if (applyDebuff) {
                    await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);

                    let activity = await macroItem.system.activities.find(a => a.identifier === 'frostbite');
                    if (activity) {
                        const options = {
                            midiOptions: {
                                targetsToUse: new Set([targetToken]),
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

                        await MidiQOL.completeActivityUse(activity, options, {}, {});
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
