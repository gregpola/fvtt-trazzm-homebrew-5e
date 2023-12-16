/*
    A snowball forms in your hand which you must immediately launch or it will melt. Make a ranged spell attack against
    the target. On a hit, the target takes 1d8 cold damage and becomes chilled, unable to take reactions until the start
    of its next turn.

    The spell creates more than one snowball when you reach higher levels: two snowballs at 5th level, three snowballs
    at 11th level, and four snowballs at 17th level. You can direct the snowballs at the same target or at different ones.
    Make a separate attack roll for each snowball.
 */
const version = "11.0";
const optionName = "Wysard's Snowball";
const snowballItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', 'Wysards Snowball Ball');

try {
    if (args[0].macroPass === "postActiveEffects") {
        const characterLevel = actor.type === "character" ? actor.system.details.level : actor.system.details.cr;
        const missileCount = Math.floor((characterLevel + 1) / 6) + 1;

        // check for need to select targets
        if (workflow.targets.size === 1) {
            let target = workflow.targets.first();
            await launchMissiles(target, missileCount);
        }
        else {
            let targetList = workflow.targets.reduce((list, target) => {
                return list + `<tr><td style="width: 75%">${target.name}</td><td style="width: 25%"><input type="num" id="target" min="0" max="${missileCount}" name="${target.id}"></td></tr>`
            }, "");

            let the_content = `<p>You have <b>${missileCount}</b> total snowball's.</p><form class="flexcol"><table><tbody><tr><th>Target</th><th>Snowballs</th></tr>${targetList}</tbody></table></form>`;

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
                                    ui.notifications.info("More targets selected than available, results will be truncated");
                                }

                                if (spentTotal === 0) {
                                    errorMessage = `The spell fails, no targets.`;
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

async function launchMissiles(targetToken, snowballCount){
    let feature = new CONFIG.Item.documentClass(snowballItem, {'parent': workflow.actor});

    for (let i = 0; i < snowballCount; i++) {
        let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions([targetToken.document.uuid]);
        await MidiQOL.completeItemUse(feature, config, options);
        await warpgate.wait(250);
    }
}
