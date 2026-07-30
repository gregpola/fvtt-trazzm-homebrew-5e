/*
Name: ForceSpellSync.js
Author: Courtney Shoell
Version: 1.0.1
Date: 7/24/2026
Desc: Given a selected spell compendium, sync the matching spells to a selected Actor(s). Choice of unprepared, prepared, or all spells. Keep the status when replaced.
      Sync will replace and update matching from the source compendium: Image, Description, Details, Activities, and Effects
      Spells should still be assigned to the class(s) or item source even though replaced. Spells should still have the prepared status set as it was before the replacement
      Provide a Chatlog whisper to the GM grouped by the Actor of the Spells, and whether they were prepared/unprepared. GM can "right click" to share this chat log
*/
(async () => {
  if (!game.user.isGM) return ui.notifications.error("Only the GM can run this spell sync macro.");

  const spellPacks = game.packs.filter(
    (p) => (p.metadata.type === "Item" && p.index.some((i) => i.type === "spell")) || p.metadata.type === "spell"
  );
  if (spellPacks.length === 0) return ui.notifications.warn("No dedicated Spell compendiums found in this world.");

  let packOptionsHtml = "";
  for (let pack of spellPacks) {
    packOptionsHtml += `<option value="${pack.collection}">${pack.metadata.label} [${pack.collection}]</option>`;
  }

  new Dialog({
    title: "Select Master Spells Compendium",
    content: `
      <div class="form-group">
        <label style="display:block;margin-bottom:8px;">Choose the Item Compendium containing the master spell documents:</label>
        <select id="selected-pack" style="width:100%;height:28px;">${packOptionsHtml}</select>
      </div>
      <hr>
      <div class="form-group">
        <label style="margin-bottom:4px;display:block;"><strong>Sync Scope Options:</strong></label>
        <label style="display:flex;align-items:center;gap:8px;margin:4px 0;cursor:pointer;">
          <input type="radio" name="sync-scope" value="all" checked>
          <span>Sync <strong>ALL overlapping spells</strong></span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;margin:4px 0;cursor:pointer;">
          <input type="radio" name="sync-scope" value="prepared">
          <span>Sync <strong>ONLY prepared spells</strong> (Forces status to Prepared on match)</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;margin:4px 0;cursor:pointer;">
          <input type="radio" name="sync-scope" value="unprepared">
          <span>Sync <strong>ONLY unprepared spells</strong> (Forces status to Unprepared on match)</span>
        </label>
      </div>`,
    buttons: {
      next: {
        icon: '<i class="fas fa-arrow-right"></i>',
        label: "Next",
        callback: async (html) => {
          const packKey = html.find("#selected-pack").val();
          const pack = game.packs.get(packKey);
          const syncScope = html.find('input[name="sync-scope"]:checked').val();
          if (!pack) return ui.notifications.error("Invalid compendium selection.");
          await pack.getIndex();
          showActorChecklist(pack, syncScope);
        }
      },
      cancel: { icon: '<i class="fas fa-times"></i>', label: "Cancel" }
    },
    default: "next"
  }).render(true);

  async function showActorChecklist(pack, syncScope) {
    ui.notifications.info(`Scanning Actors Tab directory for spells listed in ${pack.metadata.label}...`);
    const compendiumSpellNames = pack.index.map((i) => i.name.toLowerCase());
    const validActors = [];

    for (let actor of game.actors) {
      const match = actor.items.some((item) => {
        if (item.type !== "spell" || !compendiumSpellNames.includes(item.name.toLowerCase())) return false;
        if (syncScope === "all") return true;

        const prep = item.system?.preparation;
        const modernPrep = item.system?.prepared;
        const isPrep =
          prep?.mode === "prepared" &&
          (prep?.prepared === true || prep?.prepared === 1 || prep?.prepared === 2 || modernPrep === 1 || modernPrep === 2);

        return syncScope === "prepared" ? isPrep : !isPrep;
      });
      if (match) validActors.push(actor);
    }

    validActors.sort((a, b) => a.name.localeCompare(b.name));
    if (validActors.length === 0) {
      return ui.notifications.warn(
        `No sheets in your Actors Tab currently possess matching spells from the "${pack.metadata.label}" compendium.`
      );
    }

    let listHtml = "";
    for (let actor of validActors) {
      listHtml += `
        <div class="form-group actor-row" style="margin:4px 0;" data-name="${actor.name.toLowerCase()}">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" name="actorId" value="${actor.id}">
            <img src="${actor.img}" width="24" height="24" style="border:none;border-radius:4px;object-fit:cover;">
            <span>${actor.name}</span>
          </label>
        </div>`;
    }

    const modeLabels = {
      all: "All Overlapping Spells",
      prepared: "Only Prepared Spells",
      unprepared: "Only Unprepared Spells"
    };

    const htmlContent = `
      <div style="display:flex;flex-direction:column;gap:10px;max-height:450px;">
        <p>Master Spell Pack: <strong>${pack.metadata.label}</strong></p>
        <p>Filter Mode: <strong>${modeLabels[syncScope]}</strong></p>
        <div style="display:flex;gap:5px;">
          <input type="text" id="sync-search" placeholder="Filter sidebar actors..." style="flex:1;padding:4px;">
          <button type="button" id="sync-select-all" style="width:auto;padding:0 10px;"><i class="fas fa-check-square"></i> All</button>
          <button type="button" id="sync-select-none" style="width:auto;padding:0 10px;"><i class="fas fa-square"></i> None</button>
        </div>
        <div id="sync-actor-list" style="overflow-y:auto;border:1px solid #7a7975;padding:8px;border-radius:4px;background:rgba(0,0,0,0.1);flex:1;">
          ${listHtml}
        </div>
      </div>`;

    new Dialog(
      {
        title: `Sync Spells from ${pack.metadata.label}`,
        content: htmlContent,
        buttons: {
          sync: {
            icon: '<i class="fas fa-magic"></i>',
            label: "Sync Spells",
            callback: async (html) => {
              const checkedBoxes = html.find('input[name="actorId"]:checked');
              if (checkedBoxes.length === 0) return ui.notifications.warn("No actors were selected.");

              ui.notifications.info("Fetching master spell definitions from data vault...");
              const fullCompendiumDocuments = await pack.getDocuments();
              let syncCount = 0;

              ui.notifications.info(`Updating spell references on ${checkedBoxes.length} actor(s)...`);
              for (let box of checkedBoxes) {
                const worldActor = game.actors.get(box.value);
                if (
                  worldActor &&
                  (await syncIndividualSpells(worldActor, fullCompendiumDocuments, syncScope, pack.metadata.label))
                ) {
                  syncCount++;
                }
              }
              ui.notifications.info(`Force sync complete. Overwrote modified spells on ${syncCount} actors.`);
            }
          },
          cancel: { icon: '<i class="fas fa-times"></i>', label: "Cancel" }
        },
        default: "sync",
        render: (html) => {
          html.find("#sync-search").on("input", (e) => {
            const q = e.target.value.toLowerCase();
            html.find(".actor-row").each((i, r) => ($(r).data("name").includes(q) ? $(r).show() : $(r).hide()));
          });
          html.find("#sync-select-all").on("click", () =>
            html.find('.actor-row:visible input[type="checkbox"]').prop("checked", true)
          );
          html.find("#sync-select-none").on("click", () =>
            html.find('.actor-row input[type="checkbox"]').prop("checked", false)
          );
        }
      },
      { height: 550, width: 400 }
    ).render(true);
  }

  async function syncIndividualSpells(worldActor, spellItems, syncScope, packLabel) {
    try {
      const compendiumNames = spellItems.map((item) => item.name.toLowerCase());
      const localMatches = worldActor.items.filter((item) => {
        if (item.type !== "spell" || !compendiumNames.includes(item.name.toLowerCase())) return false;
        if (syncScope === "all") return true;

        const prep = item.system?.preparation;
        const modernPrep = item.system?.prepared;
        const isPrep =
          prep?.mode === "prepared" &&
          (prep?.prepared === true || prep?.prepared === 1 || prep?.prepared === 2 || modernPrep === 1 || modernPrep === 2);

        return syncScope === "prepared" ? isPrep : !isPrep;
      });

      if (localMatches.length === 0) return true;

      const updates = [];
      const preparedNames = [];
      const unpreparedNames = [];

      for (let localSpell of localMatches) {
        const compendiumSpell = spellItems.find((item) => item.name.toLowerCase() === localSpell.name.toLowerCase());
        if (!compendiumSpell) continue;

        const compendiumData = compendiumSpell.toObject();

        // Preserve existing preparation values
        const localPrepMode = localSpell.system?.preparation?.mode ?? "prepared";
        let localPrepStatus = localSpell.system?.preparation?.prepared ?? 0;
        let modernPrepStatus = localSpell.system?.prepared ?? 0;

        if (syncScope === "prepared") {
          localPrepStatus = 1;
          modernPrepStatus = 1;
        } else if (syncScope === "unprepared") {
          localPrepStatus = 0;
          modernPrepStatus = 0;
        } else {
          const wasPrep =
            localPrepStatus === true ||
            localPrepStatus === 1 ||
            localPrepStatus === 2 ||
            modernPrepStatus === 1 ||
            modernPrepStatus === 2;
          localPrepStatus = wasPrep ? 1 : 0;
          modernPrepStatus = wasPrep ? 1 : 0;
        }

        // Preserve source class / item association assignment
        const existingSourceClass = localSpell.system?.sourceClass ?? "";

        // Build target system data merging system properties cleanly
        const updatedSystem = foundry.utils.deepClone(compendiumData.system);
        updatedSystem.sourceClass = existingSourceClass;
        if (!updatedSystem.preparation) updatedSystem.preparation = {};
        updatedSystem.preparation.mode = localPrepMode;
        updatedSystem.preparation.prepared = localPrepStatus === 1;
        updatedSystem.prepared = modernPrepStatus;

        updates.push({
          _id: localSpell.id,
          name: compendiumData.name,
          img: compendiumData.img,
          system: updatedSystem,
          effects: compendiumData.effects || []
        });

        if (modernPrepStatus === 1 || modernPrepStatus === 2) preparedNames.push(localSpell.name);
        else unpreparedNames.push(localSpell.name);
      }

      if (updates.length > 0) {
        await worldActor.updateEmbeddedDocuments("Item", updates);

        let listsHtml = `<div style="font-weight:bold;margin-bottom:4px;font-size:13px;border-bottom:1px solid #7a7975;padding-bottom:2px;">${worldActor.name}</div>`;
        if (preparedNames.length > 0) {
          listsHtml += `<p style="margin:2px 0 0 0;"><strong>[Prepared]</strong></p><ul style="margin:2px 0 6px 12px;padding:0;font-style:italic;color:#3a5f3a;">${preparedNames
            .map((s) => `<li>${s}</li>`)
            .join("")}</ul>`;
        }
        if (unpreparedNames.length > 0) {
          listsHtml += `<p style="margin:2px 0 0 0;"><strong>[Unprepared]</strong></p><ul style="margin:2px 0 6px 12px;padding:0;font-style:italic;color:#666;">${unpreparedNames
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
      return true;
    } catch (error) {
      console.error(`Macro Spell Sync | Failed updating spells for ${worldActor.name}:`, error);
      return false;
    }
  }
})();
