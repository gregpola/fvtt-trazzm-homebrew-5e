const version = "12.3.0";
const optionName = "Bag of Tricks (Rust)";
const tableId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-roll-tables.RollTable.FDwpT890udz92kxl"

try {
    if (args[0].macroPass === "postActiveEffects") {
        const table = await fromUuid(tableId);
        if (table) {
            const {roll, results} = await table.draw({ displayChat: false });

            if (results) {
                await table.toMessage(results, {roll, messageData: {speaker: {alias: game.user.name}}});

                // get the summoned critter
                const collectionName = results[0].documentCollection;
                const summonId = results[0].documentId;
                let entity = await fromUuid("Compendium." + collectionName + "." + summonId);
                if (!entity) {
                    ui.notifications.error(`${optionName} - unable to find the creature: ${results[0].text}`);
                    return;
                }

                // build the update data to match summoned traits
                const summonName = `${entity.name} (${actor.name})`;

                let updates = {
                    token: {
                        "name": summonName,
                        "disposition": token.document.disposition,
                        "displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
                        "displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
                        "bar1": { attribute: "attributes.hp" },
                        "actorLink": false
                    },
                    "name": summonName
                };

                let summonActor = game.actors.getName(summonName);
                if (!summonActor) {
                    // import the actor
                    let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), summonId, updates);
                    if (!document) {
                        return ui.notifications.error(`${optionName} - unable to import the actor from the compendium`);
                    }
                    await HomebrewMacros.wait(500);
                    summonActor = game.actors.getName(summonName);
                }

                // Spawn the result
                const maxRange = item.system.range.value ? item.system.range.value : 20;

                const portal = await new Portal()
                    .addCreature(summonActor, {updateData: updates , count: 1})
                    .color("#ff0000")
                    .texture(summonActor.prototypeToken.texture.src)
                    .origin(token)
                    .range(maxRange);

                const spawned = await portal.spawn();
                if (spawned) {
                    //await actor.setFlag(_flagGroup, summonFlag, summonName);
                    let spawnDocument = spawned[0];
                    await spawnDocument.toggleCombatant();
                    await spawnDocument.actor.rollInitiative();
                }
            }
            else {
                ui.notifications.error(`${optionName}: the table result is undefined`);
            }
        }
        else {
            ui.notifications.error(`${optionName}: unable to locate the roll-table in the compendium`);
        }
    }
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
