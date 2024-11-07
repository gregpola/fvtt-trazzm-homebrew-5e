/*
    Melee Weapon Attack: +7 to hit, reach 10ft., one target. Hit: 26 (4d10 + 4) bludgeoning damage and a target that is
    size Large or smaller is knocked away from the chikfari 10 feet and must succeed on a DC 15 Strength saving throw or be knocked Prone.
 */
const version = "12.3.0";
const optionName = "Chikfari Kick";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.hitTargets.first();
        if (targetToken) {
            const tsize = targetToken.actor.system.traits.size;
            if (["tiny", "sm", "med", "lg"].includes(tsize)) {
                let saveRoll = await targetToken.actor.rollAbilitySave("str", {flavor: "Keep from being knocked prone - DC 15 STR"});
                if (saveRoll.total < 15) {
                    await HomebrewEffects.applyProneEffect(targetToken.actor, item.uuid);
                    await HomebrewMacros.wait(500);
                }
                await HomebrewMacros.pushTarget(token, targetToken, 2);
            }
        }
    }

}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
