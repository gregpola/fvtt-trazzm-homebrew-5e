const version = "11.0";
const optionName = "Fey Step";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const maxRange = item.system.range.value ?? 30;

		// transport the caster		
		let position = await HomebrewMacros.warpgateCrosshairs(token, maxRange, item, token);
		if (position) {
			// check for token collision
			const newCenter = canvas.grid.getSnappedPosition(position.x - token.width / 2, position.y - token.height / 2, 1);
			if (HomebrewMacros.checkPosition(token, newCenter.x, newCenter.y)) {
				return ui.notifications.error(`${optionName} - can't teleport on top of another token`);
			}
			
			const portalScale = token.w / canvas.grid.size * 0.7;		
			new Sequence()
				.effect()
				.file("jb2a.misty_step.01.green")       
				.atLocation(token)
				.scale(portalScale)
				.fadeOut(200)
				.wait(500)
				.thenDo(() => {
					canvas.pan(position)
				})
				.animation()
				.on(token)
				.teleportTo(position, { relativeToCenter: true })
				.waitUntilFinished()
				.fadeIn(200)
				.effect()
				.file("jb2a.misty_step.02.blue")
				.atLocation({x: position.x, y: position.y})
				.scale(portalScale)
				.wait(500)
				.thenDo(async() => {await attemptCharm(actor, token);})
				.play();
		}
		else {
			ui.notifications.error(`${optionName} - invalid fey step location`);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function attemptCharm(actor, token) {
	// Ask which target to try to charm
	const potentialTargets = MidiQOL.findNearby(null, token, 10);
	if (potentialTargets.length === 0) {
		console.log(`${optionName} - no targets within 10 feet to charm`);
		return;
	}

	// build the radio options
	let options = [];
	for(let t of potentialTargets) {
		options.push({
			type: "radio",
			label: t.name,
			value: t.actor.uuid
		});
	}

	const menuOptions = {};
	menuOptions["buttons"] = [
		{ label: "Charm", value: true },
		{ label: "Cancel", value: false }
	];
	menuOptions["inputs"] = options;

	let choice = await warpgate.menu(menuOptions,
		{ title: `Pick your charm target:`, options: { height: "100%", width: "150px" } });
	if(!choice.buttons) return;

	const selectedIndex = choice.inputs.indexOf(true);
	let targetId = options[selectedIndex].value;
	if (targetId) {
		const targetActor = MidiQOL.MQfromActorUuid(targetId);
		if (targetActor) {
			let saveDC = actor.system.attributes.spelldc;
			let spellDCFlag = actor.getFlag("fvtt-trazzm-homebrew-5e", "spell-dc");
			if (spellDCFlag) {
				saveDC = spellDCFlag;
			}
			const saveFlavor = `${CONFIG.DND5E.abilities["wis"]} DC${saveDC} ${optionName}`;
			let saveRoll = await targetActor.rollAbilitySave("wis", {flavor: saveFlavor, damageType: "charm"});
			await game.dice3d?.showForRoll(saveRoll);

			if (saveRoll.total < saveDC) {
				const charmedEffectData = {
					name: "Fey Step - Mirthful",
					icon: "modules/dfreds-convenient-effects/images/charmed.svg",
					origin: actor.uuid,
					duration: {startTime: game.time.worldTime, seconds: 60},
					changes: [
						{
							key: 'macro.CE',
							mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
							value: "Charmed",
							priority: 20
						}
					],
					flags: {
						dae: {
							selfTarget: false,
							stackable: "none",
							durationExpression: "",
							macroRepeat: "none",
							specialDuration: ["isDamaged"],
							transfer: false
						}
					},
					disabled: false
				};

				await MidiQOL.socket().executeAsGM("createEffects", {
					actorUuid: targetActor.uuid,
					effects: [charmedEffectData]
				});
			}
		}
	}
}