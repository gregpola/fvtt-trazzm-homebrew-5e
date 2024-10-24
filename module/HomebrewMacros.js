const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _poisonedWeaponFlag = "poisoned-weapon";

class HomebrewMacros {

    static async wait(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    /**
     * Prompts the token for a teleport to location.
     *
     * @param token the token to teleport
     * @param maxRange  the maximum teleport range in feet
     * @param destination the token destination, if included it doesn't prompt for a location
     * @returns {Promise<void>}
     */
    static async teleportToken(token, maxRange = 30, destination = undefined) {
        // sanity checks
        if (token && maxRange) {
            const portalScale = token.w / canvas.grid.size * 0.7;

            if (destination) {
                new Sequence()
                    .effect()
                    .file("jb2a.misty_step.01.blue")
                    .atLocation(token)
                    .scale(portalScale)
                    .fadeOut(200)
                    .wait(500)
                    .thenDo(() => {
                        canvas.pan(destination)
                    })
                    .animation()
                    .on(token)
                    .teleportTo(destination, {relativeToCenter: true})
                    .fadeIn(200)
                    .effect()
                    .file("jb2a.misty_step.02.blue")
                    .atLocation({x: destination.x, y: destination.y})
                    .scale(portalScale)
                    .anchor(0.5, 0.5)
                    .play();

                return destination;

            } else {
                let position = await new Portal()
                    .color("#ff0000")
                    .texture(token.document.texture.src)
                    .origin(token)
                    .range(maxRange)
                    .pick();

                if (position) {
                    await new Sequence()
                        .effect()
                        .file("jb2a.misty_step.01.blue")
                        .atLocation(token)
                        .scale(portalScale)
                        .fadeOut(200)
                        .wait(500)
                        .thenDo(() => {
                            canvas.pan(position)
                        })
                        .animation()
                        .on(token)
                        .teleportTo(position, {relativeToCenter: true})
                        .waitUntilFinished(-200)
                        .fadeIn(200)
                        .effect()
                        .file("jb2a.misty_step.02.blue")
                        .atLocation({x: position.x, y: position.y})
                        .scale(portalScale)
                        .anchor(0.5, 0.5)
                        .play();

                    return position;
                } else {
                    ui.notifications.error('Invalid teleport location');
                    return false;
                }
            }
        }
    }

    static checkPosition(ignoreToken, newX, newY) {
        const hasToken = canvas.tokens.placeables.some(t => {
            const detectX = newX.between(t.document.x, t.document.x + canvas.grid.size * (t.document.width - 1));
            const detectY = newY.between(t.document.y, t.document.y + canvas.grid.size * (t.document.height - 1));
            return detectX && detectY && (ignoreToken !== t);
        });
        return hasToken;
    }

    /**
     * New version of apply grappled function.
     *
     * @param grapplerToken     the grappling actor token
     * @param targetToken       the target actor token
     * @param sourceItem        the item that initiated the grapple
     * @param breakDC           the break grapple DC. If the value is 'opposed' it will run an opposed check
     * @param sourceActorFlag   a flag, if any, that should be removed on the grapplerToken if the grapple is broken
     * @param overtimeValue     an overtime effect value to apply to the target, if any
     * @param restrained        if present and true, also apply a restrained effect
     * @returns {Promise<void>}
     */
    static async applyGrappled(grapplerToken, targetToken, sourceItem, breakDC, sourceActorFlag = undefined, overtimeValue = undefined, restrained = false) {
        // sanity checks
        if (!grapplerToken || !targetToken || !sourceItem || !breakDC) {
            console.error("applyGrappled() is missing parameters");
            return false;
        }

        let existingGrappled = targetToken.actor.getRollData().effects.find(eff => eff.name.startsWith('Grappled (') && eff.origin === sourceItem.uuid);
        if (existingGrappled) {
            console.error("applyGrappled() - " + targetToken.name + " is already grappled using " + sourceItem.name);
            return false;
        }

        // build the grappled effect
        const grappledEffectName = `Grappled (${grapplerToken.name})`;
        const breakValue = breakDC !== 'opposed' ? breakDC : undefined;

        let grappledEffect = {
            name: grappledEffectName,
            icon: 'icons/magic/nature/root-vine-fire-entangled-hand.webp',
            changes: [
                {
                    key: 'macro.CE',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: 'Grappled',
                    priority: 21
                },
                {
                    key: 'macro.createItem',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: 'Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.Rg4639o5lnxWKgWD',
                    priority: 22
                }
            ],
            flags: {
                'dae': {
                    'specialDuration': ['shortRest', 'longRest', 'combatEnd']
                },
                'fvtt-trazzm-homebrew-5e': {
                    'grappler': {
                        'grapplerId': `${grapplerToken.id}`,
                        'breakDC': breakValue,
                        'sourceActorFlag': sourceActorFlag
                    }
                }
            },
            origin: sourceItem.uuid,
            disabled: false,
            transfer: true
        };

        if (restrained) {
            grappledEffect.changes.push({
                key: 'macro.CE',
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: 'Restrained',
                priority: 21
            });
        }

        if (overtimeValue) {
            grappledEffect.changes.push({
                key: 'flags.midi-qol.OverTime',
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: overtimeValue,
                priority: 19
            });
        }

        await MidiQOL.socket().executeAsGM("createEffects",
            {actorUuid: targetToken.actor.uuid, effects: [grappledEffect]});

    }

    /**
     * Applies a restrained effect to the target if they are not already restrained by the source.
     *
     * @param sourceToken       the restraining actor token
     * @param targetToken       the target actor token
     * @param sourceItem        the item that initiated the grapple
     * @param breakDC           the break DC
     * @param abilityCheck      the ability check type
     * @param sourceActorFlag   a flag, if any, that should be removed on the sourceToken if the condition is broken
     * @param overtimeValue     an overtime effect value to apply to the target, if any
     * @returns {Promise<boolean>}
     */
    static async applyRestrained(sourceToken, targetToken, sourceItem, breakDC, abilityCheck, sourceActorFlag = undefined, overtimeValue = undefined) {
        // sanity checks
        if (!sourceToken || !targetToken || !sourceItem || !breakDC || !abilityCheck) {
            console.error("applyRestrained() is missing arguments");
            return false;
        }

        let existingRestrained = targetToken.actor.getRollData().effects.find(eff => eff.name.startsWith('Restrained (') && eff.origin === sourceItem.uuid);
        if (existingRestrained) {
            console.error("applyRestrained() - " + targetToken.name + " is already restrained using " + sourceItem.name);
            return false;
        }

        // build the restrained effect
        const restrainedEffectName = `Restrained (${sourceToken.name})`;
        const breakValue = breakDC !== 'opposed' ? breakDC : undefined;

        let restrainedEffect = {
            name: restrainedEffectName,
            icon: 'icons/magic/control/encase-creature-spider-hold.webp',
            changes: [
                {
                    key: 'macro.CE',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: 'Restrained',
                    priority: 21
                },
                {
                    key: 'macro.createItem',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: 'Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.NrqmZlBf9GwcERs6',
                    priority: 22
                }
            ],
            flags: {
                'dae': {
                    'specialDuration': ['shortRest', 'longRest', 'combatEnd']
                },
                'fvtt-trazzm-homebrew-5e': {
                    'restrainer': {
                        'restrainerId': `${grapplerToken.id}`,
                        'breakDC': breakValue,
                        'sourceActorFlag': sourceActorFlag
                    }
                }
            },
            origin: sourceItem.uuid,
            disabled: false,
            transfer: true
        };

        if (overtimeValue) {
            restrainedEffect.changes.push({
                key: 'flags.midi-qol.OverTime',
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: overtimeValue,
                priority: 19
            });
        }

        await MidiQOL.socket().executeAsGM("createEffects",
            {actorUuid: targetToken.actor.uuid, effects: [restrainedEffect]});
        return true;
    }

    /**
     * Pulls the target maxSquares number of squares towards the puller.
     *
     * @param pullerToken
     * @param targetToken
     * @param maxSquares
     * @returns {Promise<boolean>}
     */
    static async pullTarget(pullerToken, targetToken, maxSquares) {
        // sanity checks
        if (!pullerToken || !targetToken) {
            console.error("pullTarget() is missing arguments");
            return;
        }

        // can't pull more than to adjacent to the pulling token
        const tokenDistance = MidiQOL.computeDistance(pullerToken, targetToken);

        const squares = maxSquares ? maxSquares : 1;
        let pullBackFt = 5 * squares;
        pullBackFt = Math.min(pullBackFt, tokenDistance - 5);
        await MidiQOL.moveTokenAwayFromPoint(targetToken, -pullBackFt, pullerToken.center);
    }

    /**
     * Pushes the target maxSquares number of squares away from the pusher.
     *
     * @param pusherToken
     * @param targetToken
     * @param maxSquares
     * @returns {Promise<boolean>}
     */
    static async pushTarget(pusherToken, targetToken, maxSquares) {
        // sanity checks
        if (!pusherToken || !targetToken) {
            console.error("pushTarget() is missing arguments");
            return;
        }

        const squares = maxSquares ? maxSquares : 1;
        const knockBackFt = 5 * squares;
        await MidiQOL.moveTokenAwayFromPoint(targetToken, knockBackFt, pusherToken.center);
    }

    /**
     * Flings the target maxSquares number of squares away from where it is in a random direction
     *
     * @param targetToken
     * @param maxSquares
     * @returns {Promise<boolean>}
     */
    static async flingTarget(targetToken, maxSquares) {
        // sanity checks
        if (!targetToken) {
            console.error("flingTarget() is missing the target");
            return;
        }

        let squares = maxSquares ? maxSquares : 1;
        let knockBackFt = 5 * squares;
        let knockBackFactor = knockBackFt / canvas.dimensions.distance;
        let distance = canvas.dimensions.size * knockBackFactor;
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const ray = Ray.fromAngle(targetToken.center.x, targetToken.center.y, angle, distance);
        let newCenter = ray.project(squares);
        await MidiQOL.moveTokenAwayFromPoint(targetToken, knockBackFt, newCenter);
    }

    /**
     * Charges (moves) the charger to their target
     *
     * @param chargerToken  the charger
     * @param targetToken   the target
     * @param minimumDistance   the minimum distance the actor has to move to charge
     * @returns {Promise<boolean>}
     */
    static async chargeTarget(chargerToken, targetToken, minimumDistance) {
        // sanity checks
        if (!chargerToken || !targetToken) {
            console.error("chargeTarget() is missing arguments");
            return false;
        }

        // move the charger to their target
        // Get the center position of the PC token before they move
        const startPosition = chargerToken.center;

        // Calculate the two token positions and store the values as offsetX and offsetY.
        const [offsetX, offsetY] = [chargerToken.center.x - targetToken.center.x, chargerToken.center.y - targetToken.center.y];

        // Determines the offset by comparing the token and target positions to see which direction the token is attacking from.
        // If it is 0, it comes from the side. If its positive or negative, it is from some corner.
        const offset = {
            x: (offsetX === 0 ? 0 : offsetX > 0 ? 1 : -1),
            y: (offsetY === 0 ? 0 : offsetY > 0 ? 1 : -1)
        };

        new Sequence()
            .animation()
            .on(chargerToken)
            .moveTowards(targetToken, {ease: "easeInOutBack"})
            .duration(1500)
            .closestSquare()
            .effect()
            .file("jb2a.gust_of_wind.veryfast")
            .atLocation(startPosition)
            .stretchTo(targetToken, {
                attachTo: true
            })
            .belowTokens()
            .play()
    }

    static async handleDistractingStrike({speaker, actor, token, character, item, args, scope, workflow}) {
        if (args[0].macroPass === "isAttacked") {
            if (actor) {
                let maneuverEffect = actor.effects.find(e => e.name === 'Distracting Strike - Distracted');
                if (maneuverEffect.origin !== item.actor.uuid) {
                    await MidiQOL.socket().executeAsGM('removeEffects', {
                        'actorUuid': actor.uuid,
                        'effects': [maneuverEffect.id]
                    });
                }
            }
        }
    }

    static async applyPrismaticSprayIndigo(sourceToken, targetToken, checkDC) {
        // sanity checks
        if (!sourceToken || !targetToken || !checkDC) {
            console.error("applyPrismaticSprayIndigo() is missing arguments");
            return false;
        }

        // add the Restrained effect to the target
        const restrainedEffectName = `Prismatic Spray - Indigo (${sourceToken.name})`;
        let restrainedEffect = {
            'name': restrainedEffectName,
            'icon': 'icons/magic/light/beam-rays-blue-small.webp',
            'changes': [
                {
                    'key': 'macro.CE',
                    'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    'value': 'Restrained',
                    'priority': 21
                },
                {
                    'key': 'flags.midi-qol.OverTime',
                    'mode': CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    'value': `label=Prismatic Spray (Indigo), turn=end, saveRemove=false, macro=function.HomebrewMacros.handlePrismaticSprayIndigo, saveAbility=con, saveDC=${checkDC}`,
                    'priority': 20
                }
            ],
            'origin': sourceToken.actor.uuid,
            'flags': {
                'dae': {
                    'specialDuration': ['shortRest', 'longRest', 'combatEnd']
                },
            }
        };

        await MidiQOL.socket().executeAsGM("createEffects",
            {actorUuid: targetToken.actor.uuid, effects: [restrainedEffect]});
        return true;
    }

    static async handlePrismaticSprayIndigo({speaker, actor, token, character, item, args, scope, workflow}) {
        console.log("handlePrismaticSprayIndigo");
        let targetToken = workflow.targets.first();
        let failedSaves = 0;
        let madeSaves = 0;

        // pull flag
        let flag = targetToken.actor.getFlag(_flagGroup, "prismatic-spray-indigo");
        if (flag) {
            failedSaves = flag.failedSaves;
            madeSaves = flag.madeSaves;
        }

        if (workflow.saves.has(targetToken)) {
            madeSaves++;
        }

        if (workflow.failedSaves.has(targetToken)) {
            failedSaves++;
        }

        // check for exit condition
        let spellEffect = targetToken.actor.effects.find(e => e.name.startsWith('Prismatic Spray - Indigo ('));
        if (madeSaves >= 3) {
            ChatMessage.create({content: `${targetToken.name} breaks free from the Prismatic Spray effect`});
            await targetToken.actor.unsetFlag(_flagGroup, "prismatic-spray-indigo");

            if (spellEffect) {
                await MidiQOL.socket().executeAsGM('removeEffects', {
                    'actorUuid': targetToken.actor.uuid,
                    'effects': [spellEffect.id]
                });
            }
        } else if (failedSaves >= 3) {
            ChatMessage.create({content: `${targetToken.name} becomes petrified`});
            await targetToken.actor.unsetFlag(_flagGroup, "prismatic-spray-indigo");

            if (spellEffect) {
                await MidiQOL.socket().executeAsGM('removeEffects', {
                    'actorUuid': targetToken.actor.uuid,
                    'effects': [spellEffect.id]
                });
            }

            await game.dfreds.effectInterface.addEffect({effectName: 'Petrified', uuid: targetToken.actor.uuid});
        } else {
            await targetToken.actor.setFlag(_flagGroup, "prismatic-spray-indigo", {
                failedSaves: failedSaves,
                madeSaves: madeSaves
            });
        }
    }

    /**
     * Helper method for applying poison to a weapon
     *
     * @param actor         the actor applying the poison
     * @param poisonItem    the poison item
     *
     * @returns {Promise<void>}
     */
    static async applyPoisonToWeapon(actor, poisonItem) {
        let speaker = ChatMessage.getSpeaker({actor: actor});

        let weapons = actor.items.filter(i => i.type === `weapon` && (i.system.damage.parts[0][1] === `piercing` || i.system.damage.parts[0][1] === `slashing`));
        let weapon_content = ``;
        for (let weapon of weapons) {
            weapon_content += `<option value=${weapon.id}>${weapon.name}</option>`;
        }

        let content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>Choose your weapon to poison:</label></div>
				<div class="flexrow"style="margin-bottom: 10px;">
					<select name="weapons">${weapon_content}</select>
				</div>
			</div>
		  </form>
		`;

        let dialog = new Promise((resolve, reject) => {
            new Dialog({
                // localize this text
                title: `Apply ${poisonItem.name}`,
                content: content,
                buttons: {
                    one: {
                        label: "<p>OK</p>",
                        callback: async (html) => {
                            let itemId = html.find('[name=weapons]')[0].value;
                            let weapon = actor.items.get(itemId);
                            const itemName = weapon.name;
                            let mutations = {
                                "name": `${weapon.name} (${poisonItem.name})`
                            };

                            // Update the weapon name to show it as poisoned
                            await weapon.update(mutations);

                            // check weapon type to see if it should be single or triple use
                            let useCount = 1;
                            if ((weapon.system.actionType === "rwak") && weapon.system.properties.has("amm")) {
                                useCount = 3;
                            }

                            // track poison info in the actor
                            await actor.setFlag(_flagGroup, _poisonedWeaponFlag, {
                                itemName: itemName,
                                itemId: weapon.id,
                                applications: useCount
                            });

                            ChatMessage.create({content: `${itemName} is poisoned`, speaker: speaker});
                            resolve(true);
                        }
                    },
                    two: {
                        label: "<p>Cancel</p>",
                        callback: () => {
                            resolve(false);
                        }
                    }
                },
                default: "two"
            }).render(true);
        });
        await dialog;
    }

    static async removePoisonFromWeapon(actor) {
        let flag = actor.getFlag(_flagGroup, _poisonedWeaponFlag);
        if (flag) {
            await actor.unsetFlag(_flagGroup, _poisonedWeaponFlag);
            let weapon = actor.items.get(flag.itemId);
            if (weapon) {
                await weapon.update({"name": flag.itemName});
                ChatMessage.create({
                    content: flag.itemName + " returns to normal",
                    speaker: ChatMessage.getSpeaker({actor: actor})
                });
            }
        }
    }

    static async applyLifeDrainEffect(sourceActor, targetActor, damage) {
        // check for existing
        let drainedEffect = targetActor.effects.find(eff => eff.name === "Life Drained");
        if (drainedEffect) {
            const effectData = drainedEffect.toObject();
            effectData.changes.push({
                key: 'system.attributes.hp.tempmax',
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -damage,
                priority: 20
            });
            await drainedEffect.update({changes: effectData.changes});
        } else {
            let effectData = {
                name: 'Life Drained',
                icon: 'icons/magic/unholy/strike-body-life-soul-purple.webp',
                origin: sourceActor.uuid,
                transfer: false,
                disabled: false,
                changes: [
                    {
                        key: 'system.attributes.hp.tempmax',
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                        value: -damage,
                        priority: 20
                    }
                ],
                'flags': {
                    'dae': {
                        'specialDuration': ['longRest']
                    }
                }
            };
            await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetActor.uuid, effects: [effectData]});
        }

        // check for death
        if (targetActor.system.attributes.hp.effectiveMax <= 0) {
            const isDead = await game.dfreds?.effectInterface?.hasEffectApplied('Dead', targetActor.uuid);
            if (!isDead) {
                await game.dfreds.effectInterface.addEffect({effectName: 'Dead', uuid: targetActor.uuid});
            }
        }
    }

    static async getActorFromCompendium(transformActorId) {
        if (transformActorId) {
            let entity = await fromUuid(transformActorId);
            if (!entity) {
                return ui.notifications.error(`${optionName} - unable to find the actor: ${transformActorId}`);
            }

            // import the actor
            let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), entity.id, {});
            if (!document) {
                return ui.notifications.error(`${optionName} - unable to import ${transformActorId} from the compendium`);
            }
            await HomebrewMacros.wait(500);
            return document;
        }

        return undefined;
    }
}
