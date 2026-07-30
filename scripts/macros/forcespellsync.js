(async () => {
  if (!game.user.isGM) {
    return ui.notifications.error("Only the GM can run this spell sync macro.");
  }

  // 1. Gather all available Item compendiums (Spells are items in Foundry)
  const itemPacks = game.packs.filter(p => p.metadata.type === "Item");
  if (itemPacks.length === 0) {
    return ui.notifications.warn("No Item/Spell compendiums found in this world.");
  }

  // Build the compendium dropdown selection HTML
  let packOptionsHtml = "";
  for (let pack of itemPacks) {
    packOptionsHtml += `<option value="${pack.collection}">${pack.metadata.label} [${pack.collection}]</option>`;
  }

  // Step 1: Dialog to choose which Spell Compendium to check against
  new Dialog({
    title: "Select Master Spells Compendium",
    content: `
      <div class="form-group">
        <label style="display:block; margin-bottom: 8px;">Choose the Item Compendium containing the master spell documents:</label>
        <select id="selected-pack" style="width: 100%; height: 28px;">
          ${packOptionsHtml}
        </select>
      </div>
      <hr>
    `,
    buttons: {
      next: {
        icon: '<i class="fas fa-arrow-right"></i>',
        label: "Next",
        callback: async (html) => {
          const packKey = html.find('#selected-pack').val();
          const pack = game.packs.get(packKey);
          if (!pack) return ui.notifications.error("Invalid compendium selection.");
          
          await pack.getIndex();
          showActorChecklist(pack);
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel"
      }
    },
    default: "next"
  }).render(true);

  // Step 2: Show the checklist of actors from the Actors Tab directory
  async function showActorChecklist(pack) {
    ui.notifications.info(`Scanning Actors Tab directory for spells listed in ${pack.metadata.label}...`);

    const compendiumSpellNames = pack.index.map(i => i.name.toLowerCase());
    const validActors = [];

    // Explicitly scan only the Actors tab directory
    for (let actor of game.actors) {
      const hasMatchingSpell = actor.items.some(item => 
        item.type === "spell" && compendiumSpellNames.includes(item.name.toLowerCase())
      );
      if (hasMatchingSpell) validActors.push(actor);
    }

    validActors.sort((a, b) => a.name.localeCompare(b.name));

    if (validActors.length === 0) {
      return ui.notifications.warn(`No sheets in your Actors Tab currently possess spells from the "${pack.metadata.label}" compendium.`);
    }

    let listHtml = "";
    for (let actor of validActors) {
      listHtml += `
        <div class="form-group actor-row" style="margin: 4px 0;" data-name="${actor.name.toLowerCase()}">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="actorId" value="${actor.id}">
            <img src="${actor.img}" width="24" height="24" style="border: none; border-radius: 4px; object-fit: cover;">
            <span>${actor.name}</span>
          </label>
        </div>
      `;
    }

    const htmlContent = `
      <div style="display: flex; flex-direction: column; gap: 10px; max-height: 450px;">
        <p>Master Spell Pack: <strong>${pack.metadata.label}</strong></p>
        <p>Select which sidebar actors should have their overlapping spells updated to match the master compendium copies:</p>
        
        <div style="display: flex; gap: 5px;">
          <input type="text" id="sync-search" placeholder="Filter sidebar actors..." style="flex: 1; padding: 4px;">
          <button type="button" id="sync-select-all" style="width: auto; padding: 0 10px;"><i class="fas fa-check-square"></i> All</button>
          <button type="button" id="sync-select-none" style="width: auto; padding: 0 10px;"><i class="fas fa-square"></i> None</button>
        </div>

        <div id="sync-actor-list" style="overflow-y: auto; border: 1px solid #7a7975; padding: 8px; border-radius: 4px; background: rgba(0,0,0,0.1); flex: 1;">
          ${listHtml}
        </div>
      </div>
    `;

    new Dialog({
      title: `Sync Spells from ${pack.metadata.label}`,
      content: htmlContent,
      buttons: {
        sync: {
          icon: '<i class="fas fa-magic"></i>',
          label: "Sync Spells",
          callback: async (html) => {
            const checkedBoxes = html.find('input[name="actorId"]:checked');
            if (checkedBoxes.length === 0) {
              return ui.notifications.warn("No actors were selected.");
            }

            ui.notifications.info("Fetching master spell definitions from data vault...");
            const fullCompendiumDocuments = await pack.getDocuments();

            let syncCount = 0;
            const resultsLog = [];
            ui.notifications.info(`Updating spell references on ${checkedBoxes.length} actor(s)...`);

            for (let box of checkedBoxes) {
              const worldActor = game.actors.get(box.value);
              if (worldActor) {
                const success = await syncIndividualSpells(worldActor, fullCompendiumDocuments, resultsLog);
                if (success) syncCount++;
              }
            }

            await sendSyncChatReport(pack.metadata.label, resultsLog);
            ui.notifications.info(`Force sync complete. Overwrote modified spells on ${syncCount} actors. Detailed report sent to chat.`);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        }
      },
      default: "sync",
      render: (html) => {
        html.find('#sync-search').on('input', (event) => {
          const query = event.target.value.toLowerCase();
          html.find('.actor-row').each((idx, row) => {
            const name = $(row).data('name');
            if (name.includes(query)) {
              $(row).show();
            } else {
              $(row).hide();
            }
          });
        });

        html.find('#sync-select-all').on('click', () => {
          html.find('.actor-row:visible input[type="checkbox"]').prop('checked', true);
        });

        html.find('#sync-select-none').on('click', () => {
          html.find('.actor-row input[type="checkbox"]').prop('checked', false);
        });
      }
    }, { height: 550, width: 400 }).render(true);
  }

  // Isolated spell synchronizer function
  async function syncIndividualSpells(worldActor, spellItems, resultsLog) {
    try {
      const targetSpellNames = spellItems.map(item => item.name.toLowerCase());

      const localMatches = worldActor.items.filter(item => 
        item.type === "spell" && targetSpellNames.includes(item.name.toLowerCase())
      );
      
      if (localMatches.length === 0) {
        resultsLog.push({
          actorName: worldActor.name,
          status: "Skipped",
          spells: ["No matching spells found on sheet."]
        });
        return true;
      }

      const localMatchIds = localMatches.map(item => item.id);
      const spellNamesUpdated = localMatches.map(item => item.name);

      const filteredSourceData = spellItems
        .filter(item => localMatches.some(local => local.name.toLowerCase() === item.name.toLowerCase()))
        .map(item => item.toObject());

      await worldActor.deleteEmbeddedDocuments("Item", localMatchIds);

      if (filteredSourceData.length > 0) {
        await worldActor.createEmbeddedDocuments("Item", filteredSourceData);
      }

      resultsLog.push({
        actorName: worldActor.name,
        status: "Synced Successfully",
        spells: spellNamesUpdated
      });

      return true;
    } catch (error) {
      console.error(`Macro Spell Sync | Failed updating spells for ${worldActor.name}:`, error);
      resultsLog.push({
        actorName: worldActor.name,
        status: "Error/Failed",
        spells: [`Internal database block: ${error.message}`]
      });
      return false;
    }
  }

  // Generates the secret GM whisper chat card report
  async function sendSyncChatReport(packLabel, resultsLog) {
    let reportHtml = `
      <div class="dice-roll compendium-sync-report">
        <div class="dice-flavor" style="padding: 6px; font-weight: bold; background: #222; color: #fff; border-radius: 4px 4px 0 0;">
          <i class="fas fa-magic"></i> Spell Sync Report (Macro Run)
        </div>
        <div style="padding: 8px; font-size: 12px; background: rgba(0,0,0,0.05); border: 1px solid #bbb; border-top: none;">
          <p style="margin: 0 0 8px 0;"><strong>Source Pack:</strong> ${packLabel}</p>
          <hr style="margin: 6px 0;">
    `;

    for (let log of resultsLog) {
      let color = log.status === "Synced Successfully" ? "#1e601e" : (log.status === "Skipped" ? "#555" : "#8b0000");
      reportHtml += `
        <div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px dashed #ccc;">
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>${log.actorName}</span>
            <span style="color: ${color}; font-size: 11px;">[${log.status}]</span>
          </div>
          <ul style="margin: 4px 0 0 12px; padding: 0; font-style: italic; color: #444;">
            ${log.spells.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    reportHtml += `</div></div>`;

    await ChatMessage.create({
      user: game.user.id,
      speaker: { alias: "Sync Engine" },
      content: reportHtml,
      whisper: [game.user.id]
    });
  }
})();
