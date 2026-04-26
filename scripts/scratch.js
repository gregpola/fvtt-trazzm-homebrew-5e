/*
	
*/
const optionName = "Precision";
const version = "13.5.0";

try {
	if (args[0].macroPass === "postActiveEffects") {
	}

} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}


console.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Bag of Tricks (Gray)");
ui.notifications.error(`${optionName}: ${version} - missing Font of Magic`);

// Macro breakpoints:
// foundry.mjs line 45533

// Useful references
if (!["mwak", "rwak", "msak", "rsak"].includes(rolledActivity.actionType))
    if (!["rwak", "mwak", "rsak", "msak"].includes(macroActivity.actionType))
		if (["tiny", "sm", "med", "lg"].includes(targetToken.actor.system.traits.size)) {

		actor.system.abilities.cha.mod

		const characterLevel = actor.type === "character" ? actor.system.details.level : actor.system.details.cr;
		const wizardLevel = actor.classes?.wizard?.system?.levels ?? 0;
		const rogueLevels = actor.getRollData().classes?.rogue?.levels;
		const pb = actor.system.attributes.prof;
		const actorDC = actor.system.attributes.spell.dc ?? 12;
		const spellcastingAbility = actor.system.attributes.spellcasting;
		const abilityBonus = actor.system.attributes.spell.mod;
		const spellLevel = workflow.castData.castLevel;
		const abilityBonus = Math.max(rollingActor.system.abilities.str.mod, rollingActor.system.abilities.dex.mod);
		max(1, @abilities.wis.mod)

		flags.midi - qol.neverTarget
		system.attributes.attunement.max

		item.system.prof.hasProficiency
		foundry.utils.setProperty(lastChange, "value", totalLifeDrained);
		const isSurprised = actor.statuses.has("surprised");
		acBonusEffect.update({'disabled': false});
        system.attributes.concentration.roll.mode
		
		flags.midi-qol.canFlank

label="Fire Rune - Shackled", turn=end, saveDC=@abilities.str.mod + 8 + @attributes.prof, saveAbility=str, saveCount=1-
label="Fire Rune - Burning", turn=start, damageRoll=2d6, damageType=fire

reaction === 'manual'
reaction == 'isDamaged' && activity?.hasAttack
reaction === 'isDamaged' && ['bludgeoning', 'piercing', 'slashing'].some(type=>damageTypes[type])

Array.from(actor.allApplicableEffects())
await TrazzmHomebrew.weaponMastery.workflow(workflow, macroItem);

raceOrType.includes('undead')
['fiend', 'undead'].includes(typeOrRace)

			Compendium.dnd-players-handbook.classes.Item.phbftrCombatSupe

@scale.bard.inspiration
@scale.paladin.aura
@scale.battle-master.superiority.die

workflow.hitTargets.size
token.actor.system.attributes.hp.value > 0

flags.dae.rest-recovery.force.maximiseHitDieRoll
foundry.utils.getProperty(actor, CONSTANTS.FLAGS.DAE.MAXIMISE_HIT_DIE_ROLL);

Roll Formula: 1d8 --> -@utilityRollTotal

flags.automated-conditions-5e.save.advantage | Custom | riderStatuses.charmed || riderStatuses.frightened
radius=30; allies; bonus=1d4; radiant; !isSpell
['mwak', 'rwak'].some(type => actionType[type])

const distance = canvas.grid.measurePath([template, token.document]).distance;
const cost = canvas.grid.measurePath([template, token.document]).cost;


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

		const config = { undefined, ability: "wis", target: actor.system.attributes.spell.dc };
		const dialog = {};
		const message = { data: { speaker: ChatMessage.implementation.getSpeaker({ actor: targetToken.actor }) } };
		let saveResult = await targetToken.actor.rollSavingThrow(config, dialog, message);
		if (!saveResult[0].isSuccess) {
			await applyEffects(targetToken, actor.system.attributes.spell.dc, spellLevel);
		}

		let targetToken = macroActivity.targets.first();
		if (targetToken) {
			await targetToken.actor.toggleStatusEffect('prone', {active: true});
		}

		// Overtime setup to remove a condition on save
		label="Prismatic Spray - Indigo Ray", turn=end, saveDC=@attributes.spell.dc, saveAbility=con, saveCount=3-, failCount=3-petrified

			// options = { maxSize: undefined, includeIncapacitated: false, canSee: false }
		let secondTarget = await MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.FRIENDLY, ttoken, 5, {canSee: true});


<section class="secret">
    <p><strong>Foundry Note</strong></p>
    <p>This feature includes an Active Effect which automatically increases your walking Speed but does not automate the Advantage.</p>
</section>

let activity = await macroItem.system.activities.find(a => a.identifier === 'sheath-in-booming-energy');
let activity = macroItem.system.activities.getName("Protect Target");
if (activity) {
    const options = {
        midiOptions: {
            targetsToUse: new Set(targets),
            noOnUseMacro: false,
            configureDialog: true,
            showFullCard: false,
            ignoreUserTargets: false,
            checkGMStatus: true,
            autoRollAttack: false,
            autoRollDamage: "always",
            fastForwardAttack: false,
            fastForwardDamage: true,
            workflowData: false
        }
    };

    await MidiQOL.completeActivityUse(activity, options, {}, {});
}

for (let targetToken of workflow.failedSaves) {
	await targetToken.actor.toggleStatusEffect('prone', {active: true});
}
