const version = "14.5.1";
const optionName = "Experimental Elixir - Brew";
const elixirId = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-automation-items-2024.Item.3HYJK61ZGLlQKfi4";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "experimental-elixir-choice";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let elixirItem = await fromUuid(elixirId);
        const artificerLevel = actor.getRollData().classes?.artificer?.levels ?? 1;
        const intMod = actor.system.abilities.int.mod;
        let elixirCount = Number(actor.system.scale.alchemist['experimental-elixir-count']);

        const elixirDupe = foundry.utils.duplicate(elixirItem);

        // should the user be allowed to select the effect?
        if (workflow.activity.identifier === 'spell-slot-for-elixir') {
            elixirCount = 1;
        }
        elixirDupe.system.quantity = elixirCount;

        // add the food to the actors inventory, they can dispense it
        let results = await actor.createEmbeddedDocuments('Item',[elixirDupe]);
        if (workflow.activity.identifier === 'spell-slot-for-elixir') {
            await results[0].setFlag(_flagGroup, _flagName, true);
        }

        // update the activity effects
        let healingActivity = results[0].system.activities.getName("Healing");
        const healingDice = (artificerLevel > 8) ? ((artificerLevel > 14) ? 4 : 3) : 2;
        await healingActivity.update({
            "healing.number" : healingDice,
            "healing.bonus" : intMod
        });

        //const swiftnessActivity = results[0].system.activities.getName("Swiftness");
        const swiftnessEffect = macroItem.effects.getName("Swiftness");
        if (swiftnessEffect) {
            const moveBonus = (artificerLevel > 8) ? ((artificerLevel > 14) ? '+20' : '+15') : '+10';
            const movementChange = swiftnessEffect.changes.find(change => change.key === 'system.attributes.movement.all');
            if (movementChange) {
                await swiftnessEffect.update({
                    changes: [{
                        key: 'system.attributes.movement.all',
                        value: `${moveBonus}`,
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        priority: 20
                    }]});
            }
        }

        const resilienceActivity = results[0].system.activities.getName("Resilience");
        const units = (artificerLevel > 8) ? 'hour' : 'minute';
        const duration = (artificerLevel > 8) ? ((artificerLevel > 14) ? '8' : '1') : '10';
        await resilienceActivity.update({
            "duration.units" : units,
            "duration.value" : duration
        });

        const boldnessActivity = results[0].system.activities.getName("Boldness");
        const duration2 = (artificerLevel > 8) ? ((artificerLevel > 14) ? '60' : '10') : '1';
        await boldnessActivity.update({
            "duration.value" : duration2
        });

        //const flightActivity = results[0].system.activities.getName("Flight");
        const flightEffect = macroItem.effects.getName("Flight");
        if (flightEffect) {
            const moveBonus = (artificerLevel > 8) ? ((artificerLevel > 14) ? '30' : '20') : '10';
            const movementChange = flightEffect.changes.find(change => change.key === 'system.attributes.movement.fly');
            if (movementChange) {
                await flightEffect.update({
                    changes: [{
                        key: 'system.attributes.movement.fly',
                        value: `${moveBonus}`,
                        mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
                        priority: 20
                    }]});
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
