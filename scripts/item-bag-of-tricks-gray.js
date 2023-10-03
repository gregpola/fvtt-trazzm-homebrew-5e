const version = "11.0";
const optionName = "Bag of Tricks (Gray)";
const tableId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-roll-tables.vJLTbXtQtCuwImH0"

try {
    if (args[0] === "on") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module")

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
                        "disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
                        "displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
                        "displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
                        "bar1": { attribute: "attributes.hp" },
                        "actorLink": false,
                        "flags": { "midi-srd": { "Bag of Tricks" : { "ActorId": actor.id } } }
                    },
                    "name": summonName
                };

                let summonActor = game.actors.getName(summonName);
                if (!summonActor) {
                    // import the actor
                    let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), summonId, updates);
                    if (!document) {
                        ui.notifications.error(`${optionName} - unable to import ${results[0].text} from the compendium`);
                        return;
                    }
                    await warpgate.wait(500);
                    summonActor = game.actors.getName(summonName);
                }

                // Spawn the result
                const maxRange = item.system.range.value ? item.system.range.value : 20;
                let position = await HomebrewMacros.warpgateCrosshairs(token, maxRange, item, summonActor.prototypeToken);
                if (position) {
                    let options = {collision: true};
                    let spawned = await warpgate.spawnAt(position, summonName, updates, { controllingActor: actor }, options);
                    if (!spawned || !spawned[0]) {
                        ui.notifications.error(`${optionName} - unable to spawn the critter`);
                    }

                    let summonedToken = canvas.tokens.get(spawned[0]);
                    if (summonedToken) {
                        await anime(token, summonedToken);
                        await summonedToken.toggleCombat();
                        const objectInitiative = token.combatant.initiative ? token.combatant.initiative - .01
                            : 1 + (summonedToken.actor.system.abilities.dex.value / 100);
                        await summonedToken.combatant.update({initiative: objectInitiative});
                    }
                }
                else {
                    ui.notifications.error(`${optionName} - invalid conjure location`);
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
    else if (args[0] === "off") {
        // delete the critters pulled from the bag
        // can't really do this as the bag can be used even if there is already a summon
    }

} catch (err) {
    console.error(`${optionName} ${version}`, err);
}

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.misty_step.01.blue")
        .atLocation(target)
        .scaleToObject(1)
        .play();
}
