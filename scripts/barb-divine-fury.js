/*
	Starting when you choose this path at 3rd level, you can channel divine fury into your weapon strikes. While you’re
	raging, the first creature you hit on each of your turns with a weapon attack takes extra damage equal to 1d6 + half
	your barbarian level. The extra damage is necrotic or radiant; you choose the type of damage when you gain this feature.
*/
const version = "11.0";
const optionName = "Divine Fury";
const rageEffectName = "Rage";
const timeFlag = "divineFuryTime";

try {
    if (args[0].macroPass === "DamageBonus") {
        const lastArg = args[args.length - 1];

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
        if (!isAvailableThisTurn() || !game.combat) {
            console.log(`${optionName} - not available this attack`);
            return;
        }

        // set the time flag
        const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn / 100}`;
        const lastTime = actor.getFlag("midi-qol", timeFlag);
        if (combatTime !== lastTime) {
            await actor.setFlag("midi-qol", timeFlag, combatTime)
        }

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
        const diceMult = lastArg.isCritical ? 2 : 1;
        const barbarianLevel = actor.getRollData().classes.barbarian?.levels ?? 0;
        const bonus = Math.ceil(barbarianLevel / 2);
        return {damageRoll: `${diceMult}d6+${bonus}[${damageType}]`, flavor: `${optionName} Damage`};
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function hasEffectApplied(effectName, actor) {
    return actor.effects.find((ae) => ae.name === effectName) !== undefined;
}

// Check to make sure the actor hasn't already applied the damage this turn
function isAvailableThisTurn() {
    if (game.combat) {
        const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn / 100}`;
        const lastTime = actor.getFlag("midi-qol", timeFlag);
        if (combatTime === lastTime) {
            console.log(`${optionName}: already used this turn`);
            return false;
        }

        return true;
    }

    return false;
}
