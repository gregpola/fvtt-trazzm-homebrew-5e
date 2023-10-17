/*
	A wave of healing energy washes out from a point of your choice within range. Choose up to six creatures in a 30-foot-radius sphere centered on that point. Each target regains hit points equal to 3d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.

	At Higher Levels. When you cast this spell using a spell slot of 6th level or higher, the healing increases by 1d8 for each slot level above 5th.
*/
const version = "10.0.0";
const optionName = "Mass Cure Wounds";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	if (args[0].macroPass === "postActiveEffects") {
		const level = Number(lastArg.spellLevel);
		let targets = lastArg.targets;
		let spellStat = actor.system.attributes.spellcasting;
		if (spellStat === "") spellStat = "wis";
		const spellcasting = actor.system.abilities[spellStat].mod;
		
		if (targets.length > 0) {
			// build the target data
			let choices = [];
			let rows = "";
			for (let t of targets) {
				// filter out non-targets
				let totalHP = t.actor?.system.attributes.hp.value;
				let maxHP = t.actor?.system.attributes.hp.max;
				
				if (!["construct", "undead"].includes(t.actor.system.details?.type?.value) && (totalHP < maxHP)) {
					let row = `<div><input type="checkbox" style="margin-right:10px;"/><label>${t.actor.name}</label></div>`;
					rows += row;
					choices.push(t.object);
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
							
							if (recipients.length > 0) {
								let diceCount = 3 + level - 5;
								
								const healRoll = await new Roll(`${diceCount}d8 + ${spellcasting}`).evaluate({ async: false });
								await game.dice3d?.showForRoll(healRoll);
								await new MidiQOL.DamageOnlyWorkflow(actor, actorToken, healRoll.total, "healing", recipients, healRoll, 
									{flavor: `${optionName}`, itemCardId: args[0].itemCardId});
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
