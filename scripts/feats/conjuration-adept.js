/**
 * Persistent Conjuration. While maintaining Concentration on a spell from the Conjuration school, you gain a bonus to
 * Constitution saving throws to maintain this Concentration. This bonus is equal to the ability modifier of the score
 * increased by this feat.
 */
const optionName = "Conjuration Adept";
const version = "14.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preItemRoll" && rolledItem.type === "spell" && rolledItem.system.school === "con") {
        // make sure it's a concentration spell
        if (rolledActivity.duration.concentration) {
            const featItem = macroItem;
            Hooks.once("dnd5e.beginConcentrating", async(actor, item, effect, activity) => {
                const abilityModified = getAbilityScoreAdvancement(featItem);
                if (abilityModified) {
                    const bonus = actor.system.abilities[abilityModified].mod;
                    const bonusEffect = await applyBonusEffect(actor, item, bonus);
                    await MidiQOL.addConcentrationDependent(actor, bonusEffect[0], item);
                }
            });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function getAbilityScoreAdvancement(item) {
    var assigned = item.advancement.byType.AbilityScoreImprovement[0].value.assignments;

    if (assigned.int) {
        return 'int';
    }
    else if (assigned.wis) {
        return 'wis';
    }
    else if (assigned.cha) {
        return 'cha';
    }

    return undefined;
}

async function applyBonusEffect(actor, item, bonus) {
    let effectData = {
        name: 'Persistent Conjuration',
        icon: 'icons/magic/time/hourglass-brown-orange.webp',
        changes: [
            {
                key: 'system.attributes.concentration.bonuses.save',
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: bonus,
                priority: 20
            }
        ],
        flags: {
            dae: {
                specialDuration: ['shortRest']
            }
        },
        origin: item.uuid,
        duration: {
            seconds: null
        },
        disabled: false
    };

    return await MidiQOL.socket().executeAsGM("createEffects",
        {actorUuid: actor.uuid, effects: [effectData]});
}
