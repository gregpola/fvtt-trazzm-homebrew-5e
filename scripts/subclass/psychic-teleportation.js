/*
    As a Bonus Action, you manifest a Psychic Blade, expend one Psionic Energy Die and roll it, and throw the blade at
    an unoccupied space you can see up to a number of feet away equal to 10 times the number rolled. You then teleport
    to that space, and the blade vanishes.
 */
const optionName = "Psychic Teleportation";
const version = "12.4.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const psionicPowerItem = actor.items.find(i => i.name === 'Psionic Power');
        if (psionicPowerItem && psionicPowerItem.system.uses.spent < psionicPowerItem.system.uses.max ) {
            const soulKnifeDie = actor.system.scale.soulknife?.die.die ?? undefined;
            if (soulKnifeDie) {
                let dieRoll = await new Roll(`${soulKnifeDie}`).evaluate();
                const maxRange = 10 * dieRoll.total;
                await HomebrewMacros.teleportToken(token, maxRange);
                const newValue = psionicPowerItem.system.uses.spent + 1;
                await psionicPowerItem.update({"system.uses.spent": newValue});
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
