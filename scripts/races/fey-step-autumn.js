const version = "12.3.1";
const optionName = "Fey Step (Autumn)";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// transport the caster
		const maxRange = item.system.range.value ?? 30;
		await HomebrewMacros.teleportToken(token, maxRange);

		// Ask which targets to try to charm
		await HomebrewMacros.wait(1000);
		const potentialTargets = MidiQOL.findNearby(null, token, 10);
		if (potentialTargets.length === 0) {
			console.log(`${optionName} - no targets within 10 feet to charm`);
			return;
		}


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

		let charmTargets = new Set();
		let proceed = await foundry.applications.api.DialogV2.prompt({
			content: content,
			rejectClose: false,
			ok: {
				callback: (event, button, dialog) => {
					let count = 0;
					for (let row of button.form.elements) {
						if (row.checked) {
							charmTargets.add(row.value);
							count++;
						}

						if (count >= 2) {
							break;
						}
					}

					if (charmTargets.size < 1) {
						return false;
					}

					return true;
				}
			},
			window: {
				title: `${optionName}`
			},
			position: {
				width: 400
			}
		});

		if (proceed) {
			const saveDC = actor.system.attributes.spelldc;
			const saveFlavor = `${CONFIG.DND5E.abilities["wis"].label} DC${saveDC} ${optionName}`;

			for (let uuid of charmTargets.values()) {
				let targetActor = MidiQOL.MQfromActorUuid(uuid);
				if (targetActor) {
					let saveRoll = await targetActor.rollAbilitySave("wis", {flavor: saveFlavor, damageType: "charm"});
					await game.dice3d?.showForRoll(saveRoll);

					if (saveRoll.total < saveDC) {
						await HomebrewEffects.applyCharmedEffect(targetActor, item, ["isDamaged"], 60);
					}
				}
			}
		}
	}

} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
