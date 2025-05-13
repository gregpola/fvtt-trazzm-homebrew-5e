/*
	
*/
const optionName = "Precision";
const version = "12.4.0";

try {
	if (args[0].macroPass === "postActiveEffects") {
	}
} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}


console.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Bag of Tricks (Gray)");
ui.notifications.error(`${optionName}: ${version} - missing Font of Magic`);

// Useful references
if (!["mwak", "rwak", "msak", "rsak"].includes(workflow.item.system.actionType)) {

	const tsize = targetToken.actor.system.traits.size;
	if (["tiny", "sm", "med", "lg"].includes(tsize)) {

		actor.system.abilities.cha.mod

		const characterLevel = actor.type === "character" ? actor.system.details.level : actor.system.details.cr;
		const rogueLevels = actor.getRollData().classes?.rogue?.levels;
		const pb = actor.system.attributes.prof;
		const actorDC = actor.system.attributes.spelldc ?? 12;
		const spellcastingAbility = actor.system.attributes.spellcasting;
		const abilityBonus = actor.system.attributes.spellmod;
		const spellLevel = workflow.castData.castLevel;
		const abilityBonus = Math.max(rollingActor.system.abilities.str.mod, rollingActor.system.abilities.dex.mod);
		max(1, @abilities.wis.mod)
		max(1, @abilities.cha.mod)

		flags.midi - qol.neverTarget
		system.attributes.attunement.max

		item.system.prof.hasProficiency
		foundry.utils.setProperty(lastChange, "value", totalLifeDrained);
		const isSurprised = actor.statuses.has("surprised");
		acBonusEffect.update({'disabled': false});


		const _flagGroup = "fvtt-trazzm-homebrew-5e";
		const _flagName = "mastery-vex-target";
		const _poisonedWeaponFlag = "poisoned-weapon";
		await actor.setFlag(_flagGroup, flagName, target.actor.uuid);
		let flag = actor.getFlag(_flagGroup, flagName);
		await actor.unsetFlag(_flagGroup, flagName);

		actor.getRollData().effects.find(eff => eff.name === name);
		let effectIdsToRemove = actor.getRollData().effects.filter(e => e.origin === stuckEffect.origin).map(effect => effect.id);


		ui.notifications.error(`${optionName}: ${version} - no shared language`);
		ChatMessage.create({
			content: `${actorToken.name}'s ${selectedItem.name} is blessed with positive energy`,
			speaker: ChatMessage.getSpeaker({actor: actor})
		});

		await targetToken.actor.toggleStatusEffect("poisoned", {active: false});

		'flags.fvtt-trazzm-homebrew-5e.DivineSmite.level OVERRIDE @scaling'

		const damageTypes = [['🧪 Acid', 'acid'], ['❄️ Cold', 'cold'], ['🔥 Fire', 'fire'], ['⚡ Lightning', 'lightning'], ['☁️ Thunder', 'thunder']]; //All possible damage types

		let browserUser = MidiQOL.playerForActor(origin.parent);
		if (!browserUser?.active) {
			console.info(`${optionName} - unable to locate the actor player, sending to GM`);
			browserUser = game.users?.activeGM;
		}

		await game.MonksTokenBar.requestRoll([{token: targetToken}], {
			request: [{"type": "save", "key": "con"}],
			dc: saveDC, showdc: true, silent: true, fastForward: false,
			flavor: `${optionName} - Enervating Breath`,
			rollMode: 'roll',
			callback: async (result) => {
				console.log(result);
				for (let tr of result.tokenresults) {
					if (!tr.passed) {
						// mark incapacitated
						await MidiQOL.socket().executeAsGM("createEffects",
							{actorUuid: tr.actor.uuid, effects: [enervationEffectData]});
					}
				}
			}
		});


		await game.MonksTokenBar.requestContestedRoll(
			{token: token, request: 'skill:ath'},
			{token: targetToken, request: `skill:${skilltoberolled}`},
			{
				silent: true,
				fastForward: false,
				flavor: `${targetToken.name} tries to resist ${token.name}'s grapple attempt`,
				callback: async (result) => {
					if (result.tokenresults[0].passed) {
						await HomebrewMacros.applyGrappled(token, targetToken, item, 'opposed', null, null);
						ChatMessage.create({'content': `${token.name} grapples ${targetToken.name}`})
					} else {
						ChatMessage.create({'content': `${actor.name} fails to grapple ${targetToken.name}`});
					}
				}
			});

		const config = { event, ability: "wis", target: actor.system.attributes.spelldc };
		const dialog = {};
		const message = { data: { speaker: ChatMessage.implementation.getSpeaker({ actor: targetToken.actor }) } };
		let saveResult = await targetToken.actor.rollSavingThrow(config, dialog, message);
		if (!saveResult[0].isSuccess) {
			await applyEffects(targetToken, actor.system.attributes.spelldc, spellLevel);
		}

		let targetToken = macroActivity.targets.first();
		if (targetToken) {
			await targetToken.actor.toggleStatusEffect('prone', {active: true});
		}

// Overtime setup to remove a condition on save
		turn=end, saveAbility=wis, saveDC=@attributes.spelldc, label=Wrathful Smite
		turn = start, rollType = save, saveAbility = con, saveDamage = halfdamage, saveRemove = false, saveMagic = true, damageType = radiant, damageRoll = (@spellLevel)
		d10, saveDC = @attributes.spelldc

		turn = end, saveAbility = wis, saveDC = 19, label = Frightened
		turn = end, saveAbility = wis, saveDC = 19, label = Stunned
		turn = end, saveAbility = con, saveDC = 12, label = Poisoned
		turn = start, damageRoll = 2
		d6, damageType = poison, label = Constricted
		turn = start, damageRoll = 10, damageType = radiant, label = Holy
		Nimbus

		flags.midi - qol.optional.BardicInspiration.ac

// options = { maxSize: undefined, includeIncapacitated: false, canSee: false }
		let secondTarget = await MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.FRIENDLY, ttoken, 5, {canSee: true});


// Monks token bar
		let message = await game.MonksTokenBar.requestRoll([targetToken], {
			request: 'save:con',
			flavor: 'Poisoned weapon',
			silent: true
		});
		await wait(10000);
		let tokenid = 'token' + targetToken.id;
		saveTotal = message.flags["monks-tokenbar"][tokenid].total;


		const userID = MidiQOL.playerForActor(target.actor)?.active?.id ?? game.users.activeGM?.id;
		if (!userID) {

			return;
		}
