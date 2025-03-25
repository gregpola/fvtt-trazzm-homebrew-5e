/*
    A snowball forms in your hand which you must immediately launch or it will melt. Make a ranged spell attack against
    the target. On a hit, the target takes 1d8 cold damage and becomes chilled, unable to take reactions until the start
    of its next turn.

    The spell creates more than one snowball when you reach higher levels: two snowballs at 5th level, three snowballs
    at 11th level, and four snowballs at 17th level. You can direct the snowballs at the same target or at different ones.
    Make a separate attack roll for each snowball.
 */
const version = "12.3.0";
const optionName = "Wysard's Snowball";
const snowballItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', 'Wysards Snowball Ball');

try {
    if (args[0].macroPass === "postActiveEffects") {
        const characterLevel = actor.type === "character" ? actor.system.details.level : actor.system.details.cr;
        const missileCount = Math.floor((characterLevel + 1) / 6) + 1;
        const feature = new CONFIG.Item.documentClass(snowballItem, {'parent': workflow.actor});

        // check for need to select targets
        if (workflow.targets.size === 1) {
            let target = workflow.targets.first();
            await launchMissiles(feature, target, missileCount);
        }
        else {
            // ask how many missiles per target
            let content = `<p>You have <b>${missileCount}</b> total snowball\'s. Select how many for each target:</p><div class="flexcol">`;

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

async function launchMissiles(feature, targetToken, snowballCount){
    for (let i = 0; i < snowballCount; i++) {
        let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions([targetToken.document.uuid]);
        await MidiQOL.completeItemUse(feature, config, options);
        await HomebrewMacros.wait(250);
    }
}
