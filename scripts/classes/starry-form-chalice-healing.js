if (args[0].macroPass === "DamageBonus") {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	// make sure it's an heal and uses a spell slot
	if (!["heal"].includes(lastArg.itemData.system.actionType) && lastArg.spellLevel && (lastArg.spellLevel > 0)) {
		console.log("Starry Form - Chalice: not a heal spell");
		return {};
	}

	// ask show to heal
	const friendlyTargets = MidiQOL.findNearby(1, actorToken, 60);
	const neutralTargets = MidiQOL.findNearby(0, actorToken, 60);
	let combinedTargets = [actorToken, ...friendlyTargets, ...neutralTargets];
	let possibleTargets = combinedTargets.filter(function (target) {
		return filterRecipient(actorToken, target);
	});
	
	if (possibleTargets.length === 0) {
		console.log("Starry Form - Chalice: not a heal spell");
		return {};
	}
	
	// build the target data
	let target_content = ``;
	for (let t of possibleTargets) {
		target_content += `<option value=${t.id}>${t.actor.name}</option>`;
	}
	
	// build dialog content
	let content = `
		<div class="form-group">
		  <p>Select nearby target to heal:</p>
		  <div style="margin: 10px;">
			  <select name="healTarget">
				${target_content}
			  </select>
		  </div>
		</div>`;

	let dialog = new Promise((resolve, reject) => {
		new Dialog({
			title: "Starry Form - Chalice",
			content,
			buttons:
			{
				Ok:
				{
					label: `OK`,
					callback: async (html) => {
						let healTargetId = html.find('[name=healTarget]')[0].value;
						const healTarget = canvas.tokens.get(healTargetId);
						const healDice = actor.system.scale["circle-of-stars"]["starry-form-dice"];
						const spellcasting = actor.system.abilities["wis"].mod;
						const healRoll = await new Roll(`${healDice} + ${spellcasting}`).evaluate({ async: false });
						await game.dice3d?.showForRoll(healRoll);
						await new MidiQOL.DamageOnlyWorkflow(actor, actorToken, healRoll.total, "healing", [healTarget], healRoll, {flavor: 'Starry Form - Chalice', itemCardId: 'new'});
					}
				}
			}
		}).render(true);
	});
}

function filterRecipient(actorToken, target) {
	let canSee = canvas.effects.visibility.testVisibility(actorToken.center, { object: target });
	let totalHP = target.actor?.system.attributes.hp.value;
	let maxHP = target.actor?.system.attributes.hp.max;
	let disallowedTypes = ["construct", "undead"].includes(target.actor.system.details?.type?.value);	
	return canSee && (totalHP < maxHP) && !disallowedTypes;
}