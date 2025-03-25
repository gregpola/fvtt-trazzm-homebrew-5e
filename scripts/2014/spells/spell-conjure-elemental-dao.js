/*
	You call forth an elemental servant. Choose an area of air, earth, fire, or water that fills a 10-foot cube within
	range. An elemental of challenge rating 5 or lower appropriate to the area you chose appears in an unoccupied space
	within 10 feet of it. For example, a fire elemental emerges from a bonfire, and an earth elemental rises up from the
	ground. The elemental disappears when it drops to 0 hit points or when the spell ends.

	The elemental is friendly to you and your companions for the duration. Roll initiative for the elemental, which has
	its own turns. It obeys any verbal commands that you issue to it (no action required by you). If you don't issue any
	commands to the elemental, it defends itself from hostile creatures but otherwise takes no actions.

	If your concentration is broken, the elemental doesn't disappear. Instead, you lose control of the elemental, it
	becomes hostile toward you and your companions, and it might attack. An uncontrolled elemental can't be dismissed by
	you, and it disappears 1 hour after you summoned it.

	At Higher Levels. When you cast this spell using a spell slot of 6th level or higher, the challenge rating increases by 1 for each slot level above 5th.
 */
const version = "11.0";
const optionName = "Conjure Elemental";
const summonFlag = "conjure-elemental";

// NOTE: Dao can only summon Earth elementals
try {
    if (args[0].macroPass === "postActiveEffects") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module")

        // select the summoned creature
        let summonedId = undefined;
        let rollResult = (new Roll('1d6').evaluate({async: false})).total;

        const spellLevel = workflow.castData.castLevel;
        if (spellLevel < 6) {
            if (rollResult < 5)
                summonedId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures.Er3IcB2uBCAiVuAP";
            else
                summonedId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures.YDDsO7XAVnlgVFpz";
        } else if (spellLevel === 6)
            summonedId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures.ccZ9tVrnPc7B1lIB";
        else
            summonedId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures.Nj3KeUCly4wFaYjg";

        if (summonedId) {
            let entity = await fromUuid(summonedId);
            if (!entity) {
                ui.notifications.error(`${optionName} - unable to find the creature: ${results[0].text}`);
                return;
            }

            // build the update data to match summoned traits
            const summonName = `${entity.name} (${actor.name})`;
            let updates = {
                token: {
                    "name": summonName,
                    "disposition": token.disposition,
                    "displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
                    "displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
                    "bar1": {attribute: "attributes.hp"},
                    "actorLink": false,
                    "flags": {"fvtt-trazzm-homebrew-5e": {"Conjured Elemental": {"ActorId": actor.id}}}
                },
                "name": summonName,
                "system.details": {
                    "type.value": "fey"
                }
            };

            // Add the summon to the scene
            let summonActor = game.actors.getName(summonName);
            if (!summonActor) {
                // import the actor
                let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), entity.id, updates);
                if (!document) {
                    ui.notifications.error(`${optionName} - unable to import ${results[0].text} from the compendium`);
                    return;
                }
                await warpgate.wait(500);
                summonActor = game.actors.getName(summonName);
            }

            // Spawn the result
            const maxRange = item.system.range.value ? item.system.range.value : 90;
            let position = await HomebrewMacros.warpgateCrosshairs(token, maxRange, item, summonActor.prototypeToken);
            if (position) {
                let options = {collision: true};
                let spawned = await warpgate.spawnAt(position, summonName, updates, {controllingActor: actor}, options);
                if (!spawned || !spawned[0]) {
                    ui.notifications.error(`${optionName} - unable to spawn the elemental`);
                    return false;
                }

                await actor.setFlag("fvtt-trazzm-homebrew-5e", summonFlag, summonName);

                for (let i = 0; i < spawned.length; i++) {
                    let spawnId = spawned[i];
                    let summonedToken = canvas.tokens.get(spawnId);
                    if (summonedToken) {
                        await anime(token, summonedToken);
                        await summonedToken.toggleCombat();
                        await summonedToken.actor.rollInitiative();
                    }
                }
            } else {
                ui.notifications.error(`${optionName} - invalid conjure location`);
            }
        } else {
            ui.notifications.error(`${optionName}: unable to locate an eligible elemental`);
        }
    } else {
        return false;
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.misty_step.01.grey")
        .atLocation(target)
        .scaleToObject(1)
        .play();
}