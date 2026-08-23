/*
    Guided by a flash of magical insight, you make one attack with the weapon used in the spell’s casting. The attack
    uses your spellcasting ability for the attack and damage rolls instead of using Strength or Dexterity. If the attack
    deals damage, it can be Radiant damage or the weapon’s normal damage type (your choice).

    Cantrip Upgrade. Whether you deal Radiant damage or the weapon’s normal damage type, the attack deals extra Radiant
    damage when you reach levels 5 (1d6), 11 (2d6), and 17 (3d6).
*/
const optionName = "True Strike";
const version = "14.5.0";
const timeFlag = "last-true-strike";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll" && rolledItem.type === "weapon") {
        // Once per turn
        if (HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) && game.combat) {
            const extraDamageDice = (actor.system.details.level >= 17 ? 3 : (actor.system.details.level >= 11 ? 2 : (actor.system.details.level >= 5 ? 1 : 0)));

            const description = `<div style="margin-bottom: 5px;"><label>Apply True Strike to your attack with '${rolledItem.name}'?</label></div>` +
                `<div style="white-space: pre-wrap;">
                    The attack uses your spellcasting ability for the attack and damage rolls instead of using Strength or Dexterity.
                    If the attack deals damage, it can be Radiant damage or the weapon’s normal damage type (your choice).
                </div>`;

            const options = `<div><input type="checkbox" name="useRadiant" value="radiant" checked style="margin-left:10px;" /><label style="margin-left: 10px;">Apply radiant damage</label></div>`;

            const choice = await HomebrewHelpers.showUseAbilityDialog(actor, "True Strike", description, options);
            if (choice && choice !== 'No') {
                await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
                workflow.activity.attack.ability = actor.system.attributes.spellcasting;
                await applyTrueStrikeEffect(actor, choice, extraDamageDice);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyTrueStrikeEffect(actor, choice, extraDamageDice) {
    var applyEffect = false;

    const trueStrikeEffect = {
        name: "True Strike Attack",
        transfer: false,
        img: "icons/skills/targeting/crosshair-triple-strike-orange.webp",
        origin: macroItem.uuid,
        type: "base",
        changes: [
        ],
        disabled: false,
        duration: {
            value: 0,
            units: "turns",
            expiry: "turnEnd",
            expired: false
        },
        flags: {
            dae: {
                showIcon: true,
                stackable: 'noneNameOnly',
                specialDuration: [
                    'DamageDealt'
                ]
            }
        }
    };

    const useRadiant = choice.get("useRadiant");
    if (useRadiant) {
        applyEffect = true;
        trueStrikeEffect.changes.push({
            key: "flags.automated-conditions-5e.damage.typeOverride",
            type: "ac5e",
            value: `override=radiant; once;`,
            phase: "final",
            priority: 2
        });
    }

    if (extraDamageDice > 0) {
        applyEffect = true;
        trueStrikeEffect.changes.push({
            key: "flags.automated-conditions-5e.damage.bonus",
            type: "ac5e",
            value: `bonus=${extraDamageDice}d6[radiant]; once;`,
            phase: "final",
            priority: 3
        });
    }

    if (applyEffect) {
        await MidiQOL.createEffects({actorUuid: actor.uuid, effects: [trueStrikeEffect]});
    }
}