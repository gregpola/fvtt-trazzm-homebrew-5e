/*
	Thin and wispy flames wreathe your body for the Duration, shedding bright light in a 10-foot radius and dim light
	for an additional 10 feet. You can end the spell early by using an action to dismiss it.

    The flames provide you with a warm shield or a chill shield, as you choose. The warm shield grants you
    resistance to cold damage, and the chill shield grants you resistance to fire damage.

    In addition, whenever a creature within 5 feet of you hits you with a melee Attack, the shield erupts with flame.
    The attacker takes 2d8 fire damage from a warm shield, or 2d8 cold damage from a cold shield.
*/

// Effect creation
const version = "11.1";
const optionName = "Fire Shield";

try {
    if (args[0].tag === 'OnUse') {
        const itemCard = game.messages.get(args[0].itemCardId);
        const DIV = document.createElement('DIV');
        DIV.innerHTML = itemCard.content;

        await actor.effects.find(eff=>eff.origin === args[0].item.uuid)?.delete();

        new Dialog({
            title: 'Warm or Cold Shield',
            buttons: {
                one: {
                    label: 'Warm (cold resistance)',
                    callback: async () => {
                        await actor.createEmbeddedDocuments('ActiveEffect', [
                            {
                                changes: [
                                    {
                                        key: 'system.traits.dr.value',
                                        value: 'cold',
                                        mode: 2,
                                    },
                                    {
                                        key: 'flags.midi-qol.onUseMacroName',
                                        value: `ItemMacro.${item.uuid},isDamaged`,
                                        mode: 0,
                                    },
                                ],
                                duration: {
                                    startTime: game.time.worldTime,
                                    seconds: 600,
                                    startRound: game.combat?.round,
                                    startTurn: game.combat?.turn,
                                },
                                icon: 'icons/magic/defensive/shield-barrier-flaming-pentagon-red.webp',
                                label: 'Warm Shield',
                                origin: args[0].item.uuid,
                                flags: {
                                    'times-up': {
                                        isPassive: true,
                                    },
                                    dae: {stackable:'noneName'}
                                },
                            },
                        ]);
                        DIV.querySelector('div.card-buttons').innerHTML = `${actor.name} gains resistance to cold damage`;
                        const update = [{
                            _id: args[0].itemCardId,
                            content: DIV.innerHTML
                        }]
                        await ChatMessage.updateDocuments(update);
                    },
                },
                two: {
                    label: 'Cold (fire resistance)',
                    callback: async () => {
                        await actor.createEmbeddedDocuments('ActiveEffect', [
                            {
                                changes: [
                                    {
                                        key: 'system.traits.dr.value',
                                        value: 'fire',
                                        mode: 2,
                                    },
                                    {
                                        key: 'flags.midi-qol.onUseMacroName',
                                        value: `ItemMacro.${item.uuid},isDamaged`,
                                        mode: 0,
                                    },
                                ],
                                duration: {
                                    startTime: game.time.worldTime,
                                    seconds: 600,
                                    startRound: game.combat?.round,
                                    startTurn: game.combat?.turn,
                                },
                                icon: 'icons/magic/defensive/shield-barrier-flaming-pentagon-blue.webp',
                                label: 'Chill Shield',
                                origin: args[0].item.uuid,
                                flags: {
                                    'times-up': {
                                        isPassive: true,
                                    },
                                    dae: {stackable:'noneName'}
                                },
                            },
                        ]);
                        DIV.querySelector('div.card-buttons').innerHTML = `${actor.name} gains resistance to fire`;
                        const update = [{
                            _id: args[0].itemCardId,
                            content: DIV.innerHTML
                        }]
                        await ChatMessage.updateDocuments(update);
                    },
                },
            },
        }).render(true);
    }
    else if (args[0].macroPass = 'isDamaged') {
        const attackerToken = fromUuidSync(args[0].tokenUuid).object;
        const defenderToken = args[0].options.token;
        const defenderActor = args[0].options.actor;
        if (!attackerToken || !defenderToken || !defenderActor) return;
        const distance = 5;
        if (MidiQOL.getDistance(attackerToken, defenderToken) > 5) return;
        const dmgType = defenderActor.effects.find((eff) =>
            eff.label.toLocaleLowerCase().includes('warm shield')
        )
            ? 'fire'
            : 'cold';
        const itemCard = await item.displayCard({ createMessage: false });
        const DIV = document.createElement('DIV');
        DIV.innerHTML = itemCard.content;
        DIV.querySelector('div.card-buttons').innerHTML = `${attackerToken.name} suffers <b>${dmgType}</b> damage from the fire shield`;
        DIV.querySelector('footer.card-footer')?.remove();
        const roll = await new Roll(`2d8[${dmgType}]`).toMessage({ flavor: DIV.innerHTML, speaker: ChatMessage.getSpeaker({ scene: game.canvas?.scene, actor: defenderActor, token: defenderToken }) });
        await game.dice3d?.waitFor3DAnimationByMessageID(roll.id);

        const total = roll.rolls[0].result;
        await new MidiQOL.DamageOnlyWorkflow(
            defenderActor,
            defenderToken,
            total,
            dmgType,
            [attackerToken.document],
            roll.rolls[0],
            { itemCardId: roll.id, damageList: args[0].damageList }
        );
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
