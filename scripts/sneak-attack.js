const version = "0.9.52"
try {
    if (!["mwak","rwak"].includes(args[0].itemData.data.actionType)) return {}; // weapon attack
    if (args[0].itemData.data.actionType === "mwak" && !args[0].itemData.data.properties?.fin) 
      return {}; // ranged or finesse
    if (args[0].hitTargets.length < 1) return {};
    token = canvas.tokens.get(args[0].tokenId);
    actor = token.actor;
    if (!actor || !token || args[0].hitTargets.length < 1) return {};
    const rogueLevels = actor.getRollData().classes.rogue?.levels;
    if (!rogueLevels) {
      MidiQOL.warn("Sneak Attack Damage: Trying to do sneak attack and not a rogue");
      return {}; // rogue only
    }
    let target = canvas.tokens.get(args[0].hitTargets[0].id ?? args[0].hitTargers[0]._id);
    if (!target) MidiQOL.error("Sneak attack macro failed");
    
    if (game.combat) {
      const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
      const lastTime = actor.getFlag("midi-qol", "sneakAttackTime");
      if (combatTime === lastTime) {
       MidiQOL.warn("Sneak Attack Damage: Already done a sneak attack this turn");
       return {};
      }
    }
    let foundEnemy = true;
    let isSneak = args[0].advantage;
    
    if (!isSneak) {
      foundEnemy = false;
      let nearbyEnemy = canvas.tokens.placeables.filter(t => {
        let nearby = (t.actor &&
             t.actor?.id !== args[0].actor._id && // not me
             t.id !== target.id && // not the target
             t.actor?.data.data.attributes?.hp?.value > 0 && // not incapacitated
             t.data.disposition !== target.data.disposition && // not an ally
             MidiQOL.getDistance(t, target, false) <= 5 // close to the target
         );
        foundEnemy = foundEnemy || (nearby && t.data.disposition === -target.data.disposition)
        return nearby;
      });
      isSneak = nearbyEnemy.length > 0;
    }
    if (!isSneak) {
      MidiQOL.warn("Sneak Attack Damage: No advantage/ally next to target");
      return {};
    }
    let useSneak = getProperty(actor.data, "flags.dae.autoSneak");
    if (!useSneak) {
        let dialog = new Promise((resolve, reject) => {
          new Dialog({
          // localize this text
          title: "Conditional Damage",
          content: `<p>Use Sneak attack?</p>`+(!foundEnemy ? "<p>Only Nuetral creatures nearby</p>" : ""),
          buttons: {
              one: {
                  icon: '<i class="fas fa-check"></i>',
                  label: "Confirm",
                  callback: () => resolve(true)
              },
              two: {
                  icon: '<i class="fas fa-times"></i>',
                  label: "Cancel",
                  callback: () => {resolve(false)}
              }
          },
          default: "two"
          }).render(true);
        });
        useSneak = await dialog;
    }
    if (!useSneak) return {}
    const diceMult = args[0].isCritical ? 2: 1;
    const baseDice = Math.ceil(rogueLevels/2);
    if (game.combat) {
      const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
      const lastTime = actor.getFlag("midi-qol", "sneakAttackTime");
      if (combatTime !== lastTime) {
         await actor.setFlag("midi-qol", "sneakAttackTime", combatTime)
      }
    }
    // How to check that we've already done one this turn?
    return {damageRoll: `${baseDice * diceMult}d6`, flavor: "Sneak Attack"};
} catch (err) {
    console.error(`${args[0].itemData.name} - Sneak Attack ${version}`, err);
}