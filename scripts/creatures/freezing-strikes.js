/*
	The myrmidon uses Multiattack. Each attack that hits deals an extra 5 (1d10) cold damage. A target that is hit by
	one or more of these attacks has its speed reduced by 10 feet until the end of the myrmidon’s next turn.
*/
const version = "11.0";
const optionName = "Freezing Strikes";
const effectName = "freezing-strikes-movement";

try {
    if ((args[0].macroPass === "DamageBonus") && (workflow.hitTargets.size > 0)) {
        // apply move reduction
        let target = workflow.hitTargets.first();
        let effect = target.actor.effects.find(e => e.name === effectName);
        if (!effect) {
            const effectData = {
                name: effectName,
                icon: "icons/magic/water/snowflake-ice-purple.webp",
                origin: item.uuid,
                changes: [
                    {
                        key: 'system.attributes.movement.all',
                        mode: 2,
                        value: "- 10",
                        priority: 20
                    }
                ],
                flags: {
                    dae: {
                        selfTarget: false,
                        stackable: "none",
                        durationExpression: "",
                        macroRepeat: "none",
                        specialDuration: ["turnEndSource"],
                        transfer: false
                    }
                },
                disabled: false
            };

            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: [effectData] });
        }
        
        if (workflow.isCritical) {
            return {damageRoll: `1d10+10[cold]`, flavor: `${optionName}`};
        }

        return {damageRoll: `1d10[cold]`, flavor: `${optionName}`};
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
