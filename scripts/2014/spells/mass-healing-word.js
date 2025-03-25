/*
	As you call out words of restoration, up to six creatures of your choice that you can see within range regain hit
	points equal to 1d4 + your spellcasting ability modifier. This spell has no effect on undead or constructs.

	At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, the healing increases by 1d4
	for each slot level above 3rd.
*/
const version = "12.3.0";
const optionName = "Mass Healing Word";

try {
	if (args[0].macroPass === "preambleComplete") {
		let targets = workflow.targets;
		const level = workflow.castData.castLevel;
		const spellcastingModifier = actor.system.attributes.spellmod;

		if (targets.size > 0) {
			// build the target data
			let choices = [];
			let rows = "";
			for (let t of targets) {
				// filter out non-targets
				let totalHP = t.actor?.system.attributes.hp.value;
				let maxHP = t.actor?.system.attributes.hp.max;

				if (!["construct", "undead"].includes(t.actor.system.details?.type?.value) && (totalHP < maxHP)) {
					let row = `<div><input type="checkbox" style="margin-right:10px;"/><label>${t.name} (${t.actor.system.attributes.hp.value} of ${t.actor.system.attributes.hp.max})</label></div>`;
					rows += row;
					choices.push(t);
				}
			}

			// build dialog content
			let content = `
				<form>
					<div class="flexcol">
						<div class="flexrow" style="margin-bottom: 10px;"><label>Select up to 6 to receive healing:</label></div>
						<div id="targetRows" class="flexcol"style="margin-bottom: 10px;">
							${rows}
						</div>
					</div>
				</form>`;

			new Dialog({
				title: optionName,
				content,
				buttons: {
					Ok:	{
						label: `Ok`,
						callback: async (html) => {
							var grid = document.getElementById("targetRows");
							var checkBoxes = grid.getElementsByTagName("INPUT");
							let recipients = [];
							for (var i = 0; i < checkBoxes.length; i++) {
								if (recipients.length === 6)
									break;

								if (checkBoxes[i].checked) {
									recipients.push(choices[i]);
								}
							}

							if (recipients.length !== workflow.targets.size) {
								game.user.updateTokenTargets(recipients);
							}

							if (recipients.length > 0) {
								let diceCount = 1 + Math.max(level - 3, 0);
								const healRoll = await new Roll(`${diceCount}d4 + ${spellcastingModifier}`).evaluate();
								await game.dice3d?.showForRoll(healRoll);

								await new MidiQOL.DamageOnlyWorkflow(actor, token, healRoll.total, "healing", recipients, healRoll,
									{flavor: `${optionName}`, itemCardId: workflow.itemCardId});
							}
						}
					}
				}
			}).render(true);
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
