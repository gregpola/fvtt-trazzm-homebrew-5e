const version = "12.3.1";
const optionName = "Fey Step (Winter)";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// Apply frightened to nearby target of the actor's choice
		const potentialTargets = MidiQOL.findNearby(null, token, 5);
		if (potentialTargets.length > 0) {
			let target_list = await potentialTargets.reduce((list, target) => list += `<option value="${target.document.id}">${target.actor.name}</option>`, ``);

			let frightTarget = await foundry.applications.api.DialogV2.prompt({
				content: `<p>Pick a target to frighten</p><form><div class="form-group"><select id="hitTarget">${target_list}</select></div></form>`,
				rejectClose: false,
				ok: {
					callback: (event, button, dialog) => {
						console.log(button.form.elements);
						const targetId = button.form.elements.hitTarget.value;
						if (targetId) {
							return canvas.tokens.get(targetId);
						}
						return false;
					}
				},
				window: {
					title: `${optionName}`
				},
				position: {
					width: 400
				}
			});

			if (frightTarget) {
				const saveDC = actor.system.attributes.spelldc;
				const saveFlavor = `${CONFIG.DND5E.abilities["wis"].label} DC${saveDC} ${optionName}`;
				let saveRoll = await frightTarget.actor.rollAbilitySave("wis", {flavor: saveFlavor, damageType: "frightened"});
				await game.dice3d?.showForRoll(saveRoll);			

				if (saveRoll.total < saveDC) {
					await HomebrewEffects.applyFrightenedEffect(frightTarget.actor, item, ["turnEndSource"]);
				}
			}
		}

		// transport the caster
		const maxRange = item.system.range.value ?? 30;
		await HomebrewMacros.teleportToken(token, maxRange);
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
