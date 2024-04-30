/*
    If the warhammer is equipped, when you cast a healing spell (such as cure wounds), the mace gains a charge. The
    warhammer holds up to 3 charges. While holding the warhammer you can expend 3 charges to cast Mass Cure Wounds,
    2 charges to cast Prayer of Healing, or 1 charge to cast Cure Wounds.
*/
const version = "11.0";
const optionName = "Healers Warhammer";
const maxCharges = 3;
const _flagGroup = "magicitems";

try {
    if (args[0].macroPass === "postDamageRoll") {
        // Must be an spell
        if (["spell"].includes(workflow.item.type)) {
            // make sure it hit
            if (workflow.hitTargets.size > 0) {
                // make sure it's a healing spell
                if (workflow.item.system.actionType === "heal") {
                    // make sure it's not from a magic item (so the hammers spells don't cause it to recharge)
                    if (workflow.item.system.preparation.mode !== "magicitems") {
                        let currentCharges = item.flags[_flagGroup].uses ?? 0;

                        if (currentCharges < maxCharges) {
                            currentCharges++;
                            const updatedFlags = mergeObject(item.flags, {magicitems: {uses: currentCharges}});
                            await item.update({'flags': updatedFlags});
                        }
                    }
                    else {
                        console.log(`${optionName} - recharge not allowed from the items spells`);
                    }
                }
                else {
                    console.log(`${optionName} - not a healing spell`);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
