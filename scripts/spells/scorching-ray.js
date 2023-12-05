/*
    You create three rays of fire and hurl them at targets within range. You can hurl them at one target or several.

    Make a ranged spell attack for each ray. On a hit, the target takes 2d6 fire damage.

    At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, you create one additional ray for each slot level above 2nd.
 */
const optionName = "Scorching Ray";
const version = "11.0";
const damageType = "fire";
let beamItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', 'Scorching Ray Ray');

try {
    if (args[0].macroPass === "postActiveEffects") {
        const spellLevel = workflow.castData.castLevel;
        const missileCount = 3 + (spellLevel - 2);

        // check for need to select targets
        if (workflow.targets.size === 1) {
            let target = workflow.targets.first();
            await launchMissiles(target, missileCount);
        }
        else {
            let targetList = workflow.targets.reduce((list, target) => {
                return list + `<tr><td style="width: 75%">${target.name}</td><td style="width: 25%"><input type="num" id="target" min="0" max="${missileCount}" name="${target.id}"></td></tr>`
            }, "");

            let the_content = `<p>You have <b>${missileCount}</b> total ${item.name}'s.</p><form class="flexcol"><table><tbody><tr><th>Target</th><th>Rays</th></tr>${targetList}</tbody></table></form>`;

            let dialog = new Promise(async (resolve, reject) => {
                let errorMessage;
                new Dialog({
                    title: `${item.name} Targets`,
                    content: the_content,
                    buttons: {
                        damage: {
                            label: "Cast", callback: async (html) => {
                                let spentTotal = 0;
                                let selected_targets = html.find('input#target');
                                for (let get_total of selected_targets) {
                                    spentTotal += Number(get_total.value);
                                }

                                if (spentTotal > missileCount) {
                                    ui.notifications.info("More ray targets selected than available, results will be clipped");
                                }

                                if (spentTotal === 0) {
                                    errorMessage = `The spell fails, no rays targeted.`;
                                    ui.notifications.error(errorMessage);
                                }
                                else {
                                    let sentMissiles = 0;
                                    for (let selected_target of selected_targets) {
                                        let damageNum = selected_target.value;
                                        if (damageNum != null) {
                                            let targetCount = Number(damageNum);
                                            if ((targetCount + sentMissiles) > missileCount) {
                                                targetCount = missileCount - sentMissiles;
                                            }

                                            if (targetCount < 1)
                                                break;

                                            let target_id = selected_target.name;
                                            let targetToken = canvas.tokens.get(target_id);
                                            sentMissiles += targetCount;
                                            await launchMissiles(targetToken, targetCount);
                                        }
                                    }
                                }
                                resolve();
                            }
                        }
                    },
                    close: async (html) => {
                        if(errorMessage) reject(new Error(errorMessage));
                    },
                    default: "damage"
                }).render(true);
            });
            await dialog;
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function launchMissiles(targetToken, beamCount){
    let feature = new CONFIG.Item.documentClass(beamItem, {'parent': workflow.actor});

    for (let i = 0; i < beamCount; i++) {
        let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions([targetToken.document.uuid]);
        await MidiQOL.completeItemUse(feature, config, options);
        await warpgate.wait(250);
    }
}
