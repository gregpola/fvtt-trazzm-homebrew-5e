/*
    If the poison damage reduces the target to 0 hit points, the target is stable but poisoned for 1 hour, even after
    regaining hit points, and is paralyzed while poisoned in this way.
*/
const version = "11.0";
const optionName = "Spider Bite";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.hitTargets.first();
        if (targetToken) {
            const dl = workflow.damageList[0];
            if (dl.newHP <= 0 ) {
                const poisonDetail = workflow.damageList[0]?.damageDetail[0][1] ?? undefined;
                if (poisonDetail) {
                    const poisonDamage = poisonDetail.damage * poisonDetail.damageMultiplier;
                    if (poisonDamage > 0) {
                        const poisonedData = [{
                            name: "Spider Bite",
                            icon: 'icons/creatures/invertebrates/spider-mandibles-brown.webp',
                            origin: null,
                            transfer: false,
                            disabled: false,
                            duration: {startTime: game.time.worldTime, seconds: 3600},
                            changes: [
                                { key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Poisoned", priority: 20 },
                                { key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Paralyzed", priority: 21 }
                            ]
                        }];
                        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: poisonedData });
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
