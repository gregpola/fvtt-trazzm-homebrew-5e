/*
	Puncture. Once per turn, when you hit a creature with an attack that deals Piercing damage, you can reroll one of
	the attack’s damage dice, and you must use the new roll.

	Enhanced Critical. When you score a Critical Hit that deals Piercing damage to a creature, you can roll one
	additional damage die when determining the extra Piercing damage the target takes.
 */
const version = "13.5.0";
const optionName = "Piercer";
const damageType = "piercing";
const timeFlag = "piercer-time";

try {
    if (args[0].macroPass === "DamageBonus") {
        // make sure it's an allowed attack
        if (workflow.damageDetail.filter(i=>i.type === damageType).length < 1) {
            console.debug(`${optionName}: ${version} - not ${damageType} damage`);
            return;
        }

        // collect all the piercing damage dice
        var maxRoll = 0;
        var minRoll = {faces: 0, total: 0};

        // rolls is an array and rolls[0].terms is an array
        const rolls = workflow.damageRolls?.filter((r) => r.options.type === damageType) ?? [];
        for (let roll of rolls) {
            for (let term of roll.terms) {
                if (!isNaN(term.faces)) {
                    if ((term.faces - term.total) > (minRoll.faces - minRoll.total)) {
                        minRoll.faces = term.faces;
                        minRoll.total = term.total;
                    }

                    if (term.faces > maxRoll) {
                        maxRoll = term.faces;
                    }
                }
            }
        }

        // ask if the actor wants to re-roll a damage die
        // Check for availability i.e. once per actors turn
        let rerollDamageTerm = 0;
        if ((minRoll.faces > 0) && HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) && game.combat) {
            const usePiercerReroll = await foundry.applications.api.DialogV2.confirm({
                window: {
                    title: `${optionName}`,
                },
                content: `<p>Use Piercer Reroll on ${minRoll.total} on a d${minRoll.faces}?</p>`,
                rejectClose: false,
                modal: true
            });

            if (usePiercerReroll) {
                let newRoll = await new Roll(`1d${minRoll.faces}`).evaluate();
                await game.dice3d?.showForRoll(newRoll);
                rerollDamageTerm = (newRoll.total - minRoll.total);
                await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
            }
        }

        // if a critical add extra damage die
        if (workflow.isCritical) {
            if (rerollDamageTerm > 0) {
                return {damageRoll: `1d${maxRoll}+${rerollDamageTerm}[piercing]`, flavor: `${optionName} Damage`};
            }
            else {
                return {damageRoll: `1d${maxRoll}[piercing]`, flavor: `${optionName} Damage`};
            }
        }
        else if (rerollDamageTerm > 0) {
            return {damageRoll: `${rerollDamageTerm}[piercing]`, flavor: `${optionName} Damage`};
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
