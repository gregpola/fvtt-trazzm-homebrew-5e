/*
    You can prepare and deliver deadly poisons, granting you the following benefits:

    * When you make a damage roll that deals poison damage, it ignores resistance to poison damage.
    * You can apply poison to a weapon or piece of ammunition as a bonus action, instead of an action.
    * You gain proficiency with the Poisoner's Kit if you don’t already have it. With one hour of work using a poisoner’s
        kit and expending 50 gp worth of materials, you can create a number of doses of potent poison equal to your
        proficiency bonus. Once applied to a weapon or piece of ammunition, the poison retains its potency for 1 minute
        or until you hit with the weapon or ammunition. When a creature takes damage from the coated weapon or ammunition,
        that creature must succeed on a DC 14 Constitution saving throw or take 2d8 poison damage and become Poisoned
        until the end of your next turn.
*/
const version = "11.0";
const optionName = "Poisoner";
const damageType = "poison";
const goldCost = 50;

try {
    if (args[0].macroPass === "preItemRoll") {
        // make sure the actor has sufficient funds
        if (!HomebrewHelpers.hasAvailableGold(actor, goldCost)) {
            ui.notifications.error(`${optionName}: ${version} - not enough funds to create the poison`);
            return false;
        }
    }
    else if (args[0].macroPass === "preDamageRoll") {
        for(let target of workflow.targets) {
            if (target.actor.system.traits.dr.value.has(damageType)) {
                const effectUpdate = {
                    changes:[{
                        key: 'system.traits.dr.value',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: `-${damageType}`
                    }],
                    name: 'Poisoner - ignore resistance',
                    icon: 'icons/skills/toxins/poison-bottle-open-fire-purple.webp',
                    flags: {dae: { specialDuration: ['isDamaged']} }
                }
                
                await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: target.actor.uuid, effects: [effectUpdate]});
            }
        }
    }
    else if (args[0].macroPass === "postActiveEffects") {
        let poisonItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', 'Poisoner Potent Poison');
        if (poisonItem) {
            // check for gold cost
            if (await HomebrewHelpers.subtractGoldCost(actor, goldCost)) {
                poisonItem.system.uses.max = actor.system.attributes.prof;
                poisonItem.system.uses.value = actor.system.attributes.prof;
                await actor.createEmbeddedDocuments('Item',[poisonItem]);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
