const version = "11.1";
const optionName = "Flute of the Genie";
const genieCompendiumId = "8bCnmq6mhoNkyNpe";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const summonFlag = "flute-genie";

try {
    if (args[0] === "on") {
        const summonName = `Azzam (${actor.name})`;

        // build the update data for the totem
        const characterLevel = actor.type === "character" ? actor.system.details.level : actor.system.details.cr;
        const actorDC = actor.system.attributes.spelldc ?? 12;
        const hpValue = 5 + (5 * characterLevel);

        let updates = {
            token: {
                "name": summonName,
                "disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
                "displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
                "displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
                "bar1": {attribute: "attributes.hp"},
                "actorLink": false,
                "flags": {"fvtt-trazzm-homebrew-5e": {"Azzam": {"ActorId": actor.id}}}
            },
            actor: {
                "name": summonName,
                "system": {
                    "details.cr": characterLevel,
                    "attributes.hp": {value: hpValue, max: hpValue, formula: hpValue},
                    "attributes.spelldc": actorDC
                }
            },
            name: summonName
        };

        let summonActor = game.actors.getName(summonName);
        if (!summonActor) {
            // Get from the compendium
            let entity = await fromUuid("Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-actors." + genieCompendiumId);
            if (!entity) {
                ui.notifications.error(`${optionName} - unable to find the actor`);
                return false;
            }

            // import the actor
            let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), genieCompendiumId, updates);
            if (!document) {
                ui.notifications.error(`${optionName} - unable to import from the compendium`);
                return false;
            }

            summonActor = game.actors.getName(summonName);
        }

        // Spawn the result
        let position = await HomebrewMacros.warpgateCrosshairs(token, 30, item, summonActor.prototypeToken);
        if (position) {
            const result = await warpgate.spawnAt(position, summonName, updates, { controllingActor: actor, collision: true }, {});
            if (!result || !result[0]) {
                ui.notifications.error(`${optionName} - Unable to spawn`);
                return;
            }

            let summonedToken = canvas.tokens.get(result[0]);
            if (summonedToken) {
                await anime(token, summonedToken);
                await actor.setFlag(_flagGroup, summonFlag, summonedToken.id);
                await summonedToken.toggleCombat();
                const summonedInitiative = token.combatant.initiative ? token.combatant.initiative - .01
                    : 1 + (summonedToken.actor.system.abilities.dex.value / 100);
                await summonedToken.combatant.update({initiative: summonedInitiative});

            }

        }
        else {
            ui.notifications.error(`${optionName} - invalid summon location`);
            return;
        }
    }
    else if (args[0] === "off") {
        // delete the summon
        const lastSummon = actor.getFlag(_flagGroup, summonFlag);
        if (lastSummon) {
            await actor.unsetFlag(_flagGroup, summonFlag);
            await warpgate.dismiss(lastSummon, game.canvas.scene.id);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.misty_step.02.blue")
        .atLocation(target)
        .scaleToObject(1)
        .play();
}
