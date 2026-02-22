/*
	Eight rays of light flash from you in a 60-foot Cone. Each creature in the Cone makes a Dexterity saving throw. For
	each target, roll 1d8 to determine which color ray affects it, consulting the Prismatic Rays table.

    overtime effects:
    label="Prismatic Spray - Indigo Ray", turn=end, saveDC=@attributes.spell.dc, saveAbility=con, saveCount=3-, failCount=3-petrified
    label="Prismatic Spray - Violet Ray", turn=end, saveDC=@attributes.spell.dc, saveAbility=wis, saveCount=1-, failCount=1-petrified, actionSave=roll

*/
const optionName = "Prismatic Spray";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let redSet = []; // 1
        let orangeSet = []; // 2
        let yellowSet = []; // 3
        let greenSet = []; // 4
        let blueSet = []; // 5
        let indigoSet = []; // 6
        let violetSet = []; // 7
        // 8 - two beams

        // determine beams hitting each target
        for (let targetToken of workflow.targets) {
            let targetCombatant = game.combat.getCombatantByToken(token.document);
            if (targetCombatant) {
                let beamRoll = await new Roll('1d8').evaluate();

                switch (beamRoll.total) {
                    case 1:
                        redSet.push(targetToken);
                        break;
                    case 2:
                        orangeSet.push(targetToken);
                        break;
                    case 3:
                        yellowSet.push(targetToken);
                        break;
                    case 4:
                        greenSet.push(targetToken);
                        break;
                    case 5:
                        blueSet.push(targetToken);
                        break;
                    case 6:
                        indigoSet.push(targetToken);
                        break;
                    case 7:
                        violetSet.push(targetToken);
                        break;
                    case 8: {
                        let beam1Roll = await new Roll('1d7').evaluate();
                        switch (beam1Roll.total) {
                            case 1:
                                redSet.push(targetToken);
                                break;
                            case 2:
                                orangeSet.push(targetToken);
                                break;
                            case 3:
                                yellowSet.push(targetToken);
                                break;
                            case 4:
                                greenSet.push(targetToken);
                                break;
                            case 5:
                                blueSet.push(targetToken);
                                break;
                            case 6:
                                indigoSet.push(targetToken);
                                break;
                            case 7:
                                violetSet.push(targetToken);
                                break;
                        }

                        let beam2Roll = await new Roll('1d7').evaluate();
                        switch (beam2Roll.total) {
                            case 1:
                                redSet.push(targetToken);
                                break;
                            case 2:
                                orangeSet.push(targetToken);
                                break;
                            case 3:
                                yellowSet.push(targetToken);
                                break;
                            case 4:
                                greenSet.push(targetToken);
                                break;
                            case 5:
                                blueSet.push(targetToken);
                                break;
                            case 6:
                                indigoSet.push(targetToken);
                                break;
                            case 7:
                                violetSet.push(targetToken);
                                break;
                        }
                        break;
                    }
                }
            }
        }

        // apply beams to targets
        if (redSet.length > 0) {
            await applyRedBeam(redSet);
        }

        if (orangeSet.length > 0) {
            await applyOrangeBeam(orangeSet);
        }

        if (yellowSet.length > 0) {
            await applyYellowBeam(yellowSet);
        }

        if (greenSet.length > 0) {
            await applyGreenBeam(greenSet);
        }

        if (blueSet.length > 0) {
            await applyBlueBeam(blueSet);
        }

        if (indigoSet.length > 0) {
            await applyIndigoBeam(indigoSet);
        }

        if (violetSet.length > 0) {
            await applyVioletBeam(violetSet);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyRedBeam(targets){
    const activity = macroItem.system.activities.find(a => a.identifier === 'red-ray');
    if (activity) {
        const options = {
            midiOptions: {
                targetUuids: targets.map(t => t.document.uuid),
                noOnUseMacro: false,
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
        await HomebrewMacros.wait(500);
    }
}

async function applyOrangeBeam(targets){
    const activity = macroItem.system.activities.find(a => a.identifier === 'orange-ray');
    if (activity) {
        const options = {
            midiOptions: {
                targetUuids: targets.map(t => t.document.uuid),
                noOnUseMacro: false,
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
        await HomebrewMacros.wait(500);
    }
}

async function applyYellowBeam(targets){
    const activity = macroItem.system.activities.find(a => a.identifier === 'yellow-ray');
    if (activity) {
        const options = {
            midiOptions: {
                targetUuids: targets.map(t => t.document.uuid),
                noOnUseMacro: false,
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
        await HomebrewMacros.wait(500);
    }
}

async function applyGreenBeam(targets){
    const activity = macroItem.system.activities.find(a => a.identifier === 'green-ray');
    if (activity) {
        const options = {
            midiOptions: {
                targetUuids: targets.map(t => t.document.uuid),
                noOnUseMacro: false,
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
        await HomebrewMacros.wait(500);
    }
}

async function applyBlueBeam(targets){
    const activity = macroItem.system.activities.find(a => a.identifier === 'blue-ray');
    if (activity) {
        const options = {
            midiOptions: {
                targetUuids: targets.map(t => t.document.uuid),
                noOnUseMacro: false,
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
        await HomebrewMacros.wait(500);
    }
}

async function applyIndigoBeam(targets){
    const activity = macroItem.system.activities.find(a => a.identifier === 'indigo-ray');
    if (activity) {
        const options = {
            midiOptions: {
                targetUuids: targets.map(t => t.document.uuid),
                noOnUseMacro: false,
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
        await HomebrewMacros.wait(500);
    }
}

async function applyVioletBeam(targets){
    const activity = macroItem.system.activities.find(a => a.identifier === 'violet-ray');
    if (activity) {
        const options = {
            midiOptions: {
                targetUuids: targets.map(t => t.document.uuid),
                noOnUseMacro: false,
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
        await HomebrewMacros.wait(500);
    }
}
