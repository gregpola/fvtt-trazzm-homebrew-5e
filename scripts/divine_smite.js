const version = "10.0.1";
const optionName = "Divine Smite";

try {
	if (args[0].macroPass === "DamageBonus") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		const targetActor = lastArg.hitTargets[0].actor;
		const targetToken = game.canvas.tokens.get(lastArg.hitTargets[0].id);
		
		// Must be a melee weapon attack
		if (!["mwak"].includes(lastArg.itemData.system.actionType)) 
			return {};
		
		// Make sure it's not thrown
		const reach = lastArg.itemData.system.rch;
		
		if (!targetToken) {
			MidiQOL.error(`${optionName}: no target`);
			return {};
		}
		
		const ray = new Ray(actorToken.center, targetToken.center);
		const gridDistance = Math.floor(ray.distance / canvas.grid.size);
		if (gridDistance > 1 && !reach) {
			console.log(`${optionName} - thrown is not an eligible attack`);
			return {};
		}
		
		if (gridDistance > 2) {
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
		let undead = ["undead", "fiend"].some(type => (targetActor.system.details.type?.value || "").toLowerCase().includes(type));
		if (undead) numDice += 1;
		if (lastArg.isCritical) {
			numDice = numDice * 2;
		}
		
		return {damageRoll: `${numDice}d8[radiant]`, flavor: `${optionName}`};
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function nth(n){return n + (["st","nd","rd"][((n+90)%100-10)%10-1]||"th")}
