// initial entry damage macro
let templateFlag = region.flags?.world?.spell?.Moonbeam;
if (templateFlag) {
    let sourceToken = canvas.tokens.get(templateFlag.sourceTokenId);
    const item = sourceToken.actor.items.get(templateFlag.spellId);
    const token = event.data.token;
    let damageRoll = await new Roll(templateFlag.damageRoll).roll();
    await game.dice3d?.showForRoll(damageRoll);
    await new MidiQOL.DamageOnlyWorkflow(sourceToken.actor, sourceToken, damageRoll.total, 'radiant', [token], damageRoll, {itemData: item, itemCardId: 'new'});
}

// moonbeam move
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "moonbeam-flag";
const flag = actor.getFlag(_flagGroup, flagName);
if (flag) {
    const template = await fromUuid(flag.templateId);
    if (template) {
        let position = await new Portal()
            .color("#ff0000")
            .texture("icons/svg/dice-target.svg")
            .origin({ x: template.x, y: template.y })
            .range(60)
            .pick();
        if (position) {
            await template.update({x: position.x, y: position.y});
        }
    }
}

// Move In
let effect = event.data.token?.actor?.effects?.find(eff => eff.name === 'Moonbeam Damage');
if (!effect) {
    let templateFlag = region.flags?.world?.spell?.Moonbeam;
    if (templateFlag) {
        let effectData = {
            'name': 'Moonbeam Damage',
            'icon': 'icons/magic/light/beam-rays-yellow-blue.webp',
            'changes': [
                {
                    'key': 'flags.midi-qol.OverTime',
                    'mode': 5,
                    'value': 'turn=start, rollType=save, saveAbility=con, saveDamage=halfdamage, saveRemove=false, saveMagic=true, damageType=radiant, damageRoll=' + templateFlag.damageRoll + ', saveDC=' + templateFlag.saveDC,
                    'priority': 20
                }
            ],
            'origin': origin,
        };

        await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: event.data.token.actor.uuid, effects: [effectData]});
    }
}

// Move Out
let effect = event.data.token?.actor?.effects?.find(eff => eff.name === 'Moonbeam Damage');
if (effect) {
    await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: event.data.token.actor.uuid, effects: [effect.id]});
}
