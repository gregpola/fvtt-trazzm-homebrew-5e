const version = "12.3.2";
const optionName = "Dwarven Thrower";

try {
    let targetToken = workflow.hitTargets.first();
    if (args[0].macroPass === "DamageBonus" && targetToken && item.name === optionName) {
        // check for giant and thrown
        if ((MidiQOL.getDistance(workflow.token, targetToken) > 5) && (HomebrewHelpers.raceOrType(targetToken.actor) === 'giant')) {
            const diceMult = workflow.isCritical ? 2: 1;
            return {damageRoll: `${diceMult}d8`, flavor: optionName};
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
