/*
    You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within
    range. A dart deals 1d4 + 1 force damage to its target. The darts all strike simultaneously, and you can direct them
    to hit one creature or several.

    At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, the spell creates one more dart
    for each slot level above 1st.
 */
const optionName = "Magic Missile";
const version = "12.3.0";
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
            // ask how many missiles per target
            let targetList = workflow.targets.reduce((list, target) => {
                return list + `<tr><td style="width: 75%">${target.name}</td><td style="width: 25%"><input type="number" id="target" name="${target.name}" min="0" max="${missileCount}" step="1" value="1" autofocus></td></tr>`
            }, "");
            let content = `<p>You have <b>${missileCount}</b> total ${item.name}'s.</p><form class="flexcol"><table><tbody><tr><th>Target</th><th>Missiles</th></tr>${targetList}</tbody></table></form>`;

            let targetData = await foundry.applications.api.DialogV2.prompt({
                window: {title: `${item.name} Targets`},
                content: content,
                ok: {
                    label: "Cast",
                    callback: (event, button, dialog) => {
                        let sentMissiles = 0;
                        let resultData = [];

                        for (let beamTarget of button.form.elements.target) {
                            let targetCount = Number(beamTarget.value);
                            if (targetCount > 0) {
                                let actualCount = Math.min(targetCount, missileCount - sentMissiles);

                                // get the target token
                                let targetToken = workflow.targets.find(t => t.name === beamTarget.name);
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
                    await launchMissiles(td.target, td.count);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function launchMissiles(targetToken, missileCount){
    for (let i = 0; i < missileCount; i++) {
        let damageRoll = await new Roll(`1d4+1[${damageType}]`).evaluate();
        await game.dice3d?.showForRoll(damageRoll);
        await anime(token, targetToken);
        await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, damageType, [targetToken], damageRoll, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemData: item, itemCardId: args[0].itemCardId });
    }
}

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.magic_missile.purple")
        .atLocation(token)
        .stretchTo(target)
        .play()
}
