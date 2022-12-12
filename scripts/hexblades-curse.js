const lastArg = args[args.length - 1];
let sourceActor;
let sourceToken;
let targetActor;

if(args[0]==="on") return;

else if(args[0]==="off") { 
	// check for expiration because of target death
    targetActor = canvas.tokens.placeables.find(i=>i.actor.effects.find(eff=>eff.data.label === "Hexblade's Curse Mark"))?.actor;

	if (lastArg["expiry-reason"] === "midi-qol:zeroHP") {
		sourceActor = MidiQOL.MQfromActorUuid(lastArg.origin.substr(0, lastArg.origin.indexOf(".",6)));
        sourceToken = sourceActor?.token ?? sourceActor?.getActiveTokens()[0];
        const healing = Math.max(1, sourceActor?.getRollData().classes.warlock.levels + sourceActor?.getRollData().abilities.cha.mod)
        await MidiQOL.applyTokenDamage([{damage: healing, type: 'healing'}], healing, new Set([sourceToken]), null, null, {forceApply:false} )
        const sourceEffect = sourceActor.effects.find(eff=>eff.data.label === "Hexblade's Curse");
        if (sourceEffect) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: sourceActor.uuid, effects: [sourceEffect.id] });
	}
	
	//cleaning when deleting from caster
    if (targetActor) {
        const hasEffect = targetActor.data.effects.find(eff=>eff.data.label === "Hexblade's Curse Mark");
        if (hasEffect) {
            await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetActor.uuid, effects: [hasEffect.id] });
        }
    }
    return;
}

else if (args[0].tag === "DamageBonus") { //caster hitting for extra damage
    targetActor = (await fromUuid(lastArg.hitTargetUuids[0]))?.actor;
    if (targetActor?.data?.flags?.dae?.onUpdateTarget && lastArg.hitTargets.length > 0) {
        const isMarked = targetActor.data.flags.dae.onUpdateTarget.find(flag => flag.flagName === "Hexblade's Curse" && flag.targetTokenUuid === lastArg.hitTargets[0].uuid);
        if (isMarked) {
            let damageType = lastArg.item.data.damage.parts[0][1];
            return {damageRoll: `@prof[${damageType}]`, flavor: "Hexblade's Curse damage"};
        }   
    }
    return;
}
else if (args[0].macroPass === "preAttackRoll") { //caster Attacking
    targetActor = (await fromUuid(lastArg.hitTargetUuids[0]))?.actor;
    if (targetActor?.data?.flags?.dae?.onUpdateTarget && lastArg.targets.length > 0) {
        const isMarked = targetActor.data.flags.dae.onUpdateTarget.find(flag => flag.flagName === "Hexblade's Curse" && flag.sourceTokenUuid === lastArg.tokenUuid);
        if (isMarked) {
            const effectData = {
                "changes":[
                    { "key": "flags.dnd5e.weaponCriticalThreshold", "mode": CONST.ACTIVE_EFFECT_MODES.OVERRIDE, "value": "19", "priority": "20" },
                    { "key": "flags.dnd5e.spellCriticalThreshold", "mode": CONST.ACTIVE_EFFECT_MODES.OVERRIDE, "value": "19", "priority": "20" }                
                ],
                "duration": {
                    "startTime": game.time.worldTime,
                },
                "icon": "icons/skills/melee/strike-dagger-white-orange.webp",
                "label": "Critical Threshold change",
                "flags": {
                    "core": { "statusId": "HexBlade Curse - Critical Threshold" },
                    "dae": { "specialDuration": [ "1Attack" ] }
            }
        }
        sourceActor = (await fromUuid(lastArg.tokenUuid)).actor;
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: sourceActor.uuid, effects: [effectData] });
        }
    }
    return;
}
