/*
    If damage reduces the undead to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage
    taken, unless the damage is radiant or from a critical hit. On a success, the undead drops to 1 hit point instead.
*/
const version = "13.5.0";
const optionName = "Undead Fortitude";

try {
    if (args[0].macroPass === "isDamaged") {
        // skip for critical
        if (workflow.damageItem.critical) {
            console.log(`${optionName}: ${version} - skipping for critical`);
            return;
        }

        if (workflow.damageDetail) {
            // look for radiant damage
            const radiantRolls = workflow.damageDetail.filter(i => ['radiant'].includes(i.type));
            if (radiantRolls && radiantRolls.length > 1) {
                console.log(`${optionName}: ${version} - skipping for radiant damage`);
                return;
            }

            // check for reduction to 0 hp
            if (workflow.damageItem.newHP === 0) {
                // roll the con save
                const saveDC = 5 + workflow.damageItem.totalDamage;
                const saveResult = await actor.rollSavingThrow(
                    {
                        ability: "con",
                        target: saveDC
                    },
                    {
                        fastForward: true,
                        options: {
                            window: {
                                title: `${optionName} (CON Save DC ${saveDC})`,
                            }
                        }
                    },
                    {
                    });

                if (saveResult[0].isSuccess) {
                    ChatMessage.create({
                        content: `${actor.name} shrugs off the death blow to keep fighting!`,
                        speaker: ChatMessage.getSpeaker({ actor: actor })});
                    const damageRoll = await new Roll('1').evaluate();
                    await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "healing", [token], damageRoll, {flavor: optionName});
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
