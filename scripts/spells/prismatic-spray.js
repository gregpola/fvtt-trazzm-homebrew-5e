/*
    Eight multicolored rays of light flash from your hand. Each ray is a different color and has a different power and
    purpose. Each creature in a 60-foot cone must make a Dexterity saving throw. For each target, roll a d8 to determine
    which color ray affects it.

    1- Red. The target takes 10d6 fire damage on a failed save, or half as much damage on a successful one.
    2- Orange. The target takes 10d6 acid damage on a failed save, or half as much damage on a successful one.
    3- Yellow. The target takes 10d6 lightning damage on a failed save, or half as much damage on a successful one.
    4- Green. The target takes 10d6 poison damage on a failed save, or half as much damage on a successful one.
    5- Blue. The target takes 10d6 cold damage on a failed save, or half as much damage on a successful one.
    6- Indigo. On a failed save, the target is Restrained. It must then make a Constitution saving throw at the end of each
        of its turns. If it successfully saves three times, the spell ends. If it fails its save three times, it
        permanently turns to stone and is subjected to the Petrified condition. The successes and failures don't need to
        be consecutive; keep track of both until the target collects three of a kind.
    7- Violet. On a failed save, the target is Blinded. It must then make a Wisdom saving throw at the start of your next
        turn. A successful save ends the blindness. If it fails that save, the creature is transported to another plane
        of existence of the GM's choosing and is no longer Blinded. (Typically, a creature that is on a plane that isn't
        its home plane is banished home, while other creatures are usually cast into the Astral or Ethereal planes.)

    8- Special. The target is struck by two rays. Roll twice more, re-rolling any 8.

*/
const version = "11.0";
const optionName = "Prismatic Spray";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const actorDC = actor.system.attributes.spelldc ?? 12;

        for (let targetToken of workflow.hitTargets) {
            const saved = workflow.saves.has(targetToken);

            let effectRolls = [(await new Roll("1d8").roll()).total];
            if (effectRolls[0] === 8) {
                effectRolls = [(await new Roll("1d7").roll()).total, (await new Roll("1d7").roll()).total];
            }

            for (let effectRoll of effectRolls) {
                switch (effectRoll) {
                    case 1:
                        await applyRayDamage(targetToken, "Red", "fire", saved);
                        break;
                    case 2:
                        await applyRayDamage(targetToken, "Orange", "acid", saved);
                        break;
                    case 3:
                        await applyRayDamage(targetToken, "Yellow", "lightning", saved);
                        break;
                    case 4:
                        await applyRayDamage(targetToken, "Green", "poison", saved);
                        break;
                    case 5:
                        await applyRayDamage(targetToken, "Blue", "cold", saved);
                        break;
                    case 6:
                        if (!saved) {
                            let restrained = await HomebrewMacros.applyPrismaticSprayIndigo(token, targetToken, actorDC);
                            if (restrained) {
                                ChatMessage.create({
                                    content: `${targetToken.name} is restrained by the indigo beam`,
                                    speaker: ChatMessage.getSpeaker({ actor: actor })});
                            }
                            else {
                                ui.notifications.error(`${optionName}: applyPrismaticSprayIndigo failed`);
                            }
                        }
                        break;
                    case 7:
                        if (!saved) {
                            await game.dfreds.effectInterface.addEffect({ effectName: 'Blinded', uuid: targetToken.actor.uuid });
                            await ChatMessage.create({flavor: `Prismatic Spray - Violet`, content:
                                    `${targetToken.name} is blinded. Make a DC ${actorDC} Wisdom saving throw at the start of ${actor.name}'s next turn. A successful save ends the blindness. If ${targetToken.name} fails that save, the it is transported to another plane of existence of the GM’s choosing and is no longer blinded. (Typically, a creature that is on a plane that isn’t its home plane is banished home, while other creatures are usually cast into the Astral or Ethereal planes.`});
                        }
                        break;
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyRayDamage(targetToken, color, damageType, saved) {
    let damageRoll;
    if (saved) {
        damageRoll = await new Roll(`10d6/2[${damageType}]`).roll();
    }
    else {
        damageRoll = await new Roll(`10d6[${damageType}]`).roll();
    }

    const flavor = `Prismatic Spray ${color} - ${targetToken.name} (${CONFIG.DND5E.damageTypes[damageType]}) Damage`;
    await new MidiQOL.DamageOnlyWorkflow(targetToken.actor, token, damageRoll.total, damageType, [targetToken], damageRoll,
        { flavor: flavor, itemCardId: "new", itemData: item, useOther: false });
}
