const version = "12.3.0";
const optionName = "Fey Step (Winter)";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// Apply frightened to nearby target of the actor's choice
		const potentialTargets = MidiQOL.findNearby(null, token, 5);
		if (potentialTargets.length > 0) {
			let frightTarget = null;
			
			let target_list = await potentialTargets.reduce((list, target) => list += `<option value="${target.document.id}">${target.actor.name}</option>`, ``);
			let selectedTarget = await new Promise((resolve) => {
				new Dialog({
					title: optionName,
					content: `<p>Pick a target to frighten</p><form><div class="form-group"><select id="hitTarget">${target_list}</select></div></form>`,
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
			frightTarget = await selectedTarget;
			
			if (frightTarget) {
				const saveDC = actor.system.attributes.spelldc;
				const saveFlavor = `${CONFIG.DND5E.abilities["wis"].label} DC${saveDC} ${optionName}`;
				const sourceOrigin = args[0]?.tokenUuid;
			
				const effectData = {
					label: "Frightened",
					icon: "modules/dfreds-convenient-effects/images/frightened.svg",
					origin: sourceOrigin,
					duration: {startTime: game.time.worldTime, seconds: 60},
					changes: [
						{
							key: 'macro.CE',
							mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
							value: "Frightened",
							priority: 20
						}
					],
					flags: {
						dae: {
							selfTarget: false,
							stackable: "none",
							durationExpression: "",
							macroRepeat: "none",
							specialDuration: ["turnEndSource"],
							transfer: false
						}
					},
					disabled: false
				};

				let saveRoll = await frightTarget.actor.rollAbilitySave("wis", {flavor: saveFlavor, damageType: "frightened"});
				await game.dice3d?.showForRoll(saveRoll);			

				if (saveRoll.total < saveDC) {
					await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: frightTarget.actor.uuid, effects: [effectData] });
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
