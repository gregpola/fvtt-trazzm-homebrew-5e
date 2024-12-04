/*
	The elemental can move through a space as narrow as 1 inch wide without squeezing. A creature that touches the
	elemental or hits it with a melee attack while within 5 feet of it takes 5 (1d10) fire damage. In addition, the
	elemental can enter a hostile creature's space and stop there. The first time it enters a creature's space on a turn,
	that creature takes 5 (1d10) fire damage and catches fire; until someone takes an action to douse the fire, the
	creature takes 5 (1d10) fire damage at the start of each of its turns.
*/
const version = "12.3.0";
const optionName = "Fire Form";
const douseItemId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.QwEwf7d5Fxn29N68";
const burningName = "On Fire";

try {
    if (args[0].macroPass === "isDamaged") {
        if (["mwak", "msak"].includes(workflow.item.system.actionType)) {
            const attackingActor = workflow.token.actor;
            if (attackingActor && MidiQOL.getDistance(token, workflow.token) <= 5) {
                const damageRoll = await new Roll("1d10").roll({async: true});
                //await game.dice3d?.showForRoll(damageRoll);
                await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "fire", [workflow.token], damageRoll, {itemCardId: "new", itemData: actor.items.getName(optionName)});
            }
        }
    }
    else if (args[0] === "on") {
        // check for existing on fire effect
        let effect = token.actor.effects.find(ef => ef.name === burningName);
        if (!effect) {
            await applyBurningEffect(token);
            await addDouseItem(token);
        }

    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function addDouseItem(targetToken) {
    let douseItem = await fromUuid(douseItemId);
    if (douseItem) {
        const douseItemData = game.items.fromCompendium(douseItem);
        if (douseItemData) {
            let hasItem = targetToken.actor.items.find(i => i.name === "Douse Fire");
            if (!hasItem) {
                targetToken.actor.createEmbeddedDocuments('Item', [douseItemData]);
            }
        }
    }

    ChatMessage.create({'content': `${targetToken.name} is on fire!`})
}

async function applyBurningEffect(targetToken) {
    let effectData = {
        'name': burningName,
        'icon': 'icons/magic/fire/flame-burning-skeleton-explosion.webp',
        'changes': [
            {
                'key': 'flags.midi-qol.OverTime',
                'mode': CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                'value': 'turn=start, label=Burning, damageRoll=1d10, damageType=fire',
                'priority': 20
            }
        ]
    };

    await MidiQOL.socket().executeAsGM("createEffects",  { actorUuid: targetToken.actor.uuid, effects: [effectData] });
}