/*
    A beam of crackling energy streaks toward a creature within range. Make a ranged spell attack against the target. On
    a hit, the target takes 1d10 force damage.

    The spell creates more than one beam when you reach higher levels: two beams at 5th level, three beams at 11th level,
    and four beams at 17th level. You can direct the beams at the same target or at different ones. Make a separate attack
    roll for each beam.
 */
const optionName = "Eldritch Blast";
const version = "12.3.0";
let beamItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', 'Eldritch Blast Beam');

try {
    if (args[0].macroPass === "postActiveEffects") {
        // error checking
        if (!beamItem) {
            return ui.notifications.error("Eldritch Blast Beam item is not found!");
        }

        const characterLevel = actor.type === "character" ? actor.system.details.level : actor.system.details.cr;
        const beamCount = Math.floor((characterLevel + 1) / 6) + 1;
        const feature = new CONFIG.Item.documentClass(beamItem, {'parent': workflow.actor});

        // update the beam stats based on actor features, such as agonizing blast
        const spellcastingAbility = actor.system.attributes.spellcasting;
        const abilityBonus = actor.system.abilities[spellcastingAbility].mod;

        const agonizingBlast = actor.items.getName("Invocation: Agonizing Blast");
        if (agonizingBlast) {
            let damageParts = deepClone(beamItem.system.damage.parts);
            damageParts[0][0] = damageParts[0][0] + '+' + abilityBonus;
            await beamItem.update({"system.damage.parts": damageParts});
        }

        // check for need to select targets
        if (workflow.targets.size === 1) {
            let target = workflow.targets.first();
            await launchMissiles(feature, target, beamCount);
        }
        else {
            // ask how many missiles per target
            let content = `<p>You have <b>${beamCount}</b> total beam\'s. Select how many for each target:</p><div class="flexcol">`;

            for (let target of workflow.targets) {
                content += `<div className="flexrow" style="margin-bottom: 10px;"><label style="width: 75%">${target.name}</label><input type="number" name="target" min="0" max="${beamCount}" step="1" value="1" autofocus style="width: 25%;margin-left: 15px;"/></div>`;
            }
            content += `</div>`;

            let targetData = await foundry.applications.api.DialogV2.prompt({
                window: {title: `${item.name} Targets`},
                content: content,
                ok: {
                    label: "Cast",
                    callback: (event, button, dialog) => {
                        let sentMissiles = 0;
                        let resultData = [];

                        for (let beamTarget of button.form.elements.target) {
                            let targetCount = beamTarget.valueAsNumber;
                            if (targetCount > 0) {
                                let actualCount = Math.min(targetCount, beamCount - sentMissiles);

                                // get the target token
                                let targetName = beamTarget.previousSibling.innerText.trim();
                                let targetToken = workflow.targets.find(t => t.name === targetName);
                                if (targetToken) {
                                    resultData.push({target: targetToken, count: actualCount});
                                }

                                sentMissiles += actualCount;
                                if (sentMissiles === beamCount)
                                    break;
                            }
                        }

                        return resultData;
                    }
                }
            });

            if (targetData) {
                for (let td of targetData) {
                    await launchMissiles(feature, td.target, td.count);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function launchMissiles(feature, targetToken, beamCount){
    for (let i = 0; i < beamCount; i++) {
        let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions([targetToken.document.uuid]);
        await MidiQOL.completeItemUse(feature, config, options);
        await HomebrewMacros.wait(250);
    }
}
