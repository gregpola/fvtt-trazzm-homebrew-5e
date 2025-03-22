/*
    The next time you hit a creature with a ranged weapon attack before the spell ends, this spell creates a rain of
    thorns that sprouts from your ranged weapon or ammunition. In addition to the normal effect of the attack, the
    target of the attack and each creature within 5 feet of it must make a Dexterity saving throw. A creature takes
    1d10 piercing damage on a failed save, or half as much damage on a successful one.

    At Higher Levels. If you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d10 for
    each slot level above 1st (to a maximum of 6d10).
*/
const version = "12.3.0";
const optionName = "Hail of Thorns";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "hail-of-thorns-data";
const concentrationEffectName = "Concentrating: Hail of Thorns";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const damageDice = workflow.castData.castLevel;
        await actor.setFlag(_flagGroup, flagName, {damageDice: damageDice});
    }
    else if (args[0].tag === "OnUse" && args[0].macroPass === "postDamageRoll") {
        if (workflow.item.system.actionType === "rwak") {
            let targetToken = workflow.hitTargets.first();
            if (targetToken) {
                let flag = actor.getFlag(_flagGroup, flagName);
                await actor.unsetFlag(_flagGroup, flagName);

                const damageDice = flag ? flag.damageDice : 1;
                const dc = actor.system.attributes.spelldc;
                await applyAOEDamage(item, targetToken, damageDice, dc);
                await HomebrewEffects.removeConcentrationEffectByName(actor, optionName);
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyAOEDamage(item, targetToken, damageDice, dc) {
    const flavor = `${CONFIG.DND5E.abilities["dex"].label} DC${dc} Rain of Thorns`;
    let areaSpellData = foundry.utils.duplicate(item);

    delete areaSpellData.effects;
    delete areaSpellData.id;
    delete areaSpellData.flags["midi-qol"].onUseMacroName;
    delete areaSpellData.flags["midi-qol"].onUseMacroParts;
    if (foundry.utils.hasProperty(areaSpellData, "flags.itemacro")) delete areaSpellData.flags.itemacro;
    if (foundry.utils.hasProperty(areaSpellData, "flags.dae.macro")) delete areaSpellData.flags.dae.macro;

    areaSpellData.name = `${optionName} - Rain of Thorns`;
    areaSpellData.system.damage.parts = [[`${damageDice}d10`, "piercing"]];
    areaSpellData.system.actionType = "save";
    areaSpellData.system.save.ability = "dex";
    areaSpellData.system.scaling = {"mode" : "level", "formula" : "1d10"};
    areaSpellData.system.preparation = {"mode" : "atwill", "prepared" : true};
    areaSpellData.system.target.value = 99;

    foundry.utils.setProperty(areaSpellData, "flags.midiProperties.magicdam", true);
    foundry.utils.setProperty(areaSpellData, "flags.midiProperties.saveDamage", "halfdam");

    const areaSpell = new CONFIG.Item.documentClass(areaSpellData, { parent: actor });
    areaSpell.prepareData();
    areaSpell.prepareFinalAttributes();

    const aoeTargets = MidiQOL
        .findNearby(null, targetToken, 5, { includeIncapacitated: true })
        .filter((possible) => {
            const collisionRay = new Ray(targetToken, possible);
            const collision = canvas.walls.checkCollision(collisionRay, {mode: "any", type: "light"});
            if (collision)
                return false;
            else
                return true;
        })
        .concat(targetToken)
        .map((t) => t.document.uuid);

    const [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions(aoeTargets);
    await MidiQOL.completeItemUse(areaSpell, config, options);

    await anime(targetToken);
}

async function anime(token) {
    new Sequence()
        .effect()
        .file("jb2a.cloud_of_daggers.daggers.green")
        .atLocation(token)
        .scaleToObject(2)
        .fadeOut(500)
        .wait(500)
        .play();
}
