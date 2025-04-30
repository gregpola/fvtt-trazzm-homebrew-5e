/*
	The cutthroat takes this action to study a target’s movements and fighting style. If the cutthroat attacks the
	target the following round, it gains advantage on the attack roll.
*/
const version = "12.4.0";
const optionName = "Study Opponent";
const targetEffectName = "Studied";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
        let targetToken = workflow.targets.first();
        if (targetToken) {
            let studiedEffect = undefined;
            const originStart = `Actor.${actor.id}.`;

            for (let targetEffect of targetToken.actor?.getRollData()?.effects) {
                if ((targetEffect.name === targetEffectName) && targetEffect.origin.includes(originStart)) {
                    studiedEffect = targetEffect;
                    break;
                }
            }

            if (studiedEffect) {
                workflow.advantage = true;

                await MidiQOL.socket().executeAsGM('removeEffects', {
                    'actorUuid': targetToken.actor.uuid,
                    'effects': [studiedEffect.id]
                });
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
