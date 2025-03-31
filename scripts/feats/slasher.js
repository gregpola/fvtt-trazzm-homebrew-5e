/*
	When you score a Critical Hit that deals Slashing damage to a creature, it has Disadvantage on attack rolls until
	the start of your next turn.
 */
const version = "12.4.0";
const optionName = "Slasher - Enhanced Critical";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
        // make sure it's an allowed attack
        if (workflow.damageDetail.filter(i=>i.type === "slashing").length < 1) {
            console.debug(`${optionName}: ${version} - not slashing damage`);
            return;
        }

        if (!workflow.isCritical) {
            console.debug(`${optionName}: ${version} - not a critical hit`);
            return;
        }

        const effect_sourceData = {
            changes: [{ key: "flags.midi-qol.disadvantage.attack.all", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: 1, priority: 2}],
            origin: item.uuid,
            duration: game.combat ? { rounds: 1, turns:0, startRound: `${game.combat.round}`, startTurn: `${game.combat.turn}`, startTime: `${game.time.worldTime}`} : {seconds: 6, startTime: `${game.time.worldTime}`},
            icon: "icons/skills/melee/strike-sword-gray.webp",
            name: optionName,
            flags: {dae: {specialDuration: ['turnStartSource']}},
        };

        for (let targetToken of workflow.hitTargets) {
            let effect = HomebrewHelpers.findEffect(targetToken.actor, optionName);
            if (effect) {
                await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [effect.id] });
            }
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: [effect_sourceData] });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
