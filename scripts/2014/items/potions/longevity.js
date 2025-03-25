/*
    When you drink this potion, your physical age is reduced by 1d6 + 6 years, to a minimum of 13 years. Each time you
    subsequently drink a potion of longevity, there is a 10 percent cumulative chance that you instead age by 1d6 + 6
    years. Suspended in this amber liquid are a scorpion's tail, an adder's fang, a dead spider, and a tiny heart that,
    against all reason, is still beating. The ingredients vanish when the potion is opened.
*/
const version = "12.3.0";
const optionName = "Potion of Longevity";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "longevity-potion-uses";

try {
    const targetToken = workflow.targets.first();

    if (args[0].macroPass === "postActiveEffects" && targetToken) {
        const ageRoll = await new Roll('1d6 + 6').evaluate();
        await game.dice3d?.showForRoll(ageRoll);
        let useCount = 0;
        let newAge = Number(targetToken.actor.system.details.age);
        console.warn(`${optionName} - targets starting age is: ${newAge}`);

        let flag = targetToken.actor.getFlag(_flagGroup, flagName);
        if (flag) {
            useCount = Number(flag);
            let reversalChance = useCount * 10;
            const reversalRoll = await new Roll('1d100').evaluate();
            await game.dice3d?.showForRoll(reversalRoll);

            if (reversalRoll.total <= reversalChance) {
                newAge += ageRoll.total;
                await targetToken.actor.update({"system.details.age": newAge});

                ChatMessage.create({
                    content: `${targetToken.name} is aged ${ageRoll.total} years from drinking the ${optionName}`,
                    speaker: ChatMessage.getSpeaker({actor: actor})
                });

                useCount++;
                await actor.setFlag(_flagGroup, flagName, useCount);
                return;
            }
        }

        // de-age
        newAge = Math.max(newAge - ageRoll.total, 13);
        await targetToken.actor.update({"system.details.age": newAge});

        ChatMessage.create({
            content: `${targetToken.name} is age is reduced to ${newAge} from drinking the ${optionName}`,
            speaker: ChatMessage.getSpeaker({actor: actor})
        });

        useCount++;
        await actor.setFlag(_flagGroup, flagName, useCount);
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
