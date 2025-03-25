/*
    You move like the wind. Until the spell ends, your movement doesn’t provoke opportunity attacks.

    Once before the spell ends, you can give yourself advantage on one weapon attack roll on your turn. That attack
    deals an extra 1d8 force damage on a hit. Whether you hit or miss, your walking speed increases by 30 feet until the
    end of that turn.
 */
const version = "12.3.1";
const optionName = "Zephyr Strike";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "zephyr-strike-used";

try {
    if (args[0].macroPass === "postActiveEffects") {
        await actor.unsetFlag(_flagGroup, flagName);
    }
    else if (args[0].macroPass === "preAttackRoll") {
        if (workflow.item.type === "weapon" && !isActive() && isAvailable()) {
            // ask for damage bonus use
            const useFeature = await foundry.applications.api.DialogV2.confirm({
                window: {
                    title: `${optionName}`,
                },
                content: '<p>Apply Zephyr Strike advantage and damage to this attack?</p><sub>(also gain 30 extra feet of movement this turn)</sub>',
                rejectClose: false,
                modal: true
            });

            if (useFeature) {
                // system.bonuses.weapon.damage
                await applyDamageBonusEffect(actor);
                await applyMovementEffect(actor);
                await actor.setFlag(_flagGroup, flagName, actor.uuid);
                workflow.advantage = true;
            }
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function isAvailable() {
    const used = actor.getFlag(_flagGroup, flagName);
    return !used;
}

function isActive() {
    const effect = HomebrewHelpers.findEffect(actor, "Zephyr Strike Advantage");
    if (effect) {
        return true;
    }

    return false;
}

async function applyDamageBonusEffect(actor) {
    const effectData = {
        name: 'Zephyr Strike damage bonus',
        icon: "icons/skills/melee/maneuver-sword-katana-yellow.webp",
        origin: actor.uuid,
        transfer: false,
        disabled: false,
        duration: {rounds: 1},
        flags: { dae: { specialDuration: ["1Attack"] } },
        changes: [
            {
                key: 'system.bonuses.weapon.damage',
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: '1d8[force]',
                priority: 20
            }
        ]
    }

    return await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
}

async function applyMovementEffect(actor) {
    const effectData = {
        name: 'Zephyr Strike movement bonus',
        icon: "icons/skills/melee/maneuver-sword-katana-yellow.webp",
        origin: actor.uuid,
        transfer: false,
        disabled: false,
        duration: {rounds: 1},
        flags: { dae: { specialDuration: ["turnStartSource"] } },
        changes: [
            {
                key: 'system.attributes.movement.walk',
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: '30',
                priority: 20
            }
        ]
    }

    return await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
}
