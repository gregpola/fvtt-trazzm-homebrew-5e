//thatlonelybugbear's Slasher automation for MidiQOL.
/*Usage as an Actor onUse Macro. 
A way to achieve this is:
1. Create a script hotbar macro and copy paste the following macro (named Slasher for the step below).
2a. On the actor either create an onUse Actor macro calling Slasher as an After Active Effects*
or
2b. Create an item for the Slasher feature with a DAE checking the box "Transfer to Actor on Item Equip" and an effect of:
	flags.midi-qol.onUseMacroName | CUSTOM | (ItemMacro?) Slasher,postActiveEffects 
*/
const version = "10.0.0";
const optionName = "Slasher";
const lastArg = args[args.length - 1];

try {
	if (args[0].hitTargets < 1 || args[0].damageDetail.filter(i=>i.type === "slashing").length < 1)
		return;
	
	const tactor = args[0].hitTargets[0].actor;
	if(args[0].isCritical && !tactor.effects.find(i=>i.label==="Slasher feat - Disadvantage on all attacks"))
		await applyTargetDisadvantageEffect();

	if (actor.unsetFlag('world', 'SlasherUsed') && !game.combat)
		await actor.unsetFlag('world', 'SlasherUsed');

	if (!game.combat && !tactor.effects.find(i=>i.label==="Slasher feat -10ft movement"))
		await applySpeedReduction();
	
	if (game.combat && !tactor.effects.find(i=>i.label==="Slasher feat -10ft movement")) {
		const combatTime = `${game.combat.id} - 100*${game.combat.round} + ${game.combat.turn}`;
		const lastTime = actor.getFlag('world', 'SlasherUsed');
		console.log(`Lasttime:${lastTime}, CombatTime:${combatTime}`);
		if (combatTime === lastTime) return;
		
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: "Slasher's feat movement reduction",
				content: "Do you want to reduce the creature's speed by 10ft?",
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
		if(result) { applySpeedReduction(combatTime) }
	}

} catch (err) {
    console.error(`Slasher feat ${version}`, err);
}

async function applyTargetDisadvantageEffect(time) {
	const effect_sourceData = {
		changes: [
			{ key: "flags.midi-qol.disadvantage.attack.all", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: 1, priority: 20 }
		],
		origin: args[0].itemUuid,
		duration: game.combat ? { rounds: 1, turns:0, startRound: `${game.combat.round}`, startTurn: `${game.combat.turn}`, startTime: `${game.time.worldTime}`} : {seconds: 6, startTime: `${game.time.worldTime}`},
		icon: "icons/skills/melee/strike-sword-gray.webp",
		label: "Slasher feat - Disadvantage on all attacks",
		flags: {dae: {specialDuration: ['turnStartSource']}},
	}
	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].hitTargetUuids[0], effects: [effect_sourceData] });
	if(game.combat) await actor.setFlag('world', 'SlasherUsed', `${time}`);
}

async function applySpeedReduction(time) {
    const effect_sourceData = {
        changes: [
            { key: "system.attributes.movement.all", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: -10, priority: 20 }
        ], 
        origin: args[0].itemUuid,
        duration: game.combat ? { rounds: 1, turns:0, startRound: `${game.combat.round}`, startTurn: `${game.combat.turn}`, startTime: `${game.time.worldTime}`} : {seconds: 6, startTime: `${game.time.worldTime}`},
        icon: "icons/skills/melee/strike-sword-gray.webp",
        label: "Slasher feat -10ft movement",
        flags: {dae: {specialDuration: ['turnStartSource']}},
    }
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].hitTargetUuids[0], effects: [effect_sourceData] });
    if(game.combat) await actor.setFlag('world', 'SlasherUsed', `${time}`);
}
