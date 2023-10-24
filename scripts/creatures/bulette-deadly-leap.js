/*
    If the bulette jumps at least 15 feet as part of its movement, it can then use this action to land on its feet in a
    space that contains one or more other creatures. Each of those creatures must succeed on a DC 16 Strength or Dexterity
    saving throw (target's choice) or be knocked prone and take 14 (3d6 + 4) bludgeoning damage plus 14 (3d6 + 4) slashing
    damage. On a successful save, the creature takes only half the damage, isn't knocked prone, and is pushed 5 feet out
    of the bulette's space into an unoccupied space of the creature's choice. If no unoccupied space is within range,
    the creature instead falls prone in the bulette's space.
*/
const version = "11.0";
const optionName = "Deadly Leap";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const maxRange = workflow.item.system.range.value ?? 40;
        const minRange = 15;

        let position = await HomebrewMacros.warpgateCrosshairs(token, maxRange, workflow.item, token, minRange);
        if (position) {
            const portalScale = token.w / canvas.grid.size * 0.7;

            // play source animation
            new Sequence()
                .effect()
                .file("jb2a.misty_step.01.dark_black")
                .atLocation(token)
                .scale(portalScale)
                .fadeOut(200)
                .wait(500)
                .thenDo(() => {
                    canvas.pan(position)
                })
                .animation()
                .on(token)
                .teleportTo(position, { relativeToCenter: true })
                .fadeIn(200)
                .play();

            await warpgate.wait(1000);

            // play destination animation
            new Sequence()
                .effect()
                .file("jb2a.impact.boulder.01")
                .atLocation(token)
                .scale(portalScale)
                .play();

            // find targets and apply save and damage
            let dexSaves = [];
            let strSaves = [];

            const potentialTargets = MidiQOL.findNearby(null, token, 1);
            if (potentialTargets.length > 0) {
                for (let target of potentialTargets) {
                    if (target.actor.system.abilities.dex.save >= target.actor.system.abilities.str.save) {
                        dexSaves.push(target.document.uuid);
                    } else {
                        strSaves.push(target.document.uuid);
                    }
                }

                // build damage features
                let areaFeatureDexterity = duplicate(workflow.item.toObject());
                delete(areaFeatureDexterity.effects);
                delete(areaFeatureDexterity._id);
                delete(areaFeatureDexterity.flags['midi-qol'].onUseMacroName);
                delete(areaFeatureDexterity.flags['midi-qol'].onUseMacroParts);
                delete(areaFeatureDexterity.flags.itemacro);
                areaFeatureDexterity.system.actionType = 'save';
                areaFeatureDexterity.name = workflow.item.name + ': Dexterity';
                areaFeatureDexterity.system.damage.parts = [
                    ['3d6[bludgeoning] + 4', 'bludgeoning'],
                    ['3d6[slashing] + 4', 'slashing']
                ];
                areaFeatureDexterity.system.save = {
                    'ability': 'dex',
                    'dc': 16,
                    'scaling': 'flat'
                };
                areaFeatureDexterity.system.description.value = '';
                areaFeatureDexterity.effects = [
                    {
                        'changes': [
                            {
                                'key': 'macro.CE',
                                'mode': 0,
                                'priority': 20,
                                'value': 'Prone'
                            }
                        ],
                        'flags': {
                            'dae': {
                                'stackable': 'none',
                                'specialDuration': ['turnStart']
                            }
                        },
                        'icon': workflow.item.img,
                        'label': workflow.item.name,
                        'transfer': false
                    }
                ];

                let areaFeatureStrength = duplicate(areaFeatureDexterity);
                areaFeatureStrength.name = workflow.item.name + ': Strength';
                areaFeatureStrength.system.save.ability = 'str';

                let areaFeature = new CONFIG.Item.documentClass(areaFeatureDexterity, {'parent': workflow.actor});
                let areaFeature2 = new CONFIG.Item.documentClass(areaFeatureStrength, {'parent': workflow.actor});

                // build synthetic workflow's
                let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions(dexSaves);
                if (dexSaves.length > 0) await MidiQOL.completeItemUse(areaFeature, config, options);
                options.targetUuids = strSaves;
                if (strSaves.length > 0) await MidiQOL.completeItemUse(areaFeature2, config, options);
            }
        }
        else {
            ui.notifications.error(`${optionName} - invalid leap location`);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
