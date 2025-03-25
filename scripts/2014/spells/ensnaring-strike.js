/*
    The next time you hit a creature with a weapon attack before this spell ends, a writhing mass of thorny vines
    appears at the point of impact, and the target must succeed on a Strength saving throw or be Restrained by the
    magical vines until the spell ends. A Large or larger creature has advantage on this saving throw. If the target
    succeeds on the save, the vines shrivel away.

    While restrained by this spell, the target takes 1d6 piercing damage at the start of each of its turns. A creature
    restrained by the vines or one that can touch the creature can use its action to make a Strength check against your
    spell save DC. On a success, the target is freed.

    At Higher Levels. If you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for
    each slot level above 1st.
*/
const version = "12.3.0";
const optionName = "Ensnaring Strike";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "ensnaring-strike-data";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const damageDice = workflow.castData.castLevel;
        await actor.setFlag(_flagGroup, flagName, {applied: false, damageDice: damageDice, startRound: game.combat.round});
    }
    else if (args[0].tag === "OnUse" && args[0].macroPass === "postDamageRoll") {
        if (["mwak", "rwak"].includes(workflow.item.system.actionType)) {
            let flag = actor.getFlag(_flagGroup, flagName);
            if (!flag.applied) {
                let targetToken = workflow.hitTargets.first();
                if (targetToken) {
                    await actor.setFlag(_flagGroup, flagName, {applied: true, damageDice: flag.damageDice, startRound: flag.startRound});

                    const dc = actor.system.attributes.spelldc;
                    const flavor = `${CONFIG.DND5E.abilities["str"].label} DC${dc} ${optionName}`;
                    let hasAdvantage = false;

                    const tsize = targetToken.actor.system.traits.size;
                    if (!["tiny", "sm", "med"].includes(tsize)) {
                        hasAdvantage = true;
                    }

                    let saveRoll = await targetToken.actor.rollAbilitySave("str", {flavor: flavor, advantage: hasAdvantage});
                    await game.dice3d?.showForRoll(saveRoll);
                    if (saveRoll.total < dc) {
                        const overtimeData = `turn=start, label=${optionName}, damageRoll=${flag.damageDice}d6, damageType=piercing`;
                        const duration = HomebrewHelpers.itemRemainingDurationSeconds(item, flag.startRound, game.combat.round);
                        await HomebrewEffects.applyRestrainedEffect(targetToken.actor, item.uuid, dc, 'str', undefined, duration, overtimeData);
                    }
                }
            }
        }
    }
    else if (args[0] === "off") {
        let flag = actor.getFlag(_flagGroup, flagName);
        if (flag) {
            await actor.unsetFlag(_flagGroup, flagName);
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
