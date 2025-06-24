/*
    Life Drain. When you hit a creature with this shortsword, you can force that creature to make a DC 15 Constitution
    saving throw. On a failure, the creature suffers 1 level of Exhaustion and is Paralyzed for 1 minute. The creature
    can repeat the saving throw at the end of each of its turns, ending the effect on a success.

    While the target is Paralyzed this way, you can use an action on each of your turns to cause it to suffer 1 level of
    Exhaustion and you regain 4d6 hit points.
*/
const optionName = "Assassins Blade - Exhaustion";
const version = "12.4.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.targets.first();
        if (targetToken) {
            const currentExhaustion = targetToken.actor.system.attributes.exhaustion ?? 0;
            await targetToken.actor.update({'system.attributes.exhaustion': currentExhaustion + 1});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
