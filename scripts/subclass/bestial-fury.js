/*
    In addition, the first time each turn it hits a creature under the effect of your Hunter’s Mark spell, the beast
    deals extra Force damage equal to the bonus damage of that spell.
*/
const optionName = "Bestial Fury";
const version = "12.4.0";
const timeFlag = "bestial-fury";
const targetEffectName = "Hunters Marked";

try {
    if (args[0].macroPass === "DamageBonus" && item.name === 'Beast’s Strike') {
        if (HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) && game.combat) {
            const targetToken = workflow.hitTargets.first();
            if (targetToken) {
                // get the summoned token'ss parent actor
                const sceneId = canvas.scene.id;
                const tokenId = token.id;
                const dependentUuid = `Scene.${sceneId}.Token.${tokenId}`;
                const parentActor = HomebrewHelpers.findSummonedOwner(dependentUuid, "Summon: Primal Companion");

                if (!parentActor) {
                    ui.notifications.error(`${optionName}: ${version} - Unable to find the summoned's owner`);
                    return {};
                }

                const originStart = `Actor.${parentActor.id}.`;
                let isMarked = false;

                for (let targetEffect of targetToken.actor?.getRollData()?.effects) {
                    if ((targetEffect.name === targetEffectName) && targetEffect.origin.startsWith(originStart)) {
                        isMarked = true;
                        break;
                    }
                }

                if (isMarked) {
                    await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
                    const diceMult = workflow.isCritical ? 2 : 1;
                    const damageDie = parentActor.system.scale.ranger.mark.die;

                    return new game.system.dice.DamageRoll(`${diceMult}${damageDie}`, {}, {
                        isCritical: workflow.isCritical,
                        properties: ["mgc"],
                        type: "force",
                        flavor: optionName
                    });
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
