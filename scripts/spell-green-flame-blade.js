const version = "10.0.0";
const optionName = "Green-Flame Blade";
try {
	if (args[0].macroPass === "DamageBonus") {
		const lastArg = args[args.length - 1];
		const tokenD = canvas.tokens.get(lastArg.tokenId);
		const actorD = tokenD.actor;
		const actorData = actorD.getRollData();
		const itemD = lastArg.item;
		let mainTarget = await lastArg.hitTargets.values().next().value;
		let ttoken = canvas.tokens.get(args[0].hitTargets[0].object.id);
		let secondTarget = await MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.FRIENDLY, ttoken, 5, null);

		// Must be a melee weapon attack
		if (!["mwak"].includes(args[0].itemData.system.actionType))
			return {}; // weapon attack

		// Build damage bonuses
		let level = actorData.details?.level ?? actorData.details?.cr;
		let spellStat = actorData.attributes.spellcasting;
		if (spellStat === "") spellStat = "int";
		let spellcasting = actorData.abilities[spellStat].mod;
		const baseDice = Math.floor((level + 1) / 6);
		
		// apply damage to nearby target
		let damageFormula = (baseDice > 0) ? `${baseDice}d8[fire] + ${spellcasting}` : `${spellcasting}[fire]`;
		let finalTarget = null;
		if (secondTarget.length === 1) {
			finalTarget = await secondTarget[0];
		}
		else if (secondTarget.length > 1) {
			let target_list = await secondTarget.reduce((list, target) => list += `<option value="${target.document.id}">${target.actor.name}</option>`, ``);
			let selectedTarget = await new Promise((resolve) => {
				new Dialog({
					title: optionName,
					content: `<p>Pick a secondary target</p><form><div class="form-group"><select id="hitTarget">${target_list}</select></div></form>`,
					buttons: {
						attack: {
							label: "Confirmed", callback: async (html) => {
								let targetId = await html.find('#hitTarget')[0].value;
								resolve(canvas.tokens.get(targetId));
							}
						}
					}
				}).render(true);
			});
			finalTarget = await selectedTarget;
		}

		if (finalTarget) {
			await anime(tokenD, finalTarget);
			let damageRoll = await new game.dnd5e.dice.DamageRoll(damageFormula, actorData).evaluate({async:true});
			await new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, "fire", [finalTarget], damageRoll, { flavor: `(${optionName})`, itemData: itemD, itemCardId: "new" });
			await game.dice3d?.showForRoll(damageRoll);			
		}
		
		// apply extra damage to the initial target
		if (baseDice > 0) {
			await anime(tokenD, ttoken);
			let damageRoll0 = await new game.dnd5e.dice.DamageRoll(`${baseDice}d8[fire]`, actorData, { critical: lastArg.isCritical });
			await game.dice3d?.showForRoll(damageRoll0);
			return {damageRoll: damageRoll0.formula, flavor: `${optionName}`};
		}
	}

	return {};

} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.flames.green.01")        
        .atLocation(target)
		.scaleToObject(2)
		.play();
}