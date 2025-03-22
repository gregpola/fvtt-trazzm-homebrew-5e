/*
	A 5-foot-diameter Sphere of fire appears in an unoccupied space of your choice within range and lasts for the Duration.
	Any creature that ends its turn within 5 feet of the sphere must make a Dexterity saving throw. The creature takes
	2d6 fire damage on a failed save, or half as much damage on a successful one.

	As a Bonus Action, you can move the Sphere up to 30 feet. If you ram the sphere into a creature, that creature must
	make the saving throw against the sphere’s damage, and the sphere stops moving this turn.

	When you move the Sphere, you can direct it over barriers up to 5 feet tall and jump it across pits up to 10 feet
	wide. The sphere ignites flammable Objects not being worn or carried, and it sheds bright light in a 20-foot radius
	and dim light for an additional 20 feet.

	At Higher Levels.When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d6 for
	each slot level above 2nd.
 */
const version = "12.3.0";
const optionName = "Flaming Sphere";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const summonEffect = HomebrewHelpers.findEffect(actor, "Summon: Flaming Sphere");
        if (summonEffect) {
            let summonFlag = summonEffect.getFlag("dnd5e", "dependents");
            let summonedToken = await fromUuid(summonFlag[0].uuid);

            if (summonedToken) {
                // update the summoned features
                const saveDC = actor.system.attributes.spelldc ?? 12;
                const damageDice = workflow.castData?.castLevel ?? 2;

                // update Flaming Aura
                let flamingAura = summonedToken.actor.items.find(i => i.name === "Flaming Aura");
                if (flamingAura) {
                    let damageParts = foundry.utils.duplicate(flamingAura.system.damage.parts);
                    damageParts[0][0] = `${damageDice}d6`;
                    await flamingAura.update({
                        "system.damage.parts" : damageParts,
                        "system.save.dc" : saveDC
                    });
                }

                // update Ram Attack
                let ramAttack = summonedToken.actor.items.find(i => i.name === "Ram Attack");
                if (ramAttack) {
                    let damageParts = foundry.utils.duplicate(ramAttack.system.damage.parts);
                    damageParts[0][0] = `${damageDice}d6`;
                    await ramAttack.update({
                        "system.damage.parts" : damageParts,
                        "system.save.dc" : saveDC
                    });
                }

                await summonedToken.toggleCombatant();
                const objectInitiative = token.combatant.initiative ? token.combatant.initiative - 0.01
                    : 1 + (summonedToken.actor.system.abilities.dex.value / 100);
                await summonedToken.combatant.update({initiative: objectInitiative});
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
