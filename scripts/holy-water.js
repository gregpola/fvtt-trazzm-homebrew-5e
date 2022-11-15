if (args[0].hitTargets.length > 0) {
	let target = args[0].hitTargets[0];
	const ctype = target.actor.data.data?.details?.type?.value;
	if (ctype && ["undead", "fiend"].includes(ctype.toLowerCase())) {
		let damageRoll = new Roll(`2d6`).roll({async:false});
		game.dice3d?.showForRoll(damageRoll);
		new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "radiant", [target], damageRoll, {flavor: `(Radiant)`, 
			itemCardId: args[0].itemCardId, useOther: false});
	}
}
