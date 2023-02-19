/*
	As you call out words of restoration, up to six creatures of your choice that you can see within range regain hit points equal to 1d4 + your spellcasting ability modifier. This spell has no effect on undead or constructs.

	At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, the healing increases by 1d4 for each slot level above 3rd.
*/
const version = "10.0.0";
const optionName = "Mass Healing Word";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	if (args[0].macroPass === "postActiveEffects") {
		const level = Number(lastArg.spellLevel);
		let spellStat = actor.system.attributes.spellcasting;
		if (spellStat === "") spellStat = "wis";
		const spellcasting = actor.system.abilities[spellStat].mod;
		
		// find the potential targets
		const friendlyTargets = MidiQOL.findNearby(1, actorToken, 60, 0);
		const neutralTargets = MidiQOL.findNearby(0, actorToken, 60, 0);
		let combinedTargets = [actorToken, ...friendlyTargets, ...neutralTargets];
		
		let possibleTargets = combinedTargets.filter(function (target) {
			return filterRecipient(actorToken, target);
		});
		
		if (possibleTargets.length > 0) {
			// build the target data
			let rows = "";
			for (let t of possibleTargets) {
				let row = `<div><input type="checkbox" style="margin-right:10px;"/><label>${t.actor.name}</label></div>`;
				rows += row;
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
									recipients.push(possibleTargets[i]);
								}
							}
							
							if (recipients.length > 0) {
								let diceCount = 1 + level - 3;								
								const healRoll = await new Roll(`${diceCount}d4 + ${spellcasting}`).evaluate({ async: false });
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

/// Test token eligibility
function filterRecipient(actorToken, target) {
	let canSee = canvas.effects.visibility.testVisibility(actorToken.center, { object: target });
	let totalHP = target.actor?.system.attributes.hp.value;
	let maxHP = target.actor?.system.attributes.hp.max;
	let disallowedTypes = ["construct", "undead"].includes(target.actor.system.details?.type?.value);
	
	return canSee && (totalHP < maxHP) && !disallowedTypes;
}
