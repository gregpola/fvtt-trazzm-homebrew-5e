/*
    The roper pulls each creature grappled by it up to 25 feet straight toward it.
*/
const version = "12.3.0";
const optionName = "Reel";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // ask which grappled opponents to pull and how far
        let grappledTokens = [];
        const tendrils = actor.items.filter(i => i.name.startsWith('Tendril '));

        for (let tendril of tendrils) {
            let tendrilToken = canvas.tokens.placeables.find(t => t.actor.getRollData().effects.find(e => e.name.startsWith('Grappled (') && e.origin === tendril.uuid));
            if (tendrilToken) {
                grappledTokens.push(tendrilToken);
            }
        }

        if (grappledTokens.length > 0) {
            // build the dialog
            let content = `<p>${actor.name} has <b>${grappledTokens.length}</b> targets grappled. Select which ones to reel and how far:</p><table><tbody>`;
            for (let target of grappledTokens) {
                content += `<tr style="margin-bottom: 10px;"><td style="width: 75%"><input type="checkbox" name="choice" value="${target.id}" /> ${target.name}</td><td style="width: 25%;margin-left: 15px;"><input type="number" name="reelDistance" min="0" max="25" step="1" value="25" autofocus/></td></tr>`;
            }
            content += `</tbody></table>`;

            let reelData = await foundry.applications.api.DialogV2.prompt({
                content: content,
                rejectClose: false,
                ok: {
                    callback: (event, button, dialog) => {
                        let resultData = [];
                        let index = 0;
                        for (let picks of button.form.elements.choice) {
                            if (picks.checked) {
                                resultData.push({
                                    'targetId': picks.value,
                                    'distance': button.form.elements.reelDistance[index].valueAsNumber
                                });
                            }
                            index++;
                        }

                        return resultData;
                    }
                },
                window: {
                    title: `${optionName}`
                },
                position: {
                    width: 500
                }
            });

            if (reelData) {
                for (let reeled of reelData) {
                    let pulledToken = grappledTokens.find(t => t.id === reeled.targetId);
                    if (pulledToken) {
                        let pullSquares = Math.floor(reeled.distance / 5);
                        await HomebrewMacros.pullTarget(token, pulledToken, pullSquares);
                    }
                }
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
