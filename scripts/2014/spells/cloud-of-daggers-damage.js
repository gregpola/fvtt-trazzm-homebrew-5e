// damage macro
const version = "12.3.0"
const optionName = "Cloud of Daggers Damage";
const lastAppliedTimeFlag = "last-applied-cloud-of-daggers-flag";

try {
    const templateFlag = region.flags?.world?.spell?.CloudOfDaggers;
    if (templateFlag) {
        const targetToken = event.data.token;

        if (HomebrewHelpers.isAvailableThisTurn(targetToken.actor, lastAppliedTimeFlag)) {
            const isDead = HomebrewHelpers.findEffect(targetToken.actor, "Dead");
            if (!isDead) {
                HomebrewHelpers.setUsedThisTurn(targetToken.actor, lastAppliedTimeFlag);

                const sourceToken = canvas.tokens.get(templateFlag.sourceTokenId);
                let damageDice = 4;
                if (templateFlag?.castLevel) {
                    damageDice += (2 * (templateFlag.castLevel - 2));
                }

                const damageRoll = await new CONFIG.Dice.DamageRoll(`${damageDice}d4`, {}, {type: 'slashing'}).evaluate();
                await new MidiQOL.DamageOnlyWorkflow(sourceToken.actor, sourceToken, null, null, [targetToken], damageRoll, {
                    flavor: 'Slashed by daggers',
                    itemCardId: "new"
                });
                await new Sequence().effect().file("jb2a.cloud_of_daggers.daggers.red").atLocation(sourceToken).scaleToObject(1.5).play();
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
