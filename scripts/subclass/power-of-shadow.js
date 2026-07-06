/*
	If you would drop to 0 Hit Points and not die outright, you can make a Charisma saving throw (DC 5 plus the damage
	taken). On a successful save, your Hit Points instead change to a number equal to your Charisma modifier plus your
	Sorcerer level. After you succeed on this save, you can’t use this benefit again until you finish a Long Rest.
*/
const optionName = "Strength of the Grave";
const version = "14.5.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isDamaged") {
        if (!actor.statuses.has("dead") && workflow.damageDetail) {
            // check for reduction to 0 hp
            if (workflow.damageItem.newHP === 0) {
                // roll the save
                const saveDC = 5 + workflow.damageItem.totalDamage;
                const saveResult = await actor.rollSavingThrow(
                    {
                        ability: "cha",
                        target: saveDC
                    },
                    {
                        fastForward: true,
                        options: {
                            window: {
                                title: `${optionName} DC ${saveDC}`,
                            }
                        }
                    },
                    {
                    });

                if (saveResult[0].isSuccess) {
                    ChatMessage.create({
                        content: `${actor.name} can't be killed so easily!`,
                        speaker: ChatMessage.getSpeaker({ actor: actor })});
                    const damageRoll = await new Roll(`${actor.system.abilities.cha.mod} + ${actor.system.classes.sorcerer.levels}`).evaluate();
                    await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "healing", [token], damageRoll, {flavor: optionName});
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
