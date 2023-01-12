const version = "10.0.0";
const optionName = "Divine Smite";

try {
	if (args[0].macroPass === "DamageBonus") {
		// Must be a melee weapon attack
		if (!["mwak"].includes(args[0].itemData.system.actionType)) return {}; // weapon attack

		// validate actor, target and hit
		token = canvas.tokens.get(args[0].tokenId);
		actor = token.actor;
		if (!actor || !token || args[0].hitTargets.length < 1) return {};

		let target = canvas.tokens.get(args[0].hitTargets[0].id ?? args[0].hitTargets[0]._id);
		if (!target) {
			MidiQOL.error(`${optionName}: no target`);
			return {};
		}

		// get/check paladin data
		const paladinLevels = actor.getRollData().classes.paladin?.levels;
		if (!paladinLevels) {
		  MidiQOL.warn(`${optionName}: Trying to do divine smite and not a paladin`);
		  return {}; // paladin only
		}
		
		// get spell slots available
		const rollData = foundry.utils.duplicate(actor.getRollData());
		const inputs = Object.entries(rollData.spells).filter(s => {
				return s[1].value > 0;
			}).map(([key, {value, max}]) => {
				let crd = key === "pact" ? "Pact Slot" : nth(Number(key.at(-1)));
				return [key, crd, value, max];
			});
			
		if (inputs.length < 1) {
			console.log(`${optionName}: no spell slots`);
			return {};
		}
		
		// ask which slot to use
		const options = inputs.reduce((acc, [key, crd, value, max]) => {
			return acc + `<option value="${key}">${crd} (${value}/${max})</option>`; }, ``);
		
		const myContent = `
		<form>
			<p>Use Divine Smite?</p>
			<div class="form-group">
				<label style="flex: 1;">Spell Slot:</label>
				<div class="form-fields">
					<select id="smite-slot">${options}</select>
				</div>
			</div>
		</form>`;
		
		let slot = ""
		let useSmite = false;
		if (!useSmite) {
			let dialog = new Promise((resolve, reject) => {
			  new Dialog({
			  // localize this text
			  title: "Conditional Damage",
			  content: myContent,
			  buttons: {
				  one: {
					  icon: '<i class="fas fa-check"></i>',
					  label: "Smite!",
					  callback: (html) => {
						  slot = html[0].querySelector("#smite-slot").value;
						  resolve(true);
					  }
				  },
				  two: {
					  icon: '<i class="fas fa-times"></i>',
					  label: "Cancel",
					  callback: () => {resolve(false)}
				  }
			  },
			  default: "two"
			  }).render(true);
			});
		   useSmite = await dialog;
		}	
		
		if (!useSmite) return {}
		
		// build the damage bonus
		const level = slot === "pact" ? rollData.spells["pact"].level : Number(slot.at(-1));
		const value = rollData.spells[slot].value - 1;
		actor.update({[`system.spells.${slot}.value`]: value});
		
		let numDice = 1 + level;
		if (numDice > 5) numDice = 5;
		let undead = ["undead", "fiend"].some(type => (target?.actor.system.details.type?.value || "").toLowerCase().includes(type));
		if (undead) numDice += 1;
		if (args[0].isCritical) {
			numDice = numDice * 2;
		}
		
		return {damageRoll: `${numDice}d8[radiant]`, flavor: `${optionName}`};
	}

} catch (err) {
    console.error(`${args[0].itemData.name} - Divine Smite ${version}`, err);
}

function nth(n){return n + (["st","nd","rd"][((n+90)%100-10)%10-1]||"th")}
