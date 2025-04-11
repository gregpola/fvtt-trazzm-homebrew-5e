/*
    Once per turn when you hit a creature with your pact weapon, you can expend a Pact Magic spell slot to deal an extra
    1d8 Force damage to the target, plus another 1d8 per level of the spell slot, and you can give the target the Prone
    condition if it is Huge or smaller.
 */
const version = "12.4.0";
const optionName = "Eldritch Smite";
const timeFlag = "last-eldritch-smite";

try {
    if (args[0].macroPass === "DamageBonus") {
        if (!workflow.hitTargets.size) return {};
        if (rolledItem.type !== "weapon") return {}

        if (HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) && game.combat) {
            // make sure it's the actor's pact weapon
            const pactWeapon = rolledItem.effects.find(eff => eff.name === "Pact Weapon");
            if (!pactWeapon) return {};

            let slots = actor.system.spells.pact.value;
            if (!slots) return {};

            const slotLevel = actor.system.scale.warlock['slot-level']?.value ?? 0;
            const dieCount = slotLevel + 1;
            const damageDice = `${dieCount}d8`;

            const useFeature = await foundry.applications.api.DialogV2.confirm({
                window: {
                    title: `${optionName}`,
                },
                content: `<p>Add ${optionName} to your damage?</p><sub>(${damageDice} force damage, ${slots} remaining)</sub>`,
                rejectClose: false,
                modal: true
            });

            if (useFeature) {
                await actor.update({['system.spells.pact.value']: slots - 1});
                await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);

                return new CONFIG.Dice.DamageRoll(`${damageDice}[force]`, {}, {
                    type: 'force',
                    properties: [...rolledItem.system.properties]
                });
            }
        }

        return {};
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
