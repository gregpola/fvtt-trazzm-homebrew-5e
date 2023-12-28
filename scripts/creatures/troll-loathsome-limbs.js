/*
    Whenever the troll takes at least 15 slashing damage at one time, roll a d20 to determine what else happens to it:

        1–10: Nothing else happens.
        11–14: One leg is severed from the troll if it has any legs left.
        15–18: One arm is severed from the troll if it has any arms left.
        19–20: The troll is decapitated, but the troll dies only if it can’t regenerate. If it dies, so does the severed head.

    If the troll finishes a short or long rest without reattaching a severed limb or head, the part regrows. At that
    point, the severed part dies. Until then, a severed part acts on the troll’s initiative and has its own action and
    movement. A severed part has AC 13, 10 hit points, and the troll’s Regeneration trait.

    A severed leg is unable to attack and has a speed of 5 feet.

    A severed arm has a speed of 5 feet and can make one claw attack on its turn, with disadvantage on the attack roll
    unless the troll can see the arm and its target. Each time the troll loses an arm, it loses a claw attack.

    If its head is severed, the troll loses its bite attack and its body is blinded unless the head can see it. The
    severed head has a speed of 0 feet and the troll’s Keen Smell trait. It can make a bite attack but only against a
    target in its space.

    The troll’s speed is halved if it’s missing a leg. If it loses both legs, it falls prone. If it has both arms, it
    can crawl. With only one arm, it can still crawl, but its speed is halved. With no arms or legs, its speed is 0, and
    it can’t benefit from bonuses to speed.
*/
const version = "11.0";
const optionName = "Loathsome Limbs";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "severed-parts";

const _trollArmId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-actors.SiPUZK7gQ5X6D5lI";
const _trollHeadId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-actors.Q2q38ohhf9HSJPod";
const _trollLegId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-actors.D533ma5K40L1ef6W";

try {
    if (args[0].macroPass === "isDamaged") {
        let severed = false;

        if (workflow.damageDetail) {
            // look for slashing damage
            for (let dd of workflow.damageItem.damageDetail) {
                for (let damageItem of dd) {
                    if (damageItem.type && damageItem.type.toLowerCase() === "slashing" && damageItem.damage >= 15) {
                        severed = true;
                        break;
                    }
                }
            }
        }

        if (severed) {
            // roll for the part
            const severRoll = await new Roll(`1d20`).evaluate({ async: true });
            if (severRoll.total > 10) {
                let severedParts = actor.getFlag(_flagGroup, flagName);
                if (!severedParts) {
                    severedParts = {head: 0, arms: 0, legs: 0};
                }

                if (severRoll.total < 15) {
                    if (severedParts.legs < 2) {
                        severedParts.legs++;
                        await summonTrollPart(_trollLegId);

                        // TODO apply debuff to troll
                        if (severedParts.legs === 1) {
                            await ChatMessage.create({
                                content: `${actor.name} movement speed is reduced to half due to losing a leg`,
                                speaker: ChatMessage.getSpeaker({ actor: actor })});
                        }
                        else if (severedParts.legs === 2) {
                            await game.dfreds?.effectInterface.addEffect({ effectName: 'Prone', uuid: actor.uuid });

                            if (severedParts.arms === 1) {
                                await ChatMessage.create({
                                    content: `${actor.name} falls prone due to the loss of both legs and may only crawl (quarter speed)`,
                                    speaker: ChatMessage.getSpeaker({ actor: actor })});
                            }
                            else if (severedParts.arms === 2) {
                                await ChatMessage.create({
                                    content: `${actor.name} falls prone due to the loss of both legs and may not move because they have no arms`,
                                    speaker: ChatMessage.getSpeaker({ actor: actor })});
                            }
                            else {
                                await ChatMessage.create({
                                    content: `${actor.name} falls prone due to the loss of both legs and may only crawl (half speed)`,
                                    speaker: ChatMessage.getSpeaker({ actor: actor })});
                            }
                        }
                    }
                }
                else if (severRoll.total < 19) {
                    if (severedParts.arms < 2) {
                        severedParts.arms++;
                        await summonTrollPart(_trollArmId);
                        // TODO apply debuff to troll
                        // lose a claw attack for each lost arm
                        await ChatMessage.create({
                            content: `${actor.name} loses an arm and one claw attack`,
                            speaker: ChatMessage.getSpeaker({ actor: actor })});
                    }
                }
                else {
                    if (severedParts.head === 0) {
                        severedParts.head = 1;
                        await summonTrollPart(_trollHeadId);
                        // TODO apply debuff to troll - lose bite attack
                        await ChatMessage.create({
                            content: `${actor.name} loses it's head, so it naturally cannot bite`,
                            speaker: ChatMessage.getSpeaker({ actor: actor })});
                    }
                }

                await actor.setFlag(_flagGroup, flagName, severedParts);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function summonTrollPart(compendiumId) {

    let entity = await fromUuid(compendiumId);
    if (!entity) {
        ui.notifications.error(`${optionName}: ${version} - unable to find the troll part`);
        return false;
    }

    const summonName = `${entity.name} (${actor.id})`;
    const updates = {
        token: {
            "name": summonName,
            "disposition": token.disposition,
            "displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
            "displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
            "actorLink": false
        },
        "name": summonName,
    };

    // import the actor
    let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), entity.id, updates);
    if (!document) {
        ui.notifications.error(`${optionName}: ${version} - unable to import the troll part`);
        return false;
    }
    await warpgate.wait(500);

    const result = await warpgate.spawnAt(token.center, summonName, updates, { controllingActor: actor, collision: false }, {});
    if (!result || !result[0]) {
        ui.notifications.error(`${optionName}: ${version} - unable to spawn troll part`);
        return;
    }

    let summonedToken = canvas.tokens.get(result[0]);
    if (summonedToken) {
        await summonedToken.toggleCombat();
        const objectInitiative = token.combatant.initiative ? token.combatant.initiative + .01
            : 1 + (summonedToken.actor.system.abilities.dex.value / 100);
        await summonedToken.combatant.update({initiative: objectInitiative});
    }
}