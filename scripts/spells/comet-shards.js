/*
    You shatter the delerium fragment in your hand into three glowing comet-like motes of magical force which you hurl
    at your foes. Each comet hits a creature of your choice that you can see within range. A comet deals 2d4 + your
    spellcasting ability modifier force damage to its target and pushes it 10 feet away from you. The comets all strike
    simultaneously, and you can direct them to hit one creature or several.

    At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, the spell creates one more
    comet for each slot level above 1st.
*/
const optionName = "Comet Shards";
const version = "13.5.0";
const damageType = "force";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const spellLevel = workflow.castData.castLevel;
        const missileCount = 2 + spellLevel;

        // check for need to select targets
        if (workflow.targets.size === 1) {
            let target = workflow.targets.first();
            await launchMissiles(target, missileCount, macroItem, actor.system.attributes.spell.mod);
        }
        else {
            // ask how many missiles per target
            let targetList = workflow.targets.reduce((list, target) => {
                return list + `<tr style="width:80%"><td style="width:75%">${target.name}</td><td style="width:25%"><input type="number" id="target" name="${target.name}" min="0" max="${missileCount}" step="1" value="1" autofocus></td></tr>`
            }, "");

            let content = `
              <form>
                <div class="flexcol">
                    <div class="flexrow" style="margin-bottom: 10px;"><label>You have ${missileCount} shards to fire, specify how many per target:</label></div>
                    <table>
                        <tr><th style="text-align: left;">Target</th><th>Shards</th>
                        ${targetList}
                    </table>
                </div>
              </form>`;

            let targetData = await foundry.applications.api.DialogV2.prompt({
                window: {title: `${item.name} Targets`},
                content: content,
                position: {
                    width: 400
                },
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
                    await launchMissiles(td.target, td.count, macroItem, actor.system.attributes.spell.mod);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function launchMissiles(targetToken, missileCount, sourceItem, modifier){
    for (let i = 0; i < missileCount; i++) {
        await anime(token, targetToken);
        let damageRoll = await new CONFIG.Dice.DamageRoll(`2d4 + ${modifier}`, {}, {type: damageType}).evaluate();
        await MidiQOL.displayDSNForRoll([damageRoll], "damageRoll");
        await MidiQOL.applyTokenDamage(
            [{ damage: damageRoll.total, type: damageType }],
            damageRoll.total,
            new Set([targetToken]),
            sourceItem,
            new Set(),
            {flavor: optionName}
        );
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

async function anime(controlledToken, targetToken) {
    const targetElevation = targetToken.document?.elevation ?? 0;

    new Sequence()
        .effect()
        .file('blfx.spell.range.snipe.burst1.dust.impact1.intro.white')
        .zIndex(100)
        .elevation(targetElevation)
        .atLocation(controlledToken)
        .stretchTo(targetToken)
        .play()
}
