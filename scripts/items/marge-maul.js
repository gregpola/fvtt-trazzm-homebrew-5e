const version = "11.1";
const optionName = "Marge's Maul";

try {
    if (args[0].macroPass === "postActiveEffects") {
        if (workflow.hitTargets.size > 0 && workflow.isCritical) {
            let healRoll = await new Roll('1d8').roll();
            await game.dice3d?.showForRoll(healRoll);

            await ChatMessage.create({content: "Marge's Maul - critical healing"});
            await MidiQOL.applyTokenDamage( [{type: 'healing', damage: healRoll.total}], healRoll.total, new Set([token]), item, new Set(), {forceApply: false});
        }
    }
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}