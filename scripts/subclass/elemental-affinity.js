/*
    Your draconic magic has an affinity with a damage type associated with dragons. Choose one of those types: Acid,
    Cold, Fire, Lightning, or Poison.

    You have Resistance to that damage type, and when you cast a spell that deals damage of that type, you can add your
    Charisma modifier to one damage roll of that spell.
*/
const optionName = "Elemental Affinity";
const version = "12.4.0";

try {
    if (args[0].macroPass === "DamageBonus" && item.type === 'spell') {
        const damageBonus = actor.system.abilities.cha.mod;

        // get the damage type
        let damageType = 'fire';
        const subclass = actor.items.find(i => i.name === "Draconic Sorcery" && i.type === "subclass");
        if (subclass) {
            // get the advancement item
            const traits = subclass.advancement?.byType?.Trait;

            if (traits) {
                const resistanceFeature = traits.find(i => i.title === "Elemental Affinity Resistance");

                if (resistanceFeature) {
                    const value = resistanceFeature.value?.chosen?.first() ?? undefined;

                    if (value) {
                        damageType = value.substring(3);

                        if (workflow.damageDetail.some(p=>p.type === damageType)) {
                            return new CONFIG.Dice.DamageRoll(`+${damageBonus}[ElementalAffinity]`, {}, {type:damageType, properties: [...rolledItem.system.properties]});
                        }
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
