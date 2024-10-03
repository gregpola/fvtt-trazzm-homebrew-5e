/*
	The first time you hit with a melee weapon attack during this spell’s duration, your weapon rings with thunder that
	is audible within 300 feet of you, and the attack deals an extra 2d6 thunder damage to the target. Additionally, if
	the target is a creature, it must succeed on a Strength saving throw or be pushed 10 feet away from you and knocked Prone.
 */
const version = "12.3.0";
const optionName = "Thunderous Smite";
const squaresPushed = 2;
const damageType = game.i18n.localize("thunder");

try {
	if (args[0].macroPass === "DamageBonus") {
		const target = workflow.hitTargets.first();

		// validate targeting
		if (!actor || !target) {
		  console.log(`${optionName}: no target selected`);
		  return {};
		}

		// make sure it's an allowed attack
		if (!["mwak"].includes(workflow.item.system.actionType)) {
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}

		// push the target logic
		const ability = actor.system.attributes.spellcasting;
		const abilityBonus = actor.system.abilities[ability].mod;
		const dc = 8 + actor.system.attributes.prof + abilityBonus;
		let saveType = game.i18n.localize("str");
		let save = await MidiQOL.socket().executeAsGM("rollAbility", { request: "save", targetUuid: target.actor.uuid, ability: saveType,
			options: { chatMessage: true, fastForward: false } });
			
	    if (save.total < dc) {
			await game.dfreds?.effectInterface.addEffect({ effectName: 'Prone', uuid: target.actor.uuid });
			await wait(300);
			await HomebrewMacros.pushTarget(token, target, squaresPushed);
		}

		await anime(token, target);

		// add damage bonus
		if (workflow.isCritical)
			return {damageRoll: `2d6+12[${damageType}]`, flavor: optionName};
		return {damageRoll: `2d6[${damageType}]`, flavor: optionName};
	}


} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}

async function anime(token, target) {
	new Sequence()
		.effect()
		.file("jb2a.misty_step.01.blue")
		.atLocation(target)
		.scaleToObject(2)
		.play();
}

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
