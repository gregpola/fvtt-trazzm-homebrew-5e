import Constants from './t5e-constants.js';

const _aberrantAnatomyName = "Aberrant Anatomy";
const _echoingSoulName = "Echoing Soul";
const _gatheredWhispersName = "Gathered Whispers";
const _livingShadowName = "Living Shadow";
const _symbioticBeingName = "Symbiotic Being";
const _watchersName = "Watchers";

export class DarkGiftsHandler {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering DarkGiftsHandler");
        DarkGiftsHandler.hooks();
    }

    static hooks() {

        Hooks.on("midi-qol.AttackRollComplete", async (workflow) => {
            if (workflow.attackRoll.d20.total === 1) {
                const aberrantAnatomy = workflow.actor.items.getName(_aberrantAnatomyName);
                const echoingSoul = workflow.actor.items.getName(_echoingSoulName);
                const gatheredWhispers = workflow.actor.items.getName(_gatheredWhispersName);
                const livingShadow = workflow.actor.items.getName(_livingShadowName);
                const symbioticBeing = workflow.actor.items.getName(_symbioticBeingName);
                const watchers = workflow.actor.items.getName(_watchersName);

                if (aberrantAnatomy) {
                    let activity = await aberrantAnatomy.system.activities.find(a => a.identifier === 'warping-flesh');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (echoingSoul) {
                    let activity = await echoingSoul.system.activities.find(a => a.identifier === 'intrusive-echoes');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (gatheredWhispers) {
                    let activity = await gatheredWhispers.system.activities.find(a => a.identifier === 'voices-from-beyond');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (livingShadow) {
                    let activity = await gatheredWhispers.system.activities.find(a => a.identifier === 'ominous-will');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (symbioticBeing) {
                    let activity = await symbioticBeing.system.activities.find(a => a.identifier === 'symbiotic-agenda');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (watchers) {
                    let activity = await watchers.system.activities.find(a => a.identifier === 'incessant-watchers');
                    if (activity) {
                        await activity.use();
                    }
                }
            }
        });

        Hooks.on("dnd5e.rollAbilityCheck", async (rolls, data) => {
            if (rolls[0].d20.total === 1) {
                const aberrantAnatomy = workflow.actor.items.getName(_aberrantAnatomyName);
                const echoingSoul = workflow.actor.items.getName(_echoingSoulName);
                const gatheredWhispers = workflow.actor.items.getName(_gatheredWhispersName);
                const livingShadow = workflow.actor.items.getName(_livingShadowName);
                const symbioticBeing = workflow.actor.items.getName(_symbioticBeingName);
                const watchers = workflow.actor.items.getName(_watchersName);

                if (aberrantAnatomy) {
                    let activity = await aberrantAnatomy.system.activities.find(a => a.identifier === 'warping-flesh');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (echoingSoul) {
                    let activity = await echoingSoul.system.activities.find(a => a.identifier === 'intrusive-echoes');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (gatheredWhispers) {
                    let activity = await gatheredWhispers.system.activities.find(a => a.identifier === 'voices-from-beyond');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (livingShadow) {
                    let activity = await gatheredWhispers.system.activities.find(a => a.identifier === 'ominous-will');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (symbioticBeing) {
                    let activity = await symbioticBeing.system.activities.find(a => a.identifier === 'symbiotic-agenda');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (watchers) {
                    let activity = await watchers.system.activities.find(a => a.identifier === 'incessant-watchers');
                    if (activity) {
                        await activity.use();
                    }
                }

            }
        });

        Hooks.on("dnd5e.rollSkill", async (rolls, data) => {
            if (rolls[0].d20.total === 1) {
                const aberrantAnatomy = workflow.actor.items.getName(_aberrantAnatomyName);
                const echoingSoul = workflow.actor.items.getName(_echoingSoulName);
                const gatheredWhispers = workflow.actor.items.getName(_gatheredWhispersName);
                const livingShadow = workflow.actor.items.getName(_livingShadowName);
                const symbioticBeing = workflow.actor.items.getName(_symbioticBeingName);
                const watchers = workflow.actor.items.getName(_watchersName);

                if (aberrantAnatomy) {
                    let activity = await aberrantAnatomy.system.activities.find(a => a.identifier === 'warping-flesh');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (echoingSoul) {
                    let activity = await echoingSoul.system.activities.find(a => a.identifier === 'intrusive-echoes');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (gatheredWhispers) {
                    let activity = await gatheredWhispers.system.activities.find(a => a.identifier === 'voices-from-beyond');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (livingShadow) {
                    let activity = await gatheredWhispers.system.activities.find(a => a.identifier === 'ominous-will');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (symbioticBeing) {
                    let activity = await symbioticBeing.system.activities.find(a => a.identifier === 'symbiotic-agenda');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (watchers) {
                    let activity = await watchers.system.activities.find(a => a.identifier === 'incessant-watchers');
                    if (activity) {
                        await activity.use();
                    }
                }

            }
        });

        Hooks.on("dnd5e.rollToolCheck", async (rolls, data) => {
            if (rolls[0].d20.total === 1) {
                const aberrantAnatomy = workflow.actor.items.getName(_aberrantAnatomyName);
                const echoingSoul = workflow.actor.items.getName(_echoingSoulName);
                const gatheredWhispers = workflow.actor.items.getName(_gatheredWhispersName);
                const livingShadow = workflow.actor.items.getName(_livingShadowName);
                const symbioticBeing = workflow.actor.items.getName(_symbioticBeingName);
                const watchers = workflow.actor.items.getName(_watchersName);

                if (aberrantAnatomy) {
                    let activity = await aberrantAnatomy.system.activities.find(a => a.identifier === 'warping-flesh');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (echoingSoul) {
                    let activity = await echoingSoul.system.activities.find(a => a.identifier === 'intrusive-echoes');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (gatheredWhispers) {
                    let activity = await gatheredWhispers.system.activities.find(a => a.identifier === 'voices-from-beyond');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (livingShadow) {
                    let activity = await gatheredWhispers.system.activities.find(a => a.identifier === 'ominous-will');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (symbioticBeing) {
                    let activity = await symbioticBeing.system.activities.find(a => a.identifier === 'symbiotic-agenda');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (watchers) {
                    let activity = await watchers.system.activities.find(a => a.identifier === 'incessant-watchers');
                    if (activity) {
                        await activity.use();
                    }
                }

            }
        });

        Hooks.on("dnd5e.rollSavingThrow", async (rolls, data) => {
            if (rolls[0].d20.total === 1) {
                const aberrantAnatomy = workflow.actor.items.getName(_aberrantAnatomyName);
                const echoingSoul = workflow.actor.items.getName(_echoingSoulName);
                const gatheredWhispers = workflow.actor.items.getName(_gatheredWhispersName);
                const livingShadow = workflow.actor.items.getName(_livingShadowName);
                const symbioticBeing = workflow.actor.items.getName(_symbioticBeingName);
                const watchers = workflow.actor.items.getName(_watchersName);

                if (aberrantAnatomy) {
                    let activity = await aberrantAnatomy.system.activities.find(a => a.identifier === 'warping-flesh');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (echoingSoul) {
                    let activity = await echoingSoul.system.activities.find(a => a.identifier === 'intrusive-echoes');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (gatheredWhispers) {
                    let activity = await gatheredWhispers.system.activities.find(a => a.identifier === 'voices-from-beyond');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (livingShadow) {
                    let activity = await gatheredWhispers.system.activities.find(a => a.identifier === 'ominous-will');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (symbioticBeing) {
                    let activity = await symbioticBeing.system.activities.find(a => a.identifier === 'symbiotic-agenda');
                    if (activity) {
                        await activity.use();
                    }
                }

                if (watchers) {
                    let activity = await watchers.system.activities.find(a => a.identifier === 'incessant-watchers');
                    if (activity) {
                        await activity.use();
                    }
                }

            }
        });

    }
}
