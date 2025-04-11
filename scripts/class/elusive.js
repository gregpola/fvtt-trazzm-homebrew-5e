/*
    You’re so evasive that attackers rarely gain the upper hand against you. No attack roll can have Advantage against
    you unless you have the Incapacitated condition.
*/
const version = "12.4.0";
const optionName = "Elusive";

try {
    if (workflow.macroPass === 'isPreAttacked' && !MidiQOL.hasCondition(options.token, 'incapacitated')) {
        Hooks.once(`midi-qol.preAttackRoll.${workflow.item.uuid}`, (w) => {
            if (w.options.advantage || w.advantage || w.rollOptions.advantage || w.workflowOptions?.advantage || w.flankingAdvantage)
                w.disadvantage = true;
        })
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
