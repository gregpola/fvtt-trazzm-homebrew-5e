const optionName = "Sweeping Attack";
const version = "13.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "sweeping-attack";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preCheckHits") {
        console.log(workflow);
        let flag = macroItem.getFlag(_flagGroup, _flagName);
        if (flag) {
            workflow.defaultDamageType = flag.damageType;

            const newAttackRoll = await new CONFIG.Dice.D20Roll
            (
                String(flag.attackTotal),
                item.getRollData(),
                {}
            ).evaluate();

            workflow.setAttackRoll(newAttackRoll);
            await macroItem.unsetFlag(_flagGroup, _flagName);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
