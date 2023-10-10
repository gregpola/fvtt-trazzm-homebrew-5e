const VERSION = "10.0.0";

export class SpellHandler {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering SpellHandler");
        SpellHandler.hooks();
    }

    static hooks() {
        Hooks.on("midi-qol.preAttackRoll", async workflow => {
            // check for Keening Mist and a Necromancy spell
            let keeningMist = game.settings.get("fvtt-trazzm-homebrew-5e", "keening-mist");
            if (keeningMist && workflow.item.system.school === "nec") {
                workflow.advantage = true;
            }
        });

        Hooks.on("midi-qol.AttackRollComplete", async workflow => {
            // sanity checks
            if (workflow.targets.size !== 1) return;
            if (workflow.isFumble === true) return;

            let targetToken = workflow.targets.first();
            if (!targetToken) return;
            let targetActor = targetToken.actor;
            if (!targetActor) return;

            // Mirror Image Handling
            let targetEffect = targetActor.effects.find(eff => eff.name === 'Mirror Image');
            if (targetEffect) {
                let duplicates = getProperty(targetActor, "flags.world.spell.mirrorimage");
                if (duplicates) {
                    let roll = await new Roll('1d20').roll({async: true});
                    roll.toMessage({
                        rollMode: 'roll',
                        speaker: {alias: name},
                        flavor: 'Mirror Image'
                    });

                    let rollTotal = roll.total;
                    let rollNeeded;
                    switch (duplicates) {
                        case 3:
                            rollNeeded = 6;
                            break;
                        case 2:
                            rollNeeded = 8;
                            break;
                        case 1:
                            rollNeeded = 11;
                            break;
                    }

                    if (rollTotal >= rollNeeded) {
                        workflow.isFumble = true;
                        let duplicateAC = 10 + targetActor.system.abilities.dex.mod;
                        if (workflow.attackTotal >= duplicateAC) {
                            ChatMessage.create({
                                speaker: {alias: name},
                                content: 'Attack hits a duplicate and destroys it.'
                            });

                            if (duplicates === 1) {
                                await MidiQOL.socket().executeAsGM('removeEffects', {
                                    actorUuid: targetActor.uuid,
                                    effects: [targetEffect.id]
                                });
                            } else {
                                let updates = {
                                    '_id': targetEffect.id,
                                    'changes': [
                                        {
                                            'key': 'macro.tokenMagic',
                                            'mode': 0,
                                            'value': 'images',
                                            'priority': 20
                                        },
                                        {
                                            'key': 'flags.world.spell.mirrorimage',
                                            'mode': 5,
                                            'value': duplicates - 1,
                                            'priority': 20
                                        }
                                    ]
                                };
                                await MidiQOL.socket().executeAsGM('updateEffects', {
                                    'actorUuid': targetToken.actor.uuid,
                                    'updates': [updates]
                                });
                            }
                        } else {
                            ChatMessage.create({
                                speaker: {alias: name},
                                content: 'Attack targeted a duplicate and missed.'
                            });
                        }
                    }
                }
            }
        });

        Hooks.on("midi-qol.RollComplete", async workflow => {
        });
    }
}
