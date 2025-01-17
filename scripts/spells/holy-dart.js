/*
    A small dart of radiant light appears in the caster's hand and can be thrown at a target within range. Make a ranged
    spell attack against the target. On a hit, the target takes 1d8 radiant damage.

    The spell creates more than one dart when you reach higher levels: two darts at 5th level, three darts at 11th level,
    and four darts at 17th level. You can direct the darts at the same target or at different ones. Make a separate
    attack roll for each dart.
 */
const optionName = "Lathander's Holy Dart";
const version = "12.3.0";
let missileItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', 'Holy Dart');

try {
    if (args[0].macroPass === "postActiveEffects") {
        // error checking
        if (!missileItem) {
            return ui.notifications.error("Holy Dart item is not found!");
        }

        const characterLevel = actor.type === "character" ? actor.system.details.level : actor.system.details.cr;
        const missileCount = Math.floor((characterLevel + 1) / 6) + 1;
        const feature = new CONFIG.Item.documentClass(missileItem, {'parent': workflow.actor});

        // check for need to select targets
        if (workflow.targets.size === 1) {
            let target = workflow.targets.first();
            await launchMissiles(feature, target, missileCount);
        }
        else {
            // ask how many missiles per target
            let content = `<p>You have <b>${missileCount}</b> total dart\'s. Select how many for each target:</p><div class="flexcol">`;

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

async function launchMissiles(feature, targetToken, missileCount){
    for (let i = 0; i < missileCount; i++) {
        let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions([targetToken.document.uuid]);
        await MidiQOL.completeItemUse(feature, config, options);
        await HomebrewMacros.wait(250);
    }
}
