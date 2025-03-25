const version = "12.3.1";

if (args[0].macroPass === "DamageBonus") {
	const druidLevel = actor.classes.druid?.system.levels ?? 0;
	
	// make sure it's an heal
	if (!["heal"].includes(item.system.actionType)) {
		console.log(`Spirit Totem (Unicorn Spirit): not a heal`);
		return {};
	}

	// get the totem spirit
	const summonData = actor.getFlag("fvtt-trazzm-homebrew-5e", "spirit-totem");
	if (summonData) {
		const spiritToken = await fromUuid(summonData);
		if (spiritToken) {
			// ask which tokens in the aura to heal
			const possibleTargets = MidiQOL.findNearby(null, spiritToken, 30);
			if (possibleTargets.length > 0) {
				// build the target data
				let rows = "";
				for (let t of possibleTargets) {
					let row = `<div><input type="checkbox" style="margin-right:10px;" value=${t.id}/><label>${t.name}</label></div>`;
					rows += row;
				}
				
				// build dialog content
				let content = `
					<form>
						<div class="flexcol">
							<div class="flexrow" style="margin-bottom: 10px;"><label>Select who receives ${druidLevel} healing:</label></div>
							<div id="targetRows" class="flexcol"style="margin-bottom: 10px;">
								${rows}
							</div>
						</div>
					</form>`;
					
				new Dialog({
					title: "Unicorn Spirit Healing",
					content,
					buttons: {
						Ok:	{
							label: `Ok`,
							callback: async (html) => {
								var grid = document.getElementById("targetRows");
								var checkBoxes = grid.getElementsByTagName("INPUT");
								let recipients = [];
								for (var i = 0; i < checkBoxes.length; i++) {
									if (checkBoxes[i].checked) {
										let target = possibleTargets[i];
										recipients.push(target);
										//await target.actor.applyDamage(-druidLevel);
									}
								}
								
								if (recipients.length > 0) {
									const damageRoll = await new Roll(`${druidLevel}`).evaluate({ async: false });
									await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "healing", recipients, damageRoll,
										{flavor: `Unicorn Spirit Healing`, itemCardId: args[0].itemCardId});
								}
							}
						}
					}
				}).render(true);
			}
		}
	}
	else {
		console.log("no spirit totem found");
	}
}
