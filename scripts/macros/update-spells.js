/*
	Updates all the spells on the selected actors to the latest version.
*/
const optionName = "Update Spells";
const version = "14.5.0";
const homebrewCompendiumId = "fvtt-trazzm-homebrew-5e.trazzm-spells-2024";
let homebrewSpellsPack;
let homebrewSpellsPackIndex;
const packCache = new Map();
const updateStatuses = new Map();
const indexFields = ['name', 'type', 'identifier'];

try {
    homebrewSpellsPack = game.packs.get(homebrewCompendiumId);
    if (!homebrewSpellsPack) {
        return ui.notifications.error(`${optionName}: ${version} - unable to load the homebrew compendium`);
    }

    homebrewSpellsPackIndex = await homebrewSpellsPack.getIndex({fields: indexFields});
    if (!homebrewSpellsPack) {
        return ui.notifications.error(`${optionName}: ${version} - unable to load the homebrew compendium index`);
    }
    packCache.set(homebrewCompendiumId, { pack: homebrewSpellsPack, index: homebrewSpellsPackIndex });

    for (let tok of canvas.tokens.controlled) {
        await updateActorSpells(tok.actor);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function parseCompendiumId(sourceId) {
    let result = sourceId.substring(0, sourceId.lastIndexOf(".Item.") + 1);
    if (result.length > 0) {
        return result;
    }

    return sourceId;
}

async function updateActorSpells(actor) {
    if (actor) {
        var spellUpdates = [];

        // get the actor's current spells
        // TODO skip spells from equipment and look at other features, like subclasses and feats
        // TODO magic missile is from the wand for testing
        // TODO sort by name
        const actorSpells = actor.items.filter((i) => i.type === "spell");

        if (actorSpells.length === 0) {
            return ui.notifications.error(`${optionName}: ${version} - ${actor.name} has no spells`);
        }

        // check for updates
        // priority is to check the homebrew module first, then if it isn't there, check the original source compendium
        // update is available if the system.source.revision is greater than the current value -or- the spell is now in the homebrew
        var results = [];
        for (let spell of actorSpells) {
            var sourceCompendiumId = parseCompendiumId(spell.flags.dnd5e.sourceId);
            var spellUpdateStatus = [];
            var cachedPackData = packCache.get(sourceCompendiumId);
            var cachedPackIndex = undefined;
            var updatedSpell = undefined;
            var updatedCompendium = undefined;


            // add the spell's source compendium to the cache
            if (!cachedPackData) {
                var cachedPack = game.packs.get(sourceCompendiumId);
                if (cachedPack) {
                    cachedPackIndex = await cachedPack.getIndex({fields: indexFields});
                    cachedPackData = {pack: cachedPack, index: cachedPackIndex};
                    packCache.set(sourceCompendiumId, cachedPackData);
                }
                else {
                    spellUpdateStatus.push(`Source compendium ${sourceCompendiumId} not found`);
                }
            }

            // check if the spell was added to the homebrew compendium
            if (sourceCompendiumId !== homebrewCompendiumId) {
                let match = homebrewSpellsPackIndex.find(item => item.name === spell.name && item.identifier === spell.identifier);
                if (match) {
                    updatedSpell = await homebrewSpellsPack.getDocument(match._id);
                    updatedCompendium = homebrewCompendiumId;
                }
            }

            // If not, check the original source compendium
            if (!updatedSpell && cachedPackIndex) {
                let match = cachedPackIndex.find(item => item.name === spell.name && item.identifier === spell.identifier);
                if (match) {
                    var currentSpell = await cachedPackData.pack.getDocument(match._id);
                    var actorRevision = spell.system.source.revision ?? 0;
                    var compendiumRevision = currentSpell.system.source.revision ?? 0;

                    if (compendiumRevision > actorRevision) {
                        updatedSpell = currentSpell;
                        updatedCompendium = sourceCompendiumId;
                    }
                    else {
                        spellUpdateStatus.push(`Current revision '${actorRevision}' is the same as the compendium revision '${compendiumRevision}'`);
                    }
                }
            }

            if (updatedSpell) {
                var updatedSpellData = updatedSpell.toObject();

                // preserve important data
                updatedSpellData.abilityMod = spell.abilityMod;
                updatedSpellData.isOnCooldown = spell.isOnCooldown;
                updatedSpellData.hasLimitedUses = spell.hasLimitedUses;

                updatedSpellData.flags.dnd5e.advancementOrigin = spell.flags.dnd5e.advancementOrigin;
                updatedSpellData.flags.dnd5e.advancementRoot = spell.flags.dnd5e.advancementRoot;

                updatedSpellData.system.ability = spell.system.ability;
                updatedSpellData.system.prepared = spell.system.prepared;
                updatedSpellData.system.sourceItem = spell.system.sourceItem;
                updatedSpellData.system.uses = foundry.utils.deepClone(spell.system.uses); // TODO check this result
                updatedSpellData.system.abilityMod = spell.system.abilityMod;
                updatedSpellData.system.advancementClassLinked = spell.system.advancementClassLinked;
                updatedSpellData.system.advancementLevel = spell.system.advancementLevel;
                updatedSpellData.system.countsPrepared = spell.system.countsPrepared;
                updatedSpellData.system.hasLimitedUses = spell.system.hasLimitedUses;
                updatedSpellData.system.preparation.mode = spell.system.preparation.mode ?? "prepared";
                updatedSpellData.system.preparation.prepared = spell.system.preparation.prepared ?? 0;
                updatedSpellData.system.sourceClass = spell.system.sourceClass;

                // remove the old spell and add the new one
                await actor.deleteEmbeddedDocuments('Item', [spell.id]);
                await actor.createEmbeddedDocuments('Item', [updatedSpellData]);
                spellUpdateStatus.push(`Updated spell to revision '${updatedSpell.system.source.revision}' in compendium: ${updatedCompendium}`);

                // TODO too many issues losing macros, activities and animations
            }
            else {
                spellUpdateStatus.push(`Updated spell version not found`);
            }
        }

        // display update results
        let listsHtml = `<div style="font-weight:bold;margin-bottom:4px;font-size:13px;border-bottom:1px solid #7a7975;padding-bottom:2px;">${actor.name}</div>`;

        // TODO spit out all update statuses
        if (spellUpdates.length > 0) {
            listsHtml += `<ul style="margin:2px 0 6px 12px;padding:0;font-style:italic;color:#3a5f3a;">${preparedNames
                .map((s) => `<li>${s}</li>`)
                .join("")}</ul>`;
        }

        let cardContent = `<div class="dice-roll compendium-sync-report"><div class="dice-flavor" style="padding:6px;font-weight:bold;background:#222;color:#fff;border-radius:4px 4px 0 0;"><i class="fas fa-magic"></i> Spell Sync Report</div><div style="padding:8px;font-size:12px;background:rgba(0,0,0,0.05);border:1px solid #bbb;border-top:none;"><p style="margin:0 0 4px 0;font-size:10px;color:#666;">Source Pack: ${packLabel}</p>${listsHtml}</div></div>`;

        await ChatMessage.create({
            user: game.user.id,
            speaker: { alias: "Sync Engine" },
            content: cardContent,
            whisper: [game.user.id]
        });
    }
}