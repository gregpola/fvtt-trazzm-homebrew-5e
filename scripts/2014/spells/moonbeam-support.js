// damage macro
const version = "12.3.0"
const optionName = "Moonbeam Damage";
const lastAppliedTimeFlag = "last-applied-moonbeam-flag";

try {
    const templateFlag = region.flags?.world?.spell?.Moonbeam;

    if (templateFlag) {
        const targetToken = event.data.token;

        if (HomebrewHelpers.isAvailableThisTurn(targetToken.actor, lastAppliedTimeFlag)) {
            const isDead = HomebrewHelpers.findEffect(targetToken.actor, "Dead");
            if (!isDead) {
                HomebrewHelpers.setUsedThisTurn(targetToken.actor, lastAppliedTimeFlag);

                const sourceToken = canvas.tokens.get(templateFlag.sourceTokenId);
                let damageItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', 'Moonbeam Damage');
                if (damageItem) {
                    const damageRoll = templateFlag?.damageRoll ?? '2d10';
                    const damageType = templateFlag?.damageType ?? 'radiant';
                    const saveDC = templateFlag?.saveDC ?? '13';

                    const itemData = foundry.utils.mergeObject(foundry.utils.duplicate(damageItem), {
                        type: "spell",
                        effects: [],
                        flags: {
                            "midi-qol": {
                                noProvokeReaction: true, // no reactions triggered
                                onUseMacroName: null //
                            },
                        },
                        system: {
                            damage: {parts: [[damageRoll, damageType]]},
                            save: {dc: saveDC, ability: "con", scaling: "flat"}
                        }
                    }, {overwrite: true, inlace: true, insertKeys: true, insertValues: true});
                    const item = new CONFIG.Item.documentClass(itemData, {parent: sourceToken.actor});

                    let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions([targetToken.uuid]);
                    await MidiQOL.completeItemUse(item, config, options);
                    await HomebrewMacros.wait(250);
                }
                else {
                    console.error(`${optionName}: ${version}`, 'Missing damage item');
                }
            }
        }
    }
    else {
        console.error(`${optionName}: ${version}`, 'Missing template flag');
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}


// moonbeam move
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "moonbeam-flag";
const flag = actor.getFlag(_flagGroup, flagName);
if (flag) {
    const template = await fromUuid(flag.templateId);
    if (template) {
        let position = await new Portal()
            .color("#ff0000")
            .texture("icons/svg/dice-target.svg")
            .origin({ x: template.x, y: template.y })
            .range(60)
            .pick();
        if (position) {
            await template.update({x: position.x, y: position.y});
        }
    }
}
