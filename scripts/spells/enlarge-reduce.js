/*
    Enlarge. The target’s size doubles in all dimensions, and its weight is multiplied by eight. This growth increases
    its size by one category—from Medium to Large, for example. If there isn’t enough room for the target to double its
    size, the creature or object attains the maximum possible size in the space available. Until the spell ends, the
    target also has advantage on Strength Checks and Strength Saving Throws. The target’s Weapons also grow to match its
    new size. While these Weapons are enlarged, the target’s attacks with them deal 1d4 extra damage.

    Reduce. The target’s size is halved in all dimensions, and its weight is reduced to one-eighth of normal. This reduction
    decreases its size by one category—from Medium to Small, for example. Until the spell ends, the target also has
    disadvantage on Strength Checks and Strength Saving Throws. The target’s Weapons also shrink to match its new size.
    While these Weapons are reduced, the target’s attacks with them deal 1d4 less damage (this can’t reduce the damage below 1).
*/
const version = "12.3.0";
const optionName = "Enlarge/Reduce";
const effectName = `${optionName} - changed`;

try {
    if (args[0].macroPass === "postActiveEffects") {
        if (workflow.failedSaves.size > 0) {
            let content = `
				<label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="enlarge" checked />Enlarge</label>
				<label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="reduce" />Reduce</label>`;

            let flavor = await foundry.applications.api.DialogV2.prompt({
                content: content,
                rejectClose: false,
                ok: {
                    callback: (event, button, dialog) => {
                        return button.form.elements.choice.value;
                    }
                },
                window: {
                    title: `${optionName} - Select the Effect`,
                },
                position: {
                    width: 400
                }
            });

            if (flavor) {
                const internalSizes = Object.keys(CONFIG.DND5E.actorSizes);

                let extraChanges = [];
                if (flavor === 'reduce') {
                    extraChanges.push({
                            key: 'system.bonuses.mwak.damage',
                            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                            value: '-1d4',
                            priority: 1
                        }
                    );
                    extraChanges.push({
                            key: 'system.bonuses.rwak.damage',
                            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                            value: '-1d4',
                            priority: 1
                        }
                    );
                    extraChanges.push({
                            key: 'flags.midi-qol.disadvantage.ability.check.str',
                            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value: 1,
                            priority: 1
                        }
                    );
                    extraChanges.push({
                            key: 'flags.midi-qol.disadvantage.ability.save.str',
                            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value: 1,
                            priority: 1
                        }
                    );
                }
                else {
                    extraChanges.push({
                            key: 'system.bonuses.mwak.damage',
                            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                            value: '+1d4',
                            priority: 1
                        }
                    );
                    extraChanges.push({
                            key: 'system.bonuses.rwak.damage',
                            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                            value: '+1d4',
                            priority: 1
                        }
                    );
                    extraChanges.push({
                            key: 'flags.midi-qol.advantage.ability.check.str',
                            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value: 1,
                            priority: 1
                        }
                    );
                    extraChanges.push({
                            key: 'flags.midi-qol.advantage.ability.save.str',
                            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value: 1,
                            priority: 1
                        }
                    );
                }

                for (let targetToken of workflow.failedSaves) {
                    let tokenSize = targetToken.actor.system.traits.size;
                    let tokenSizeNum = internalSizes.indexOf(tokenSize);

                    if (tokenSizeNum > 0 && tokenSizeNum < (internalSizes.length - 1)) {
                        let newSize = flavor === 'reduce' ? internalSizes[tokenSizeNum - 1] : internalSizes[tokenSizeNum + 1];
                        await HomebrewEffects.resizeActor(targetToken.actor, newSize, effectName, workflow.item.uuid, extraChanges);
                    } else {
                        ui.notifications.error(`${optionName}: ${resourceName}: - token cannot be altered`);
                    }
                }
            }
        }
    }
    else if (args[0] === "off") {
        await HomebrewEffects.removeEffectByName(actor, effectName);
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
