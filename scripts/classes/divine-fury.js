/*
	Starting when you choose this path at 3rd level, you can channel divine fury into your weapon strikes. While you’re
	raging, the first creature you hit on each of your turns with a weapon attack takes extra damage equal to 1d6 + half
	your barbarian level. The extra damage is necrotic or radiant; you choose the type of damage when you gain this feature.
*/
const version = "12.3.0";
const optionName = "Divine Fury";
const rageEffectName = "Rage";
const timeFlag = "divineFuryTime";

try {
    if (args[0].macroPass === "DamageBonus") {
        // make sure the actor is raging
        if (!hasEffectApplied(rageEffectName, actor)) {
            console.log(`${optionName}: not raging`);
            return {};
        }

        // make sure it's an attack
        if (!["mwak", "rwak"].includes(workflow.item.system.actionType)) {
            console.log(`${optionName}: not an eligible attack`);
            return {};
        }

        // Check for availability i.e. first hit on the actors turn
        if (!HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) || !game.combat) {
            console.log(`${optionName} - not available this attack`);
            return;
        }

        // set the time flag
        await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);

        // get the damage type from the feature
        let damageType = "radiant";
        let feature = actor.items.find(i => i.name === optionName);
        if (feature) {
            // find the damage type
            let dt = feature.system.damage.parts[0][1];
            if (["necrotic", "radiant"].includes(dt)) {
                damageType = dt;
            }
        }

        // Build the damage bonus
        const barbarianLevel = actor.getRollData().classes.barbarian?.levels ?? 0;
        const bonus = Math.ceil(barbarianLevel / 2);
        if (workflow.isCritical) {
            return {damageRoll: `1d6+6+${bonus}[${damageType}]`, flavor: `${optionName} Damage`};

        }
        else {
            return {damageRoll: `1d6+${bonus}[${damageType}]`, flavor: `${optionName} Damage`};
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function hasEffectApplied(effectName, actor) {
    return actor.effects.find((ae) => ae.name === effectName) !== undefined;
}
