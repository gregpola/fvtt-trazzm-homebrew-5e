/*
	Whenever you take the Attack action on your turn, your walking speed increases by 10 feet until the end of the turn,
	and if a weapon attack that you make as part of this action hits a creature, you can use one of the following Blade
	Flourish options of your choice. You can use only one Blade Flourish option per turn.

	Defensive Flourish. You can expend one use of your Bardic Inspiration to cause the weapon to deal extra damage to
	the target you hit. The damage equals the number you roll on the Bardic Inspiration die. You also add the number
	rolled to your AC until the start of your next turn.

	Slashing Flourish. You can expend one use of your Bardic Inspiration to cause the weapon to deal extra damage to the
	target you hit and to any other creature of your choice that you can see within 5 feet of you. The damage equals the
	number you roll on the Bardic Inspiration die.

	Mobile Flourish. You can expend one use of your Bardic Inspiration to cause the weapon to deal extra damage to the
	target you hit. The damage equals the number you roll on the Bardic Inspiration die. You can also push the target up
	to 5 feet away from you, plus a number of feet equal to the number you roll on that die. You can then immediately use
	your reaction to move up to your walking speed to an unoccupied space within 5 feet of the target.
*/
const optionName = "Blade Flourish";
const version = "14.5.0";
const timeFlag = "last-blade-flourish";
const movementEffectName = "Blade Flourish Movement";
const defensiveEffectName = "Defensive Flourish";
const mastersFlourishName = "Master’s Flourish";

try {
    if (args[0].macroPass === "DamageBonus") {
        const targetToken = workflow.hitTargets.first();

        if (["mwak", "rwak"].includes(rolledActivity.actionType) && targetToken) {
            // check for available bardic inspiration
            let currentValue = 0;
            const bardicInspiration = actor.items.getName("Bardic Inspiration");
            if (bardicInspiration) {
                const maxValue = bardicInspiration.system.uses.max;
                const spentValue = bardicInspiration.system.uses.spent;
                currentValue = maxValue - spentValue;
            }

            // check for Master’s Flourish
            const mastersFlourish = actor.items.find(i => i.name === mastersFlourishName);
            let useBardicInspiration = currentValue > 0;

            if (((currentValue > 0) || mastersFlourish) && HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) && game.combat) {
                // add the flourish options
                let optionRows = `<label><input type="radio" name="choice" value="defensive" checked>  Defensive Flourish </label>` +
                    `<label><input type="radio" name="choice" value="mobile">  Mobile Flourish </label>` +
                    `<label><input type="radio" name="choice" value="slashing">  Slashing Flourish </label>`;

                let tableBody = optionRows;

                // add master's flourish or bardic inspiration choice
                if (useBardicInspiration && mastersFlourish) {
                    tableBody += `<hr />`;
                    tableBody += `<label><input type="radio" name="expend" value="bardic" checked>  Use Bardic Inspiration </label>`;
                    tableBody += `<label><input type="radio" name="expend" value="heroic">  Use Master's Flourish (d6) </label>`;
                }

                // ask if they want to use an option
                let content = `
                  <form>
                    <div>
                        <div><strong><label>Add a ${optionName} to this attack?</label></strong></div>
                        <div><sub>Bardic Inspiration remaining: ${currentValue}</sub></div>
                    </div><hr />`;

                content += tableBody;
                content += '<hr /></form>';

                const result = await foundry.applications.api.DialogV2.wait({
                    window: { title: `${optionName}` },
                    form: { closeOnSubmit: true },
                    content: content,
                    buttons: [
                        {
                            action: "Use",
                            default: true,
                            label: "Use Blade Flourish",
                            callback: (event, button, dialog) => {
                                const expendValue = button.form.elements.expend?.value ?? undefined;
                                if (expendValue === "heroic") {
                                    useBardicInspiration = false;
                                }
                                return button.form.elements.choice.value;
                            }
                        },
                        {
                            action: "Pass",
                            default: false,
                            label: "Pass",
                            callback: () => "Pass"
                        },
                    ],
                    rejectClose: false,
                    modal: true
                });

                if (result === null || result === "Pass") {
                    return;
                }

                // expend resources and roll effect die
                let rollFormula = "1d6";
                if (useBardicInspiration) {
                    rollFormula = actor.system.scale.bard.inspiration.formula;
                }

                let theRoll = await new Roll(rollFormula).evaluate();
                await MidiQOL.displayDSNForRoll(theRoll);

                switch (result) {
                    case "defensive":
                        {
                            const defensiveEffect = macroItem.effects.getName(defensiveEffectName);
                            if (defensiveEffect) {
                                const armorChange = defensiveEffect.changes.find(change => change.key === 'system.attributes.ac.bonus');
                                if (armorChange) {
                                    await defensiveEffect.update({
                                        changes: [{
                                            key: 'system.attributes.ac.bonus',
                                            value: `${theRoll.total}`,
                                            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                            priority: 20
                                        }]});
                                    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: actor.uuid, effects: [defensiveEffect]});
                                }
                            }
                        }
                        break;

                    case "mobile":
                        {
                            let pushedDistance = 5;
                            for (let i = 5; i < theRoll.total; i+=5) {
                                pushedDistance += 5;
                            }
                            await HomebrewMacros.pushTarget(token, targetToken, (pushedDistance / 5));
                        }
                        break;

                    case "slashing":
                        {
                            const withinRange = MidiQOL.findNearby([CONST.TOKEN_DISPOSITIONS.HOSTILE, CONST.TOKEN_DISPOSITIONS.NEUTRAL], token, 5, { canSee: true, includeIncapacitated: false });
                            const potentialTargets = withinRange.filter(value => value !== targetToken);
                            if (potentialTargets.length > 0) {
                                const secondaryTarget = await HomebrewHelpers.pickTarget(potentialTargets, `${optionName} - select nearby target:`)
                                if (secondaryTarget) {
                                    await MidiQOL.applyTokenDamage(
                                        [{ damage: theRoll.total, type: workflow.defaultDamageType }],
                                        theRoll.total,
                                        new Set([secondaryTarget]),
                                        macroItem,
                                        new Set(),
                                        {flavor: optionName}
                                    );

                                }
                            }
                        }
                        break;
                }

                // expend resources
                if (useBardicInspiration) {
                    const newValue = bardicInspiration.system.uses.spent + 1;
                    await bardicInspiration.update({"system.uses.spent": newValue});
                }

                await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
                return new CONFIG.Dice.DamageRoll(`${theRoll.total}[${optionName}]`, {}, {type:workflow.defaultDamageType, properties: [...rolledItem.system.properties]});
            }
        }
    }
    else if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
        if (rolledActivity.type === 'attack') {
            // apply movement buff
            const oldEffect = HomebrewEffects.findEffect(actor, movementEffectName);
            if (!oldEffect) {
                const effect = macroItem.effects.getName(movementEffectName);
                if ( effect) {
                    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: actor.uuid, effects: [effect]});
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

