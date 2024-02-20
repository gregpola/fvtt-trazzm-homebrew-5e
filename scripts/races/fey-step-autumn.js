const version = "11.1";
const optionName = "Fey Step (Autumn)";

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
				.fadeIn(200)
				.effect()
				.file("jb2a.misty_step.02.blue")
				.atLocation({x: position.x, y: position.y})
				.scale(portalScale)
				.anchor(0.5,0.5)
				.play();

		}
		else {
			return ui.notifications.error(`${optionName} - invalid fey step location`);
		}

		// Ask which targets to try to charm
		await wait(1000);
		const potentialTargets = MidiQOL.findNearby(null, token, 10);
		if (potentialTargets.length === 0) {
			console.log(`${optionName} - no targets within 10 feet to charm`);
			return;
		}

		let charmTargets = new Set();

		let rows = "";
		for(let t of potentialTargets) {
			let row = `<div class="flexrow"><label>${t.name}</label><input type="checkbox" value=${t.actor.uuid} style="margin-right:10px;"/></div>`;
			rows += row;
		}

		let content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 5px;"><p>Pick your charm targets (max 2):</p></div>
				<div id="targetRows" class="flexcol"style="margin-bottom: 10px;">
					${rows}
				</div>
			</div>
		  </form>
		`;

		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: optionName,
				content,
				buttons:
					{
						Ok:
							{
								label: `Ok`,
								callback: async (html) => {
									let spent = 0;
									var grid = document.getElementById("targetRows");
									var checkBoxes = grid.getElementsByTagName("INPUT");
									for (var i = 0; i < checkBoxes.length; i++) {
										if (checkBoxes[i].checked) {
											charmTargets.add(checkBoxes[i].value);
											spent += 1;
										}
									}

									if (!spent) {
										resolve(false);
									}
									else if (spent > 2) {
										ui.notifications.error(`${optionName} - too many targets selected`);
										resolve(false);
									}

									resolve(true);
								}
							},
						Cancel:
							{
								label: `Cancel`,
								callback: () => { resolve(false) }
							}
					}
			}).render(true);
		});

		let proceed = await dialog;
		if (proceed) {
			const saveDC = actor.system.attributes.spelldc;
			const saveFlavor = `${CONFIG.DND5E.abilities["wis"].label} DC${saveDC} ${optionName}`;

			const charmedEffectData = {
				name: "Fey Step - Charmed",
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
						specialDuration: [
							"isDamaged", "isSave"
						],
						transfer: false
					}
				},
				disabled: false
			};

			for (let uuid of charmTargets.values()) {
				let targetActor = MidiQOL.MQfromActorUuid(uuid);
				if (targetActor) {
					let saveRoll = await targetActor.rollAbilitySave("wis", {flavor: saveFlavor, damageType: "charm"});
					await game.dice3d?.showForRoll(saveRoll);

					if (saveRoll.total < saveDC) {
						await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: uuid, effects: [charmedEffectData] });
					}
				}
			}
		}
	}

} catch (err) {
    console.error(`${optionName} ${version}`, err);
}

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); });}