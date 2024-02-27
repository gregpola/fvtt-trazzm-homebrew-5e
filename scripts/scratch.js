/*
	
*/
const version = "11.0";
const optionName = "Precision";

try {

} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}


console.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Bag of Tricks (Gray)");
ui.notifications.error(`${optionName}: ${resourceName}: - no resource found`);

// Useful references
if (!["mwak", "rwak", "msak", "rsak"].includes(workflow.item.system.actionType)) {

const tsize = targetTokenDoc.actor.system.traits.size;
if (!["tiny","sm","med","lg"].includes(tsize)) {

const characterLevel = actor.type === "character" ? actor.system.details.level : actor.system.details.cr;
const rogueLevels = actor.getRollData().classes?.rogue?.levels;
const pb = actor.system.attributes.prof;
const actorDC = actor.system.attributes.spelldc ?? 12;
const spellcastingAbility = actor.system.attributes.spellcasting;
const abilityBonus = actor.system.abilities[spellcastingAbility].mod;
const spellLevel = workflow.castData.castLevel;
const abilityBonus = Math.max(rollingActor.system.abilities.str.mod, rollingActor.system.abilities.dex.mod);

flags.midi-qol.neverTarget

item.system.prof.hasProficiency


	const _flagGroup = "fvtt-trazzm-homebrew-5e";
	await actor.setFlag(_flagGroup, flagName, target.actor.uuid);
	let flag = actor.getFlag(_flagGroup, flagName);
	await actor.unsetFlag(_flagGroup, flagName);

	ui.notifications.error(`${optionName}: ${version} - no shared language`);


	ChatMessage.create({
		content: `${actorToken.name}'s ${selectedItem.name} is blessed with positive energy`,
		speaker: ChatMessage.getSpeaker({ actor: actor })});



	function isAvailableThisTurn() {
	if (game.combat) {
		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag("midi-qol", timeFlag);
		if (combatTime === lastTime) {
			return false;
		}
		return true;
	}
	return false;
}

	await game.MonksTokenBar.requestRoll(targets, {
		request:[{"type": "save", "key": "con"}],
		dc:saveDC, showdc:true, silent:true, fastForward:false,
		flavor:`${optionName} - Enervating Breath`,
		rollMode:'roll',
		callback: async (result) => {
			console.log(result);
			for (let tr of result.tokenresults) {
				if (!tr.passed) {
					// mark incapacitated
					await MidiQOL.socket().executeAsGM("createEffects",
						{ actorUuid: tr.actor.uuid, effects: [enervationEffectData] });
				}
			}
		}
	});



	macro.tokenMagic
	system.attributes.exhaustion = 2;
	system.attributes.ac.bonus

	let saveRoll = await targetActor.rollAbilitySave("con", {flavor: saveFlavor});

	await game.dice3d?.showForRoll(saveRoll);
	

	// bluish color
	// #5570B8
	
	await game.dfreds.effectInterface.removeEffect({effectName: 'Incapacitated', uuid:actor.uuid});


	// Hit point level values
	targetTokenDoc.actor.classes.barbarian.advancement.byType.HitPoints (array, first has the hp rolls)
	
// vertime setup to remove a condition on save
turn=end, saveAbility=wis, saveDC=19, label=Frightened
turn=end, saveAbility=wis, saveDC=19, label=Stunned
turn=end, saveAbility=con, saveDC=12, label=Poisoned
turn=start, damageRoll=2d6, damageType=poison, label=Constricted
turn=start, damageRoll=10, damageType=radiant, label=Holy Nimbus

flags.midi-qol.optional.BardicInspiration.ac

// options = { maxSize: undefined, includeIncapacitated: false, canSee: false }
let secondTarget = await MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.FRIENDLY, ttoken, 5, {canSee: true});


// Monks token bar
let message = await game.MonksTokenBar.requestRoll([targetToken], {request:'save:con', flavor: 'Poisoned weapon', silent: true});
await wait(10000);
let tokenid = 'token' + targetToken.id;
saveTotal = message.flags["monks-tokenbar"][tokenid].total;


	const userID = MidiQOL.playerForActor(target.actor)?.active?.id ?? game.users.activeGM?.id;
	if (!userID) {

		return;
	}
	const data = {
		request: 'save',
		targetUuid: targetToken.document.uuid,
		ability: 'str',
		options: {
			skipDialogue: true,
			saveDC,
		},
	};
	const save = await MidiQOL.socket().executeAsUser('rollAbility', userID, data);
	if (save.total < save.options.targetValue) {
//do the deed
	}



async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }

await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: originalActor.uuid, effects: [itemEffect.id] });

async function findEffect(actor, effectName) {
    let effect = null;
    effect = actor?.effects.find(ef => ef.name === effectName);
    return effect;
}

function hasEffectApplied(effectName, actor) {
  return actor.effects.find((ae) => ae.name === effectName) !== undefined;
}

async function findEffect(actor, effectName, origin) {
    let effect = null;
    effect = actor?.effects?.find(ef => ef.name === effectName && ef.origin === origin);
    return effect;
}

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); });}



		const dependencies = ["dae", "itemacro", "times-up", "midi-qol"];
		if (!requirementsSatisfied(defaultItemName, dependencies)) {
			return;
		}

		/**
		 * If the requirements are met, returns true, false otherwise.
		 *
		 * @param {string} name - The name of the item for which to check the dependencies.
		 * @param {Array} dependencies - The array of module ids which are required.
		 *
		 * @returns {boolean} true if the requirements are met, false otherwise.
		 */
		function requirementsSatisfied(name, dependencies) {
			let missingDep = false;
			dependencies.forEach((dep) => {
				if (!game.modules.get(dep)?.active) {
					const errorMsg = `${name}: ${dep} must be installed and active.`;
					ui.notifications.error(errorMsg);
					console.warn(errorMsg);
					missingDep = true;
				}
			});
			return !missingDep;
		}

