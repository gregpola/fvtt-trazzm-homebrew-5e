/*
    Protective spirits flit around you in a 15-foot Emanation for the duration. If you are good or neutral, their
    spectral form appears angelic or fey (your choice). If you are evil, they appear fiendish.

    When you cast this spell, you can designate creatures to be unaffected by it. Any other creature’s Speed is halved
    in the Emanation, and whenever the Emanation enters a creature’s space and whenever a creature enters the Emanation
    or ends its turn there, the creature must make a Wisdom saving throw. On a failed save, the creature takes 3d8
    Radiant damage (if you are good or neutral) or 3d8 Necrotic damage (if you are evil). On a successful save, the
    creature takes half as much damage. A creature makes this save only once per turn.
 */
const version = "12.4.0"
const optionName = "Spirit Guardians";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagNameTurn = "spiritGuardiansTime";
const flagNameApplied = "spiritGuardiansApplied";
const effectName = "Spirit Guardians (In Aura)";

try {
    const lastArg = args[args.length -1];
    const sourceActor = await fromUuid(lastArg.origin);

    if (args[0] === "on") {
        // get the source flag
        let turnFlag = actor.getFlag(_flagGroup, flagNameTurn);
        if (turnFlag
            && turnFlag.origin === lastArg.origin
            && turnFlag.id === game.combat?.id
            && turnFlag.turn === game.combat?.current?.turn
            && turnFlag.round === game.combat?.current?.round) {
            console.log(`${actor.name} has taken the Spirit Guardians damage already this turn from the same source actor`);
            return;
        }

        // set flag for turn check
        await setCombatFlag(actor, lastArg.origin);

        // set flag to prevent end of turn roll
        await actor.setFlag(_flagGroup, flagNameApplied, true);

        // build overtime effect
        const alignment = foundry.utils.getProperty(sourceActor, "system.details.alignment")?.toLowerCase();
        let damageType = "radiant";
        if (alignment.includes("evil")) {
            damageType = "necrotic";
        }

        await addOvertimeEffect({
            sourceActor: sourceActor,
            targetActor: actor,
            damageType: damageType,
            damageRoll: `${scope.effect.flags["midi-qol"].castData.castLevel}d8`,
            flagName: flagNameApplied
        });

        const isDead = targetToken.actor.statuses.has("dead");
        if (!isDead) {
            let activeEffect = HomebrewHelpers.findEffect(targetToken.actor, effectName, lastArg.origin);
            if (activeEffect) {
                await MidiQOL.doOverTimeEffect(targetToken.actor, activeEffect);
            }
        }

    } else if (args[0] === "each" && lastArg.turn === "endTurn") {
        if (actor !== sourceActor) {
            await actor.setFlag(_flagGroup, flagNameApplied, false);
        }
    }

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}

async function setCombatFlag(actor, origin) {
    await actor.setFlag(_flagGroup, flagNameTurn,
        {
            origin: origin,
            id: game.combat?.id ?? null,
            round: game.combat?.round ?? null,
            turn: game.combat?.turn ?? null
        });
}

async function addOvertimeEffect({ sourceActor, targetActor, damageType, damageRoll, flagName } = {}) {

    const overtimeOptions = [
        `label=${optionName} (End of Turn)`,
        `turn=end`,
        `damageRoll=${damageRoll}`,
        `damageType=${damageType}`,
        "saveRemove=false",
        `saveDC=${sourceActor.system.attributes.spelldc}`,
        "saveAbility=wis",
        "saveDamage=halfdamage",
        "killAnim=true",
        `applyCondition=!flags.${_flagGroup}.${flagName}`,
        "macro=ItemMacro.Spirit Guardians"
    ];

    let updates = {
        _id: scope.effect._id,
        changes: scope.effect.changes.concat([
            {
                key: "flags.midi-qol.OverTime",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                priority: 20,
                value: overtimeOptions.join(","),
            }
        ])
    };

    await MidiQOL.socket().executeAsGM('updateEffects', {
        'actorUuid': targetActor.uuid,
        'updates': [updates]
    });

}
