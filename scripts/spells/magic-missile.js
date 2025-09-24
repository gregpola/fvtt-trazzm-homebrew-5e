/*
    You create three glowing darts of magical force. Each dart strikes a creature of your choice that you can see within
    range. A dart deals 1d4 + 1 Force damage to its target. The darts all strike simultaneously, and you can direct them
    to hit one creature or several.

    Using a Higher-Level Spell Slot. The spell creates one more dart for each spell slot level above 1.
*/
const optionName = "Magic Missile";
const version = "12.5.0";
const damageType = "force";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const spellLevel = workflow.castData.castLevel;
        const missileCount = 2 + spellLevel;

        // check for need to select targets
        if (workflow.targets.size === 1) {
            let target = workflow.targets.first();
            await launchMissiles(target, missileCount, macroItem);
            //await launchMissilesActivity(target, missileCount, macroItem);
        }
        else {
            // ask how many missiles per target
            let targetList = workflow.targets.reduce((list, target) => {
                return list + `<tr style="width:80%"><td style="width:75%">${target.name}</td><td style="width:25%"><input type="number" id="target" name="${target.name}" min="0" max="${missileCount}" step="1" value="1" autofocus></td></tr>`
            }, "");

            let content = `
              <form>
                <div class="flexcol">
                    <div class="flexrow" style="margin-bottom: 10px;"><label>You have ${missileCount} missiles to fire, specify how many per target:</label></div>
                    <table>
                        <tr><th style="text-align: left;">Target</th><th>Missiles</th>
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
                    await launchMissiles(td.target, td.count, macroItem);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function launchMissiles(targetToken, missileCount, sourceItem){
    for (let i = 0; i < missileCount; i++) {
        await anime(token, targetToken);
        let damageRoll = await new CONFIG.Dice.DamageRoll('1d4+1', {}, {type: damageType}).evaluate();
        //await new MidiQOL.DamageOnlyWorkflow(actor, token, null, null, [targetToken], damageRoll, {flavor: optionName, itemCardId: args[0].itemCardId, itemData: sourceItem?.toObject()});
        //let damageRoll = await new Roll('1d4+1').evaluate();
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

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.magic_missile.purple")
        .atLocation(token)
        .stretchTo(target)
        .play()
}

async function launchMissilesActivity(targetToken, missileCount, sourceItem) {
    const activity = sourceItem.system.activities.find(a => a.identifier === 'single-missile');
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
            await anime(token, targetToken);
            await MidiQOL.completeActivityUse(activity.uuid, options, {}, {});
        }
    }
    else {
        ui.notifications.error(`${optionName}: ${version} - missing Single Missile activity`);
    }
}
