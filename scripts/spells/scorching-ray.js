/*
    You hurl three fiery rays. You can hurl them at one target within range or at several. Make a ranged spell attack for
    each ray. On a hit, the target takes 2d6 Fire damage.

    Using a Higher-Level Spell Slot. You create one additional ray for each spell slot level above 2.
*/
const optionName = "Scorching Ray";
const version = "14.5.0";
const damageType = "fire";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const spellLevel = workflow.castData.castLevel;
        const missileCount = 1 + spellLevel;

        // check for need to select targets
        if (workflow.targets.size === 1) {
            let target = workflow.targets.first();
            //await launchMissiles(target, missileCount, macroItem);
            await launchMissilesActivity(target, missileCount, macroItem);
        }
        else {
            // ask how many missiles per target
            let targetList = workflow.targets.reduce((list, target) => {
                return list + `<tr style="width:80%"><td style="width:75%">${target.name}</td><td style="width:25%"><input type="number" id="target" name="${target.name}" min="0" max="${missileCount}" step="1" value="1" autofocus></td></tr>`
            }, "");

            let content = `
              <form>
                <div class="flexcol">
                    <div class="flexrow" style="margin-bottom: 10px;"><label>You have ${missileCount} rays to fire, specify how many per target:</label></div>
                    <table>
                        <tr><th style="text-align: left;">Target</th><th>Rays</th>
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
                    //await launchMissiles(td.target, td.count, macroItem);
                    await launchMissilesActivity(td.target, td.count, macroItem);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function launchMissilesActivity(targetToken, missileCount, sourceItem) {
    const activity = sourceItem.system.activities.find(a => a.identifier === 'single-ray');
    if (activity) {
        let targetUuids = [targetToken.document.uuid];

        const options = {
            midiOptions: {
                targetUuids: targetUuids,
                noOnUseMacro: true,
                configureDialog: false,
                showFullCard: false,
                ignoreUserTargets: true,
                checkGMStatus: true,
                autoRollAttack: true,
                autoRollDamage: "always",
                fastForwardAttack: true,
                fastForwardDamage: true,
                workflowData: true
            }
        };

        for (let i = 0; i < missileCount; i++) {
            let result = await MidiQOL.completeActivityUse(activity.uuid, options, {}, {});
            await scorchingRayAnimation(token, targetToken, result?.hitTargets?.size);
        }
    }
    else {
        ui.notifications.error(`${optionName}: ${version} - missing Single Missile activity`);
    }
}


async function scorchingRayAnimation(sourceToken, targetToken, isHit) {
    const targetElevation = targetToken.document.elevation;

    let impactPoint = targetToken.center;
    if (!isHit) {
        impactPoint = await HomebrewHelpers.getTokenCorner(sourceToken, targetToken);
    }

    await new Sequence()
        // FROM SOURCE TO TARGET
        .sound()
        .file('blfx.sound.spell.cast.fireball.2')
        .delay(400)

        .effect()
        .file('blfx.spell.range.ray.scorching_ray.impact1.intro.yellow')
        .zIndex(100)
        .elevation(targetElevation)
        .atLocation(sourceToken)
        .stretchTo(impactPoint)
        .waitUntilFinished(-700)

        .play();
}
