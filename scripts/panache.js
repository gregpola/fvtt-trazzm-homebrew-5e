const version = "10.0.0";
const optionName = "Panache";

//#############################################################################
// Midi-Qol On Use afterActiveEffects (preambleComplete)
//
// Runs an opposed skill check
// If the target is hostile, it's attacks have disadavantage against all but the source
// If not, the target is charmed
// 
//#############################################################################

const effectNameHostile = "Disadvantage against others";

try {
	if (args[0].hitTargets.length <1) return {};

	const duration = game.combat ? {combat:game.combat.uuid, rounds:1, turns:0, startRound: game.combat.round, startTurn: game.combat.turn, startTime: game.time.worldTime} : {seconds:6, startTime:game.time.worldTime};

	if (args[0].item.name === optionName) {
		const target = args[0]?.targets[0];
		const targetActor = target?.actor;
		const targetId = args[0].targetUuids[0];
		const sourceOrigin = args[0]?.tokenUuid;
		const attacker = canvas.tokens.get(args[0].tokenId);
		
		// run opposed check
		let results = await game.MonksTokenBar.requestContestedRoll(
		{
			token:attacker, 
			request:'skill:per'
		},
		{
			token: target,
			request: 'skill:ins'
		},
		{
			silent:true, 
			fastForward:true,
			flavor: `${target.name} tries to resist ${attacker.name}'s ${optionName}`
		});
		
		// if hostile versus not-hostile effect
		if (results) {
			const attackerTotal = results.tokenresults[0].roll.total;
			const targetTotal = results.tokenresults[1].roll.total;
			
			if (attackerTotal >= targetTotal) {
				if (target.disposition !== attacker.document.disposition) {
					const hasHostileEffect = findEffect(targetActor, effectNameHostile, sourceOrigin);
					if (hasHostileEffect) {
						await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetId, effects: [hasHostileEffect.id] });
					}
					
					const hostileEffectData = {
						changes:[{
							key: 'flags.midi-qol.onUseMacroName',
							mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
							value: `ItemMacro.${args[0].itemUuid},preAttackRoll`,
						}],
						origin: sourceOrigin,
						duration: {startTime: game.time.worldTime, seconds: 60},
						label: effectNameHostile,
						icon: args[0].item.img,
						flags: {
							dae: {
								selfTarget: false,
								stackable: "none",
								durationExpression: "",
								macroRepeat: "none",
								specialDuration: [],
								transfer: false
							}
						},
						disabled: false
					};
					await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetId, effects: [hostileEffectData] });
					
				}
				else {
					const hasCharmedEffect = findEffect(targetActor, "Charmed", sourceOrigin);
					if (hasCharmedEffect) {
						await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetId, effects: [hasCharmedEffect.id] });
					}
					
					const charmedEffectData = {
						label: "Charmed",
						icon: "modules/dfreds-convenient-effects/images/charmed.svg",
						origin: sourceOrigin,
						duration: {startTime: game.time.worldTime, seconds: 60},
						changes: [
							{
								key: 'macro.CE',
								mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
								value: "Charmed",
								priority: 20
							}
						],
						flags: {
							dae: {
								selfTarget: false,
								stackable: "none",
								durationExpression: "",
								macroRepeat: "none",
								specialDuration: [
									"isDamaged", "isSave"
								],
								transfer: false
							}
						},
						disabled: false
					};
					await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetId, effects: [charmedEffectData] });
				}
			}
		}
	}
	
	// check for disadvantage on attacks
	if (args[0].macroPass === "preAttackRoll") {
		const shouldHaveDisadvantage = await checkHostileDisadvantage(args[0].actor, args[0].hitTargetUuids[0]);
		if (shouldHaveDisadvantage) {
			setProperty(args[0].workflowOptions, "disadvantage", true);
		}
	}
	
} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}

async function findEffect(actor, effectName, origin) {
    let effectUuid = null;
    effectUuid = actor?.effects?.find(ef => ef.label === effectName && ef.origin === origin);
    return effectUuid;
}

async function checkHostileDisadvantage(actor, targetId) {
	let effect = await findEffect(actor, effectNameHostile, targetId);
	return effect ? false : true;
}
