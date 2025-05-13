const version = "10.0.8";
try {
    let target = await fromUuid(args[0].hitTargetUuids[0] ?? "");
    let undead = ["undead", "fiend"].some(type => (target?.actor.system.details.type?.value || "").toLowerCase().includes(type));
    if (!undead) return;
    if (undead) numDice = 1;
    // Apparently improved divine smite should not be added to the divine smite. Uncomment these lines if you want it to be included
    // if (improvedDivineSmite) numDice += 1;
    // let improvedDivineSmite = args[0].actor.items.find(i=> i.name ==="Improved Divine Smite");
    let damageRoll = await new CONFIG.Dice.DamageRoll(`${numDice}d8`, {}, {type: "radiant", isCritical: workflow.damageRolls[0].isCritical, flavor: "Undead Target"}).roll();
    return damageRoll;
} catch (err) {
    console.error(`${args[0].itemData.name} - Divine Smite ${version}`, err);
}
