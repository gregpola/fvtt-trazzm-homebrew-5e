const version = "11.0"
const optionName = "Spirit Guardians";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const lastAppliedTimeFlag = "last-applied-time-flag";

try {
    const lastArg = args[args.length -1];

    // token entering aura
    if (args[0] === "on" && args[1] !== lastArg.tokenId && lastArg.tokenId === game.combat?.current.tokenId) {
        if (isAvailableThisTurn(actor)) {
            const combatTime = `${game.combat.round + game.combat.turn /100}`;
            await actor.setFlag(_flagGroup, lastAppliedTimeFlag, `${combatTime}`);

            let activeEffect = actor.effects.find(e => e.id === lastArg.effectId);
            if (activeEffect) {
                await MidiQOL.doOverTimeEffect(actor, activeEffect);
            }
        }
    }
    else if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.targets.first();
        if (targetToken && isAvailableThisTurn(targetToken.actor)) {
            const combatTime = `${game.combat.round + ((game.combat.turn + 1) /100)}`;
            await targetToken.actor.setFlag(_flagGroup, lastAppliedTimeFlag, `${combatTime}`);
        }
    }
} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}

function isAvailableThisTurn(theActor) {
    if (game.combat) {
        const combatTime = `${game.combat.round + game.combat.turn /100}`;
        const lastTime = theActor.getFlag(_flagGroup, lastAppliedTimeFlag);
        if (combatTime === lastTime) {
            return false;
        }

        return true;
    }

    return false;
}
