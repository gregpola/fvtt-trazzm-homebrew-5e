/*
    You emit a baleful aura which disorients creatures who approach you. Any creatures that start their turn within
    10 feet of you are poisoned until the start of their next turn.
 */
const optionName = "Venomous Aura";
const version = "13.5.0";


try {
    if (args[0] === "each" && lastArgValue.turn === 'startTurn') {
        // apply poisoned
        await HomebrewEffects.applyPoisonedEffect2024(actor, macroItem, ['turnStart', 'endCombat']);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
