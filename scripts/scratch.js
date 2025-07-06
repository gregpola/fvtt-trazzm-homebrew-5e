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

		if (["tiny", "sm", "med", "lg"].includes(targetToken.actor.system.traits.size)) {

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

		flags.midi - qol.neverTarget
		system.attributes.attunement.max

		item.system.prof.hasProficiency
		foundry.utils.setProperty(lastChange, "value", totalLifeDrained);
		const isSurprised = actor.statuses.has("surprised");
		acBonusEffect.update({'disabled': false});
		
		
raceOrType.includes('undead')
['fiend', 'undead'].includes(typeOrRace)

@scale.bard.inspiration
@scale.paladin.aura

flags.dae.rest-recovery.force.maximiseHitDieRoll
foundry.utils.getProperty(actor, CONSTANTS.FLAGS.DAE.MAXIMISE_HIT_DIE_ROLL);

flags.automated-conditions-5e.save.advantage | Custom | riderStatuses.charmed || riderStatuses.frightened


		const _flagGroup = "fvtt-trazzm-homebrew-5e";
		const _flagName = "mastery-vex-target";
		let flag = actor.getFlag(_flagGroup, _flagName);
		await actor.setFlag(_flagGroup, _flagName, target.actor.uuid);
		await actor.unsetFlag(_flagGroup, _flagName);

		let effectIdsToRemove = actor.getRollData().effects.filter(e => e.origin === stuckEffect.origin).map(effect => effect.id);
		const damageDice = actor.system.scale.barbarian["brutal-strike"];

		ui.notifications.error(`${optionName}: ${version} - no shared language`);
		ChatMessage.create({
			content: `${targetToken.name} is stuck in the webs`,
			speaker: ChatMessage.getSpeaker({actor: originActor})
		});

		await targetToken.actor.toggleStatusEffect("poisoned", {active: false});

		'flags.fvtt-trazzm-homebrew-5e.DivineSmite.level OVERRIDE @scaling'

		const damageTypes = [['🧪 Acid', 'acid'], ['❄️ Cold', 'cold'], ['🔥 Fire', 'fire'], ['⚡ Lightning', 'lightning'], ['☁️ Thunder', 'thunder']];

		let browserUser = MidiQOL.playerForActor(origin.parent);
		if (!browserUser?.active) {
			console.info(`${optionName} - unable to locate the actor player, sending to GM`);
			browserUser = game.users?.activeGM;
		}

		const sourceActor = macroItem.parent;
		const sourceToken = await MidiQOL.tokenForActor(sourceActor);
		const userID = MidiQOL.playerForActor(target.actor)?.active?.id ?? game.users.activeGM?.id;

		const config = { undefined, ability: "wis", target: actor.system.attributes.spelldc };
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
		turn = start, rollType = save, saveAbility = con, saveDamage = halfdamage, saveRemove = false, saveMagic = true, damageType = radiant, damageRoll = (@spellLevel)d10, saveDC = @attributes.spelldc
		turn = end, saveAbility = wis, saveDC = 19, label = Frightened
		label=Watery Grapple, turn = start, damageType = bludgeoning, damageRoll = 2d8

			// options = { maxSize: undefined, includeIncapacitated: false, canSee: false }
		let secondTarget = await MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.FRIENDLY, ttoken, 5, {canSee: true});

