/*
    You are blessed with divine might in battle. When a creature takes damage from one of your cantrips or weapon attacks,
    you can also deal 1d8 radiant damage to that creature. Once you deal this damage, you can’t use this feature again
    until the start of your next turn.
*/
const version = "11.0";
const optionName = "Blessed Strikes";
const timeFlag = "blessed-strikes-time";

try {
    if ((args[0].macroPass === "DamageBonus") && (workflow.hitTargets.size > 0)) {
        // check for valid action type
        if (!["mwak", "rwak", "msak", "rsak"].includes(workflow.item.system.actionType)) {
            console.log(`${optionName}: not an eligible action (${workflow.item.system.actionType})`);
            return {};
        }

        // If a spell attack, make sure it is a cantrip
        const spellLevel = workflow.castData.castLevel;
        if (["msak", "rsak"].includes(workflow.item.system.actionType) && (spellLevel > 0)) {
            console.log(`${optionName}: not a cantrip`);
            return {};
        }

        // Check for availability i.e. once per actors turn
        if (!game.combat || !HomebrewHelpers.isAvailableThisTurn(actor, timeFlag)) {
            console.log(`${optionName}: is not available for this action`);
            return {};
        }

        // ask if they want to use the option
        let dialog = new Promise((resolve, reject) => {
            new Dialog({
                // localize this text
                title: `${optionName}`,
                content: `<p>Apply ${optionName} to this attack?</p><p>Once per turn, when you damage a target with a weapon or cantrip, you can add 1d8 radiant damage.</p>`,
                buttons: {
                    one: {
                        icon: '<p> </p><img src = "icons/magic/light/beams-rays-orange-purple-small.webp" width="50" height="50"></>',
                        label: "<p>Yes</p>",
                        callback: () => resolve(true)
                    },
                    two: {
                        icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
                        label: "<p>No</p>",
                        callback: () => { resolve(false) }
                    }
                },
                default: "two"
            }).render(true);
        });

        let useFeature = await dialog;
        if (useFeature) {
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
        .file("jb2a.divine_smite.target.yellowwhite")
        .atLocation(target)
        .scaleToObject(2)
        .play();
}