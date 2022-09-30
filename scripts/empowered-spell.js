const version = "0.1.0";
try {
	const optionName = "Empowered Spell";
	const cost = 1;
	
	if (args[0] === "on") {
		// burn the sorcery points
		if (!args[2].tokenId) {
			console.error('Metamagic: ${optionName} - no token');
			return {};
		}
		
		// data init
		const actor = canvas.tokens.get(args[2].tokenId).actor;
		
		// data validation
		if (!actor) {
			console.error('Metamagic: ${optionName} - no actor');
			return {};
		}
		if (!actor.data.data.resources.primary) {
			console.error('Metamagic: ${optionName} - no resource found');
			return {};
		}

		const points = actor.data.data.resources.primary.value;
		const pointsMax = actor.data.data.resources.primary.max;
		await actor.update({"data.resources.primary.value": Math.clamped(points - cost, 0, pointsMax)});
	}
	else {
		const actor = canvas.tokens.get(args[2].tokenId).actor;
		const target = canvas.tokens.get(args[4]);
		if (!actor) {
			console.error('Metamagic: ${optionName} - no actor');
			return {};
		}
		
		const chaMod = actor.data.data.abilities.cha.mod;
		console.log(target, chaMod);
		
		const lastDamageRolls = $('.midi-qol-item-card[data-spell-level]').last().find('.midi-qol-damage-roll').find('.roll.die')
		const diceFormula = $('.midi-qol-item-card[data-spell-level]').last().find('.midi-qol-damage-roll').find('.dice-formula')
		console.log(lastDamageRolls, diceFormula)

		let inputs = `<form><div class="form-group">`
		lastDamageRolls.each(function(index,obj) {
		console.log($(obj))
		inputs += `<input class="empower-dice-selection" type="checkbox" name="emp_dice_selection" value="`+$(obj).html()+`">`+$(obj).html()+`<br>`
		})
		inputs  += `</div></form>`

		$('input.empower-dice-selection').on('change', function(evt) {
			if ($(this).siblings(':checked').length >= limit) {
				this.checked = false;
			}
		});

		let dialog = new Promise((resolve, reject) => {
		  new Dialog({
		  });
		});
		
	}
	
} catch (err)  {
    console.error(`${args[1].efData.label} - Metamagic: ${optionName} ${version}`, err);
}
