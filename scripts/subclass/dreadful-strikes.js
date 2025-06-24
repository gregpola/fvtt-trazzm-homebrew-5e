/*
    You can augment your weapon strikes with mind-scarring magic drawn from the murky hollows of the Feywild. When you
    hit a creature with a weapon, you can deal an extra 1d4 Psychic damage to the target, which can take this extra
    damage only once per turn. The extra damage increases to 1d6 when you reach Ranger level 11.
*/
const optionName = "Dreadful Strikes";
const version = "12.4.0";
const _flagPrefix = "dreadful-strikes-";

try {
    if (args[0].macroPass === "DamageBonus" && item.type === 'weapon') {
        const targetToken = workflow.hitTargets.first();
        if (targetToken) {
            // once per turn per target
            const timeFlag = _flagPrefix + token.id;

            if (game.combat && HomebrewHelpers.isAvailableThisTurn(targetToken.actor, timeFlag)) {
                await HomebrewHelpers.setUsedThisTurn(targetToken.actor, timeFlag);
                const damageDice = actor.system.scale.fey["dreadful-strike"];
                return new CONFIG.Dice.DamageRoll(`+${damageDice}[Dreadful_Strikes]`, {}, {type: 'psychic', properties: [...rolledItem.system.properties]});
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
