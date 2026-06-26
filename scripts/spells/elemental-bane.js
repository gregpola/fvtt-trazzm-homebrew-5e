/*
	Choose one creature you can see within range, and choose one of the following damage types: acid, cold, fire,
	lightning, or thunder. The target must succeed on a Constitution saving throw or be affected by the spell for its
	duration. The first time each turn the affected target takes damage of the chosen type, the target takes an extra
	2d6 damage of that type. Moreover, the target loses any resistance to that damage type until the spell ends.

	At Higher Levels. When you cast this spell using a spell slot of 5th level or higher, you can target one additional
	creature for each slot level above 4th. The creatures must be within 30 feet of each other when you target them.
*/
const optionName = "Elemental Bane";
const version = "14.5.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isDamaged") {
        // skip if it's from this item
        if (macroActivity.item.name === optionName) return;

        // collect the damage type
        let damageTypesReceived = [];
        for (let dd of workflow.damageDetail) {
            if (dd.type && !damageTypesReceived.includes(dd.type)) {
                damageTypesReceived.push(dd.type);
            }
        }

        let applyDamageBonus = false;
        var damageType;
        if (damageTypesReceived.length > 0) {
            // get the damage type sensitivity
            const baneEffect = await HomebrewEffects.findEffectBySourceActor(actor, "Elemental Bane -", macroItem.actor, true);
            if (baneEffect) {
                const theChange = baneEffect.changes.find(change => change.key === 'system.traits.dr.value');
                if (theChange) {
                    damageType = theChange.value;
                    applyDamageBonus = damageTypesReceived.includes(damageType);
                }
            }
        }

        if (applyDamageBonus) {
            const sourceToken = MidiQOL.tokenForActor(macroItem.actor);
            const damageRoll = await new CONFIG.Dice.DamageRoll(`2d6[${optionName}]`, {}, {type: damageType, properties: ["mgc"]}).evaluate();
            await new MidiQOL.DamageOnlyWorkflow(macroItem.actor, sourceToken, null, null, [token], damageRoll, {
                flavor: optionName,
                itemCardId: "new",
                itemData: macroItem.toObject()
            });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
