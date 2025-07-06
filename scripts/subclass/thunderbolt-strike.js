/*
    When you deal lightning or thunder damage to a Large or smaller creature, you can also push it up to 10 feet away from you.
*/
const optionName = "Thunderbolt Strike";
const version = "12.4.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let eligibleTargets = [];

        for (let targetToken of workflow.targets) {
            if (["tiny", "sm", "med", "lg"].includes(targetToken.actor.system.traits.size)) {
                eligibleTargets.push(targetToken);
            }
        }

        if (eligibleTargets.length > 0) {
            // build the dialog, asking how far to push each target
            let targetList = eligibleTargets.reduce((list, target) => {
                return list + `<tr style="width:80%"><td style="width:75%">${target.name}</td><td style="width:25%"><input type="number" id="target" name="${target.name}" min="0" max="10" step="5" value="10" autofocus></td></tr>`
            }, "");

            let content = `
              <form>
                <div class="flexcol">
                    <div class="flexrow" style="margin-bottom: 10px;"><label>Select how far to push each target (5 or 10 feet):</label></div>
                    <table>
                        <tr><th style="text-align: left;">Target</th><th>Distance</th>
                        ${targetList}
                    </table>
                </div>
              </form>`;


            let targetData = await foundry.applications.api.DialogV2.prompt({
                window: {title: `${item.name} - Targets`},
                content: content,
                position: {
                    width: 400
                },
                ok: {
                    label: "Push",
                    callback: (event, button, dialog) => {
                        let resultData = [];

                        for (let pushTarget of button.form.elements.target) {
                            let pushDistance = Number(pushTarget.value);
                            if (pushDistance > 0) {
                                // get the target token
                                let targetToken = workflow.targets.find(t => t.name === pushTarget.name);
                                if (targetToken) {
                                    resultData.push({target: targetToken, distance: pushDistance});
                                }
                            }
                        }

                        return resultData;
                    }
                }
            });

            if (targetData) {
                for (let td of targetData) {
                    await HomebrewMacros.pushTarget(token, td.target, td.distance === '10' ? 2 : 1);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
