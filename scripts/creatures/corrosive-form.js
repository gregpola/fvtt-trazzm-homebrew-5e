/*
	A creature that touches the pudding or hits it with a melee attack while within 5 feet of it takes 4 (1d8) acid
	damage. Any non-magical weapon made of metal or wood that hits the pudding corrodes. After dealing damage, the weapon
	takes a permanent and cumulative −1 penalty to damage rolls. If its penalty drops to −5, the weapon is destroyed.
*/
const version = "12.3.0";
const optionName = "Corrosive Form";
const corrodingName = "Corroding Weapon";

try {
    if (args[0].macroPass === "isDamaged") {
        if (["mwak", "msak"].includes(workflow.item.system.actionType)) {
            const attackingActor = workflow.token.actor;
            if (attackingActor && MidiQOL.getDistance(token, workflow.token) <= 5) {
                const damageRoll = await new Roll("1d8").roll({async: true});
                await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "acid", [workflow.token], damageRoll, {itemCardId: "new", itemData: actor.items.getName(optionName)});

                // get the attacking weapon
                if (workflow.item.type === `weapon` && !workflow.item.system.properties.has('mgc')) {
                    let effect = workflow.item.effects.find(e => e.name === corrodingName);
                    if (effect) {
                        let updatedChanges = deepClone(effect.changes);
                        let newValue = Number(updatedChanges[0].value);
                        updatedChanges[0].value = newValue - 1;
                        await effect.update({changes: updatedChanges});

                        // check for destruction
                        if (newValue <= -4) {
                            ChatMessage.create({
                                content: `${attackingActor.name}'s ${workflow.item.name} is destroyed`,
                                speaker: ChatMessage.getSpeaker({actor: attackingActor})
                            });
                            await attackingActor.deleteEmbeddedDocuments('Item', [workflow.item.id]);
                        }
                    }
                    else {
                        let effectData = {
                            name: corrodingName,
                            icon: item.img,
                            origin: item.uuid,
                            changes: [
                                {
                                    key: `system.bonuses.mwak.damage`,
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -1,
                                    priority: 20
                                }
                            ],
                            disabled: false
                        };

                        await workflow.item.createEmbeddedDocuments("ActiveEffect", [effectData]);

                        ChatMessage.create({
                            content: `${attackingActor.name}'s ${workflow.item.name} begins to corrode`,
                            speaker: ChatMessage.getSpeaker({actor: attackingActor})
                        });
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
