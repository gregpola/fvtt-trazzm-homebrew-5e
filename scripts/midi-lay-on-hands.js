const version = "0.9.52";
try {
    if (args[0].macroPass === "preItemRoll") {
      const theTarget = args[0].targets[0];
      if (!theTarget) return false;
    
      // does not work on undead/constructs
      let invalid = ["undead", "construct"].some(type => (theTarget?.actor.data.data.details.type?.value || "").toLowerCase().includes(type));
      if (invalid) {
          ui.notifications.warn("Lay on Hands can't affect undead/constructs")
          return false;
      }
      let consumeTarget = args[0].itemData.data.consume.target;
      if (!consumeTarget || consumeTarget === "") consumeTarget = 'resources.primary.value'; 
      const available = getProperty(actor.data.data, consumeTarget);
      // Have we got any left?
      if (available <= 0) return false;
    
      // prompt for how much to use...
      let d = new Promise((resolve, reject) => {
        let theDialog = new Dialog({
          title: "Lay on Hands",
          content: `How many points to use? ${available} available<input id="mqlohpoints" type="number" min="0" step="1.0" max="${available}"></input>`,
          buttons: {
            heal: {
              label: "Heal",
              callback: (html) => { resolve(Math.clamped(Math.floor(Number(html.find('#mqlohpoints')[0].value)), 0, available)); }
            },
            cureDiseasePoison: {
              label: "Disease/Poison",
              callback: (html) => { resolve(-Math.clamped(Math.floor(Number(html.find('#mqlohpoints')[0].value) / 5) * 5, 0, available)); }
            },
            abort: {
              icon: '<i class="fas fa-cross"></i>',
              label: "Quit",
              callback: () => { resolve(false) }
            },
          },
          default: "heal",
        }).render(true);
      });
      const consumed = await d;
      if (!consumed) return false;
      const workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
      const theItem = workflow.item;
      let updates;
      if (consumed > 0) {
        updates = {
          "data.consume.amount": Math.abs(consumed),
          "data.damage.parts": [[`${Math.max(0, consumed)}`, "healing"]],
          "data.chatFlavor": "",
          "data.consume.target": consumeTarget
        };
      } else {
        updates = {
          "data.consume.amount": Math.abs(consumed),
          "data.damage.parts": [],
          "data.chatFlavor": `<h3>Remove up to ${Math.floor(Math.abs(consumed) / 5)} poisons/diseases</h3>`,
          "data.consume.target": consumeTarget
        };
      }
      setProperty(workflow, "workflowOptions.autoConsumeResource", true);
      return theItem.update(updates);
    }
    return true;
} catch (err)  {
    console.error(`${args[0].itemData.name} - Lay on Hands ${version}`, err);
}
