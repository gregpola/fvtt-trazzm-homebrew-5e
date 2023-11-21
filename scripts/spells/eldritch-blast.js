/*
    A beam of crackling energy streaks toward a creature within range. Make a ranged spell attack against the target. On
    a hit, the target takes 1d10 force damage.

    The spell creates more than one beam when you reach higher levels: two beams at 5th level, three beams at 11th level,
    and four beams at 17th level. You can direct the beams at the same target or at different ones. Make a separate attack
    roll for each beam.
 */
const optionName = "Eldritch Blast";
const version = "11.0";
const beamItemId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.6LElEQR61ukSJKhU";
let beamItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', 'Eldritch Blast Beam');

try {
    if (args[0].macroPass === "postActiveEffects") {
        // error checking
        if (!beamItem) {
            return ui.notifications.error("Eldritch Blast Beam item is not found!");
        }

        const characterLevel = actor.type === "character" ? actor.system.details.level : actor.system.details.cr;
        const beamCount = Math.floor((characterLevel + 1) / 6) + 1;

        // update the beam stats based on actor features, such as agonizing blast
        const spellcastingAbility = actor.system.attributes.spellcasting;
        const abilityBonus = actor.system.abilities[spellcastingAbility].mod;

        const agonizingBlast = actor.items.getName("Invocation: Agonizing Blast");
        if (agonizingBlast) {
            let damageParts = beamItem.system.damage.parts;
            damageParts[0][0] = damageParts[0][0] + '+' + abilityBonus;
            beamItem.system.damage.parts = damageParts;
        }

        // check for need to select targets
        if (workflow.targets.size === 1) {
            let target = workflow.targets.first();
            await launchMissiles(target, beamCount);
        }
        else {
            let targetList = workflow.targets.reduce((list, target) => {
                return list + `<tr><td style="width: 75%">${target.name}</td><td style="width: 25%"><input type="num" id="target" min="0" max="${beamCount}" name="${target.id}"></td></tr>`
            }, "");

            let the_content = `<p>You have <b>${beamCount}</b> total beam's. Select how many target each:</p><form class="flexcol"><table><tbody><tr><th>Target</th><th>Beams</th></tr>${targetList}</tbody></table></form>`;

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

                                if (spentTotal > beamCount) {
                                    ui.notifications.info("More beam targets selected than available, results will be clipped");
                                }

                                if (spentTotal === 0) {
                                    errorMessage = `The spell fails, no beams targeted.`;
                                    ui.notifications.error(errorMessage);
                                }
                                else {
                                    let sentMissiles = 0;
                                    for (let selected_target of selected_targets) {
                                        let damageNum = selected_target.value;
                                        if (damageNum != null) {
                                            let targetCount = Number(damageNum);
                                            if ((targetCount + sentMissiles) > beamCount) {
                                                targetCount = beamCount - sentMissiles;
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
