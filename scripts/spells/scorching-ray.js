/*
    You create three rays of fire and hurl them at targets within range. You can hurl them at one target or several.

    Make a ranged spell attack for each ray. On a hit, the target takes 2d6 fire damage.

    At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, you create one additional ray for each slot level above 2nd.
 */
const optionName = "Scorching Ray";
const version = "12.3.0";
const damageType = "fire";
let missileItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', 'Scorching Ray');

try {
    if (args[0].macroPass === "postActiveEffects") {
        const spellLevel = workflow.castData.castLevel;
        const missileCount = 3 + (spellLevel - 2);
        const feature = new CONFIG.Item.documentClass(missileItem, {'parent': workflow.actor});

        // check for need to select targets
        if (workflow.targets.size === 1) {
            let target = workflow.targets.first();
            await launchMissiles(feature, target, missileCount);
        }
        else {
            // ask how many missiles per target
            let content = `<p>You have <b>${missileCount}</b> total ray\'s. Select how many for each target:</p><div class="flexcol">`;

            for (let target of workflow.targets) {
                content += `<div className="flexrow" style="margin-bottom: 10px;"><label style="width: 75%">${target.name}</label><input type="number" name="target" min="0" max="${missileCount}" step="1" value="1" autofocus style="width: 25%;margin-left: 15px;"/></div>`;
            }
            content += `</div>`;

            let targetData = await foundry.applications.api.DialogV2.prompt({
                window: {title: `${item.name} Targets`},
                content: content,
                ok: {
                    label: "Cast",
                    callback: (event, button, dialog) => {
                        let sentMissiles = 0;
                        let resultData = [];

                        for (let beamTarget of button.form.elements.target) {
                            let targetCount = beamTarget.valueAsNumber;
                            if (targetCount > 0) {
                                let actualCount = Math.min(targetCount, missileCount - sentMissiles);

                                // get the target token
                                let targetName = beamTarget.previousSibling.innerText.trim();
                                let targetToken = workflow.targets.find(t => t.name === targetName);
                                if (targetToken) {
                                    resultData.push({target: targetToken, count: actualCount});
                                }

                                sentMissiles += actualCount;
                                if (sentMissiles === missileCount)
                                    break;
                            }
                        }

                        return resultData;
                    }
                }
            });

            if (targetData) {
                for (let td of targetData) {
                    await launchMissiles(feature, td.target, td.count);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function launchMissiles(feature, targetToken, beamCount){
    for (let i = 0; i < beamCount; i++) {
        let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions([targetToken.document.uuid]);
        await MidiQOL.completeItemUse(feature, config, options);
        await HomebrewMacros.wait(250);
    }
}
