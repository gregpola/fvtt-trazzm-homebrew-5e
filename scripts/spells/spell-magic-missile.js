/*
    You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within
    range. A dart deals 1d4 + 1 force damage to its target. The darts all strike simultaneously, and you can direct them
    to hit one creature or several.

    At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, the spell creates one more dart
    for each slot level above 1st.
 */
const optionName = "Magic Missile";
const version = "11.0";
const damageType = "force";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const spellLevel = workflow.castData.castLevel;
        const missileCount = 2 + spellLevel;

        // check for need to select targets
        if (workflow.targets.size === 1) {
            let target = workflow.targets.first();
            await launchMissiles(target, missileCount);
        }
        else {
            let targetList = workflow.targets.reduce((list, target) => {
                return list + `<tr><td style="width: 75%">${target.name}</td><td style="width: 25%"><input type="num" id="target" min="0" max="${missileCount}" name="${target.id}"></td></tr>`
            }, "");

            let the_content = `<p>You have <b>${missileCount}</b> total ${item.name}'s.</p><form class="flexcol"><table><tbody><tr><th>Target</th><th>Missiles</th></tr>${targetList}</tbody></table></form>`;

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
                                    ui.notifications.info("More missile targets selected than available, results will be clipped");
                                }

                                if (spentTotal === 0) {
                                    errorMessage = `The spell fails, No missiles targeted.`;
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

async function launchMissiles(targetToken, missileCount){
    for (let i = 0; i < missileCount; i++) {
        let damageRoll = new Roll(`1d4+1[${damageType}]`).evaluate({ async: false });
        await game.dice3d?.showForRoll(damageRoll);
        await anime(token, targetToken);
        await new MidiQOL.DamageOnlyWorkflow(actor, targetToken, damageRoll.total, damageType, [targetToken], damageRoll, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemData: item, itemCardId: "new" });
    }
}

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.magic_missile.blue")
        .atLocation(token)
        .stretchTo(target)
        .play()
}
