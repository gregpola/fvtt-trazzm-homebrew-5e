/*
    Immediately after you cast Divine Smite, you can expend one use of your Channel Divinity and distribute
    Temporary Hit Points to creatures of your choice within 30 feet of yourself, which can include you. The total number
    of Temporary Hit Points equals 2d8 plus your Paladin level, divided among the chosen creatures however you like.
*/
const optionName = "Inspiring Smite";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        if (workflow.targets.size) {
            const checkRoll = await new Roll('2d8').evaluate();
            const paladinLevel = actor.classes?.paladin?.system?.levels ?? 0;
            const totalHealing = checkRoll.total + paladinLevel;

            // ask how many temp HP per target
            let targetList = workflow.targets.reduce((list, target) => {
                return list + `<tr style="width:80%"><td style="width:75%">${target.name}</td><td style="width:25%"><input type="number" id="target" name="${target.name}" min="0" max="${totalHealing}" step="1" value="1" autofocus></td></tr>`
            }, "");

            let content = `
              <form>
                <div class="flexcol">
                    <div class="flexrow" style="margin-bottom: 10px;"><label>You have ${totalHealing} temporary hit points to spread:</label></div>
                    <table>
                        <tr><th style="text-align: left;">Target</th><th>HP</th>
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
                    label: "Heal",
                    callback: (event, button, dialog) => {
                        let usedHealing = 0;
                        let resultData = [];

                        for (let beamTarget of button.form.elements.target) {
                            let targetCount = Number(beamTarget.value);
                            if (targetCount > 0) {
                                let actualCount = Math.min(targetCount, totalHealing - usedHealing);

                                // get the target token
                                let targetToken = workflow.targets.find(t => t.name === beamTarget.name);
                                if (targetToken) {
                                    resultData.push({target: targetToken, count: actualCount});
                                }

                                usedHealing += actualCount;
                                if (usedHealing === totalHealing)
                                    break;
                            }
                        }

                        return resultData;
                    }
                }
            });

            if (targetData) {
                for (let td of targetData) {
                    await healTarget(td.target, td.count, macroItem);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function healTarget(targetToken, healAmount, sourceItem){
    await anime(token, targetToken);
    await MidiQOL.applyTokenDamage(
        [{ damage: healAmount, type: "temphp" }],
        healAmount,
        new Set([targetToken]),
        sourceItem,
        new Set(),
        {flavor: optionName}
    );
    await new Promise(resolve => setTimeout(resolve, 100));
}

async function anime(controlledToken, targetToken) {
    const targetElevation = targetToken.document?.elevation ?? 0;

    new Sequence()
        .effect()
        .file('jb2a.healing_generic.200px.green')
        .zIndex(100)
        .elevation(targetElevation)
        .atLocation(targetToken)
        .play()
}
