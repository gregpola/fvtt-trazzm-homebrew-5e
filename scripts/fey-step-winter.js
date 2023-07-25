const version = "10.3";
const optionName = "Fey Step (Winter)";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const lastArg = args[args.length - 1];
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		let actorToken = canvas.tokens.get(lastArg.tokenId);
		const maxRange = lastArg.item.system.range.value ?? 30;

		// Apply frightened to nearby target of the actor's choice
		const potentialTargets = MidiQOL.findNearby(null, actorToken, 5);
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
				// TODO await anime();
				const saveDC = actor.system.attributes.spelldc;
				const saveFlavor = `${CONFIG.DND5E.abilities["wis"]} DC${saveDC} ${optionName}`;
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
		let position = await HomebrewMacros.warpgateCrosshairs(actorToken, maxRange, lastArg.item, actorToken);
		if (position) {
			// check for token collision
			const newCenter = canvas.grid.getSnappedPosition(position.x - actorToken.width / 2, position.y - actorToken.height / 2, 1);
			if (HomebrewMacros.checkPosition(actorToken, newCenter.x, newCenter.y)) {
				ui.notifications.error(`${optionName} - can't teleport on top of another token`);
				return false;
			}
			
			const portalScale = actorToken.w / canvas.grid.size * 0.7;		
			new Sequence()
				.effect()
				.file("jb2a.misty_step.01.green")       
				.atLocation(actorToken)
				.scale(portalScale)
				.fadeOut(200)
				.wait(500)
				.thenDo(() => {
					canvas.pan(position)
				})
				.animation()
				.on(actorToken)
				.teleportTo(position, { relativeToCenter: true })
				.fadeIn(200)
				.effect()
				.file("jb2a.misty_step.02.blue")
				.atLocation({x: position.x, y: position.y})
				.scale(portalScale)
				.anchor(0.5,0.5)
				.play();
		}
		else {
			ui.notifications.error(`${optionName} - invalid teleport location`);
			return false;
		}
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
