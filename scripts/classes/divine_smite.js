/*
	Starting at 2nd level, when you hit a creature with a melee weapon attack, you can expend one spell slot to deal
	radiant damage to the target, in addition to the weapon’s damage. The extra damage is 2d8 for a 1st-level spell slot,
	plus 1d8 for each spell level higher than 1st, to a maximum of 5d8. The damage increases by 1d8 if the target is an
	undead or a fiend, to a maximum of 6d8.
 */
const version = "11.2";
const optionName = "Divine Smite";

try {
	if ((args[0].macroPass === "DamageBonus") && (workflow.hitTargets.size > 0)) {
		const targetToken = workflow.hitTargets.first();

		// Must be a melee weapon attack
		if (!["mwak"].includes(workflow.item.system.actionType))
			return {};
		
		// Make sure it's not thrown
		const reach = workflow.item.system.properties.rch;
		
		if (!targetToken) {
			MidiQOL.error(`${optionName}: no target`);
			return {};
		}

		const tokenDistance = MidiQOL.computeDistance(token, targetToken, true);
		if (tokenDistance > 5 && !reach) {
			console.log(`${optionName} - thrown is not an eligible attack`);
			return {};
		}
		
		if (tokenDistance > 10) {
			console.log(`${optionName} - target is out of range`);
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
		let undead = ["undead", "fiend"].some(type => (targetToken.actor.system.details.type?.value || "").toLowerCase().includes(type));
		if (undead) numDice += 1;

		if (workflow.isCritical) {
			const critDamage = numDice * 8;
			return {damageRoll: `${numDice}d8 + ${critDamage}[radiant]`, flavor: `${optionName}`};
		}
		else {
			return {damageRoll: `${numDice}d8[radiant]`, flavor: `${optionName}`};
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function nth(n){return n + (["st","nd","rd"][((n+90)%100-10)%10-1]||"th")}
