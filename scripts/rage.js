const version = "0.9.52";
try {
    const levels = args[0].rollData.classes?.barbarian?.levels ?? 0;
    if (!levels) return {};
    if (!args[0].item) return {};
    const tactor = canvas.tokens.get(args[0].tokenId).actor;
    const titem = tactor.items.get(args[0].item._id);
    const rollMod = titem.abilityMod;
    if (rollMod !== "str") return {};
    const bonus = levels < 9 ? "2" : (levels < 16 ? "3" : "4");
    return {damageRoll: bonus, flavor: "Rage Damage"};
} catch (err)  {
    console.error(`${args[0].itemData.name} - Rage ${version}`, err);
}