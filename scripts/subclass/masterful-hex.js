/*
    Your patron’s accursed might flows even more strongly through you, granting the following benefits.

    Accursed Critical. Any attack roll you make against the target cursed by your Hex scores a Critical Hit on a roll of
    a 19 or 20 on the d20.

    Explosive Hex. When you deal damage to the target cursed by your Hexblade’s Curse, you can cause your curse to
    explode with sinister energy. The target and each creature of your choice in a 30-foot Emanation originating from
    the target take 3d6 Necrotic, Psychic, or Radiant damage (your choice), and their Speed is reduced by 10 feet until
    the start of your next turn. Once you use this benefit, you can’t use it again until you finish a Long Rest unless
    you expend a Pact Magic slot (no action required) to restore your use of it.
*/
const optionName = "Masterful Hex";
const version = "12.4.1";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
        const targetToken = workflow.targets.first();
        if (HomebrewHelpers.isHexed(actor, targetToken.actor)) {
            let effectData = {
                name: optionName,
                icon: item.img,
                changes: [
                    {
                        key: 'flags.midi-qol.grants.criticalThreshold',
                        mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
                        value: 19,
                        priority: 20
                    }
                ],
                flags: {
                    dae: {
                        specialDuration: ['isAttacked']
                    }
                },
                origin: item.uuid,
                duration: {
                    seconds: 6
                },
                disabled: false
            };

            await MidiQOL.socket().executeAsGM("createEffects",
                {actorUuid: targetToken.actor.uuid, effects: [effectData]});
        }

    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
