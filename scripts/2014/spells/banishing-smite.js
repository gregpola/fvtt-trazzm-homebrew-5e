/*
	The next time you hit a creature with a weapon attack before this spell ends, your weapon crackles with force, and
	the attack deals an extra 5d10 force damage to the target.

	Additionally, if this attack reduces the target to 50 hit points or fewer, you banish it. If the target is native to
	a different plane of existence than the one you’re on, the target disappears, returning to its home plane. If the
	target is native to the plane you’re on, the creature vanishes into a harmless demiplane. While there, the target is
	Incapacitated. It remains there until the spell ends, at which point the target reappears in the space it left or in
	the nearest unoccupied space if that space is occupied.
 */
const version = "11.0";
const optionName = "Banishing Smite";
const flagName = "blinding-smite-used";
const damageType = game.i18n.localize("force");

try {
	const target = workflow.hitTargets.first();

	if (args[0].macroPass === "DamageBonus") {
		// validate targeting
		if (!actor || !target) {
		  console.log(`${optionName}: no target selected`);
		  return {};
		}

		// make sure it's an allowed attack
		if (!["mwak", "rwak"].includes(workflow.item.system.actionType)) {
			console.log(`${optionName}: not an eligible attack: ${workflow.item.system.actionType}`);
			return {};
		}

		// check if used (for handling burning)
		let flag = actor.getFlag("fvtt-trazzm-homebrew-5e", flagName);
		if (flag) {
			console.log(`${optionName}: already applied the damage bonus`);
			return {};
		}

		// set the flag
		await actor.setFlag("fvtt-trazzm-homebrew-5e", flagName, target.actor.uuid);
		await anime(token, target);

		// add damage bonus
		if (workflow.isCritical) {
			return {damageRoll: `5d10+50[${damageType}]`, flavor: optionName};
		}
		return {damageRoll: `5d10[${damageType}]`, flavor: optionName};
	}
	else if (args[0] === "off") {
		// delete the used flag
		const lastFlag = actor.getFlag("fvtt-trazzm-homebrew-5e", flagName);
		if (lastFlag) {
			await actor.unsetFlag("fvtt-trazzm-homebrew-5e", flagName);
		}
	}

} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}

async function anime(token, target) {
	new Sequence()
		.effect()
		.file("jb2a.misty_step.01.purple")
		.atLocation(target)
		.scaleToObject(2)
		.play();
}
