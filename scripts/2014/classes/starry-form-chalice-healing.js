/*
	A constellation of a life-giving goblet appears on you. Whenever you cast a spell using a spell slot that restores
	hit points to a creature, you or another creature within 30 feet of you can regain hit points equal to 1d8 + your
	Wisdom modifier.
 */
const version = "12.3.0";
const optionName = "Starry Form - Chalice Healing";

try {
	if (args[0].macroPass === "DamageBonus") {
		const spellLevel = workflow.castData?.castLevel;

		// make sure it's an heal and uses a spell slot
		if (!["heal"].includes(item.system.actionType) && (spellLevel > 0)) {
			console.log("Starry Form - Chalice: not a heal spell using a slot");
			return {};
		}

		// ask show to heal
		const friendlyTargets = MidiQOL.findNearby(1, token, 60);
		const neutralTargets = MidiQOL.findNearby(0, token, 60);
		let combinedTargets = [token, ...friendlyTargets, ...neutralTargets];
		let possibleTargets = combinedTargets.filter(function (target) {
			return filterRecipient(token, target);
		});

		if (possibleTargets.length === 0) {
			console.log("Starry Form - Chalice: no eligible targets");
			return {};
		}

		// build the target data
		let target_content = ``;
		for (let t of possibleTargets) {
			target_content += `<option value=${t.id}>${t.name}</option>`;
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

		const tokenId = await foundry.applications.api.DialogV2.prompt({
			content: content,
			rejectClose: false,
			ok: {
				callback: (event, button, dialog) => {
					return button.form.elements.healTarget.value;
				}
			},
			window: {
				title: optionName,
			},
			position: {
				width: 400
			}
		});

		if (tokenId) {
			const healTarget = canvas.tokens.get(tokenId);
			const healDice = actor.system.scale["circle-of-stars"]["starry-form-dice"];
			const abilityBonus = actor.system.abilities.wis.mod;
			const healRoll = await new Roll(`${healDice} + ${abilityBonus}`).evaluate();
			await game.dice3d?.showForRoll(healRoll);
			await new MidiQOL.DamageOnlyWorkflow(actor, token, healRoll.total, "healing", [healTarget], healRoll, {flavor: optionName, itemCardId: 'new'});
		}
	}

} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}

function filterRecipient(actorToken, target) {
	const canSee = canvas.effects.visibility.testVisibility(actorToken.center, { object: target });
	const totalHP = target.actor?.system.attributes.hp.value;
	const maxHP = target.actor?.system.attributes.hp.max;
	const typeOrRace = HomebrewHelpers.raceOrType(target.actor);
	const disallowedTypes = ["construct", "undead"].includes(typeOrRace);
	return canSee && (totalHP < maxHP) && !disallowedTypes;
}
