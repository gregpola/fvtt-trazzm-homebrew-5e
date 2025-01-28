/*
    You are blessed with divine might in battle. When a creature takes damage from one of your cantrips or weapon attacks,
    you can also deal 1d8 radiant damage to that creature. Once you deal this damage, you can’t use this feature again
    until the start of your next turn.
*/
const version = "12.3.0";
const optionName = "Blessed Strikes";
const timeFlag = "blessed-strikes-time";

try {
    if ((args[0].macroPass === "DamageBonus") && (workflow.hitTargets.size > 0)) {
        // check for valid action type
        if (!["mwak", "rwak", "msak", "rsak", "save"].includes(workflow.item.system.actionType)) {
            console.log(`${optionName}: not an eligible action (${workflow.item.system.actionType})`);
            return {};
        }

        // If a spell attack, make sure it is a cantrip
        if (["msak", "rsak", "save"].includes(workflow.item.system.actionType) && (!workflow.castData || (workflow.castData.castLevel > 0))) {
            console.log(`${optionName}: not a cantrip`);
            return {};
        }

        // Check for availability i.e. once per actors turn
        if (!game.combat || !HomebrewHelpers.isAvailableThisTurn(actor, timeFlag)) {
            console.log(`${optionName}: is not available for this action`);
            return {};
        }

        // ask if they want to use the option
        const proceed = await foundry.applications.api.DialogV2.confirm({
            window: {
                title: `${optionName}`,
            },
            content: `<p>Apply ${optionName} to this attack?</p><sub>Once per turn, when you damage a target with a weapon or cantrip, you can add 1d8 radiant damage.</sub>`,
            rejectClose: false,
            modal: true
        });

        if (proceed) {
            await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);

            const targetIterator = workflow.hitTargets.values();
            for (const targetToken of targetIterator) {
                await anime(targetToken);
            }

            // add damage bonus
            const diceMult = workflow.isCritical ? 2: 1;
            return {damageRoll: `${diceMult}d8[radiant]`, flavor: optionName};
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(target) {
    new Sequence()
        .effect()
        .file("jb2a.divine_smite.target.blueyellow")
        .atLocation(target)
        .scaleToObject(2)
        .play();
}
