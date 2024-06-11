/*
    You move like the wind. Until the spell ends, your movement doesn’t provoke opportunity attacks.

    Once before the spell ends, you can give yourself advantage on one weapon attack roll on your turn. That attack
    deals an extra 1d8 force damage on a hit. Whether you hit or miss, your walking speed increases by 30 feet until the
    end of that turn.
 */
const version = "11.0";
const optionName = "Zephyr Strike";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "zephyr-strike-used";

let active = actor.effects.find(e => e.name === "Zephyr Strike Advantage Active");
let used = actor.getFlag(_flagGroup, flagName);

try {
    if (args[0].macroPass === "postActiveEffects") {
        await actor.unsetFlag(_flagGroup, flagName);
    }
    else if (args[0].macroPass === "preAttackRoll") {
        if (workflow.item.type === "weapon" && !used) {
            let dialog = new Promise((resolve, reject) => {
                new Dialog({
                    title: "Use Zephyr Strike?",
                    content: "Do you want to use Zephyr Strike Advantage and Extra Dice?",
                    buttons: {
                        one: {
                            icon: '<i class="fas fa-check"></i>',
                            label: "Yes",
                            callback: () => resolve(true)
                        },
                        two: {
                            icon: '<i class="fas fa-times"></i>',
                            label: "No",
                            callback: () => {resolve(false)}
                        }
                    },
                    default: "two"
                }).render(true);
            });

            let result = await dialog;
            if(result) {
                const zephyrStrikeAdvantage = {
                    changes: [
                        {
                            key: "flags.midi-qol.advantage.attack.mwak",
                            mode: 0,
                            value: 1,
                            priority: 0
                        },
                        {
                            key: "flags.midi-qol.advantage.attack.rwak",
                            mode: 0,
                            value: 1,
                            priority: 0
                        }
                    ],
                    origin: actor.uuid,
                    disabled: false,
                    icon: item.img,
                    name: "Zephyr Strike Advantage Active",
                    flags: { dae: { specialDuration: ["1Attack"] } }
                };
                await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [zephyrStrikeAdvantage] });

                const zephyrStrikeSpeed = {
                    changes: [
                        {
                            key: "system.attributes.movement.walk",
                            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                            value: +30,
                            priority: 20
                        }
                    ],
                    origin: actor.uuid,
                    disabled: false,
                    icon: item.img,
                    name: "Zephyr Strike Speed Buff Active",
                    flags: { dae: { specialDuration: ["turnStartSource"] } }
                };
                await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [zephyrStrikeSpeed] });

                await actor.setFlag(_flagGroup, flagName, actor.uuid);
            }
		}
	}
	else if (args[0].macroPass === "DamageBonus") {
        if (active && workflow.hitTargets.size > 0) {
            // Use same roll options as the one from the damageRoll
            const dmgOptions = workflow.damageRoll?.options ? duplicate(workflow.damageRoll.options) : {};
            dmgOptions.critical = workflow.isCritical;
            delete dmgOptions.configured;
            delete dmgOptions.flavor;
            delete dmgOptions.criticalBonusDice;
            // Construct a DamageRoll to compute critical damage using the appropriate defined method and use the resulting formula
            const damageBonusResult = new CONFIG.Dice.DamageRoll("1d8[force]", workflow.rollData, dmgOptions);
            return {damageRoll: damageBonusResult.formula, flavor: "Zephyr Strike Damage"};
        }
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
