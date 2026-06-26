const _flagGroup = "trazzm";
const _poisonedWeaponFlag = "poisoned-weapon";

class HomebrewMacros {

    static SIZE_TO_GRID_FOR_PULL = {
        tiny: 1,
        sm: 1,
        med: 1,
        lg: 1,
        huge: 2,
        grg: 3,
    };

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
            const tokenWidth = token.w ? token.w : token.width;
            const portalScale = tokenWidth / canvas.grid.size * 0.7;

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
                let texture = token.document ? token.document.texture.src : token.texture.src;
                let position = await new Portal()
                    .color("#ff0000")
                    .texture(texture)
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
     * Give pull distance options, no closer than adjacent to the pulling token
     * @param selfToken
     * @param targetToken
     * @param maxDistance
     * @param optionName
     * @returns {Promise<void>}
     */
    static async pullTargetTowardsSelf(selfToken, targetToken, maxDistance, optionName) {
        // get the distance
        const tokenDistance = MidiQOL.computeDistance(selfToken, targetToken, {wallsBlock: true, includeCover: true});
        let maxMovement = (tokenDistance / 5) * 5;

        // alter for token size
        const tokenGridSize = HomebrewMacros.SIZE_TO_GRID_FOR_PULL[selfToken.actor.system.traits.size];
        const tokenSizeAdjustment = (tokenGridSize * 5);
        maxMovement -= (tokenGridSize * 5);

        const adjustedMax = (maxDistance / 5) * 5;
        let longestDistance = Math.min(maxMovement, adjustedMax);

        // ask how far to pull
        let optionsContent = '';
        let firstOption = true;

        while (longestDistance > 0) {
            if (firstOption) {
                optionsContent += `<tr><td><label><input type="radio" name="choice" value="${longestDistance}" checked>   ${longestDistance} feet</label></td></tr>`;
                firstOption = false;
            }
            else {
                optionsContent += `<tr><td><label><input type="radio" name="choice" value="${longestDistance}">   ${longestDistance} feet</label></td></tr>`;
            }

            longestDistance -= 5;
        }

        const content = `
			        <div class="form-group">
                        <table style="width:100%">
                            <thead>
                                <tr><th>How far do you want to pull ${targetToken.name}?</th></tr>
                            </thead>
                            <tbody>${optionsContent}</tbody>
                        </table>
                    </div>`;

        let distancePulled = await foundry.applications.api.DialogV2.prompt({
            content: content,
            rejectClose: false,
            ok: {
                label: "Pull Target",
                callback: (event, button, dialog) => {
                    return button.form.elements.choice.value;
                }
            },
            window: {
                title: `${optionName}`,
            },
            position: {
                width: 400
            }
        });

        if (distancePulled) {
            await HomebrewMacros.pullTarget(selfToken, targetToken, distancePulled / 5);
        }
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
        let distance = 5 * squares;
        distance = Math.min(distance, tokenDistance - 5);
        let ray = new foundry.canvas.geometry.Ray(pullerToken.center, targetToken.center);
        await HomebrewMacros.moveTokenAlongRay(targetToken, ray, -distance);
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
        const distance = 5 * squares;
        await MidiQOL.moveTokenAwayFromPoint(targetToken, distance, pusherToken.center);
    }

    static async moveTokenAlongRay(targetToken, origRay, distance) {
        let knockBackFactor;
        let newCenter;
        let hitsWall = true;
        let oldDistance;
        let ray = foundry.canvas.geometry.Ray.fromAngle(targetToken.center.x, targetToken.center.y, origRay.angle, origRay.distance);
        if (ray.distance === 0) {
            return;
        }

        while (hitsWall) {
            knockBackFactor = distance / canvas.dimensions.distance;
            newCenter = ray.project((canvas.dimensions.size * knockBackFactor) / ray.distance);
            hitsWall = targetToken.checkCollision(newCenter, {origin: ray.A, type: 'move', mode: 'any'});
            if (hitsWall) {
                oldDistance = distance;
                distance += distance > 0 ? -5 : 5;
                if (distance === 0 || (Math.sign(oldDistance) !== Math.sign(distance))) {
                    return;
                }
            }
        }

        newCenter = canvas.grid.getSnappedPoint({x: newCenter.x - targetToken.w / 2, y: newCenter.y - targetToken.h / 2}, {mode: 0xFF0});
        await targetToken.document.update({ x: newCenter?.x ?? 0, y: newCenter?.y ?? 0 }, { animate: true });
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
        const ray = foundry.canvas.geometry.Ray.fromAngle(targetToken.center.x, targetToken.center.y, angle, distance);
        let newCenter = ray.project(1);
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

        // verify minimum distance
        const tokenDistance = MidiQOL.computeDistance(chargerToken, targetToken, {wallsBlock: true, includeCover: true});
        if (tokenDistance < minimumDistance) {
            ui.notifications.error(`${targetToken.name} is too close to charge`);
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

    static async moveToTarget(token, targetToken) {
        await new Sequence()
            .animation()
            .on(token)
            .moveTowards(targetToken, {ease: "easeInOutBack"})
            .closestSquare()
            .play();
    }

    static async revertWildShape(actor, effectName) {
        if (actor.isPolymorphed) {
            let originalActor = await actor.revertOriginalForm();

            // copy over spell slots
            const spells = foundry.utils.duplicate(actor.system.spells);
            if (spells) {
                await originalActor.update({'system.spells' : spells});
            }

            // remove features
            let itemEffect = HomebrewEffects.findEffect(originalActor, effectName);
            if (itemEffect) {
                await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: originalActor.uuid, effects: [itemEffect.id] });
            }

            let wildShapeFeature = originalActor.items.find(i => i.name === "Revert Wild Shape");
            if (wildShapeFeature) {
                await originalActor.deleteEmbeddedDocuments('Item', [wildShapeFeature.id]);
            }
        }
    }

    /**
     * The target’s Hit Point maximum decreases by an amount equal to the Necrotic damage taken, and the source regains
     * Hit Points equal to that amount.
     *
     * @param sourceToken
     * @param targetActor
     * @param damage
     * @returns {Promise<void>}
     */
    static async applyLifeDrainEffect(sourceToken, targetActor, damage, sourceItem) {
        // Apply the life drain damage to the target
        let drainedEffect = HomebrewEffects.findEffect(targetActor, "Life Drained");
        if (drainedEffect) {
            const hpMaxChange = drainedEffect.changes.find(change => change.key === 'system.attributes.hp.tempmax');
            if (hpMaxChange) {
                const newDrainValue = Number(hpMaxChange.value) - damage;
                await drainedEffect.update({
                    changes: [{
                        key: 'system.attributes.hp.tempmax',
                        value: `${newDrainValue}`,
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                        priority: 20
                    }]});
            }

        } else {
            let effectData = {
                name: 'Life Drained',
                icon: 'icons/magic/unholy/strike-body-life-soul-purple.webp',
                origin: sourceToken.actor.uuid,
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

        // apply healing to the source
        const damageRoll = await new CONFIG.Dice.DamageRoll(`${damage}`, {}, {type: "healing", properties: ["mgc"]}).evaluate();
        await new MidiQOL.DamageOnlyWorkflow(sourceToken.actor, sourceToken, null, null, [sourceToken], damageRoll, {
            flavor: 'Life Drain',
            itemCardId: "new",
            itemData: sourceItem.toObject()
        });

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

    static async swapTokenPositions(tokenA, tokenB) {
        const x = tokenA.center.x;
        const y = tokenA.center.y;

        await new Portal()
            .origin(tokenA)
            .setLocation({x: tokenB.center.x, y: tokenB.center.y})
            .teleport();

        await new Portal()
            .origin(tokenB)
            .setLocation({x: x, y: y})
            .teleport();
    }
}
