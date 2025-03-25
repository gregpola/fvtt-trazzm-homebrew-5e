/*
    If the boar takes 15 damage or less that would reduce it to 0 hit points, it is reduced to 1 hit point instead.
*/
const version = "12.3.0";
const optionName = "Relentless";

try {
    if (macroItem.system.uses.value > 0) {
        // check the amount of damage
        let amountOfDamage = workflow.damageTotal;

        if (amountOfDamage <= 15) {
            // check hp
            const hp = actor.system.attributes.hp.value;
            const tempHp = actor.system.attributes.hp.temp;
            const totalHp = hp + tempHp;

            // check if knocked out
            if ((totalHp - amountOfDamage) <= 0) {
                let ditem = workflow.damageItem;
                let damageAmount = ditem.oldHP - 1;

                ditem.totalDamage = damageAmount;
                ditem.newHP = ditem.oldHP;
                ditem.newTempHP = ditem.oldTempHP;
                ditem.hpDamage = damageAmount;
                ditem.tempDamage = damageAmount;
                ditem.damageDetail.forEach(i => i.value = 0);
                ditem.damageDetail[0].value = damageAmount;
                ditem.rawDamageDetail.forEach(i => i.value = 0);
                ditem.rawDamageDetail[0].value = damageAmount;

                await macroItem.update({"system.uses.value": macroItem.system.uses.value - 1});
                ChatMessage.create({
                    speaker: {alias: actor.name},
                    content: actor.name + " is relentless"
                });
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
