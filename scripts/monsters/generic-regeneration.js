/*
    The troll regains 10 Hit Points at the start of each of its turns. If the troll takes Acid or Fire damage, this
    trait doesn’t function on the troll’s next turn. The troll dies only if it starts its turn with 0 Hit Points and
    doesn’t regenerate.
*/
const optionName = "Regeneration";
const version = "13.5.1";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _suppressionTypes = ['acid', 'fire'];
const _healingFormula = "10";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isDamaged") {
        // apply damage types
        await MonsterMacros.applyDamageTypes(actor, workflow.damageDetail);

        // check for death
        if ((workflow.damageItem.newHP === 0) && !MonsterMacros.shouldRegenerateThisTurn(actor, _suppressionTypes)) {
            await MonsterMacros.applyNoRegenerationEffect(actor);
        }

    }
    else if (args[0] === "each" && lastArgValue.turn === "startTurn") {
        const regen = await MonsterMacros.shouldRegenerateThisTurn(actor, _suppressionTypes);
        if (regen) {
            const healRoll = await new Roll(_healingFormula).evaluate();
            await actor.applyDamage(- healRoll.total);
            await HomebrewHelpers.setUsedThisTurn(actor, MonsterMacros.regenerationTimeFlag);

            const actualHealing = Math.min(healRoll.total, (actor.system.attributes.hp.max - actor.system.attributes.hp.value));
            await ChatMessage.create({
                content: `${actor.name} regenerated ${actualHealing} hit points`,
                speaker: ChatMessage.getSpeaker({ actor: actor })});
        }
        else if (actor.system.attributes.hp.value <= 0) {
            // check for death
            await MonsterMacros.applyNoRegenerationEffect(actor);
            await actor.toggleStatusEffect("dead", {active: true});
        }

        await MonsterMacros.clearDamageTypes(actor);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
