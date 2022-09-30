const version = "0.1.0";
try {
	// Must be a melee weapon attack
    if (!["mwak"].includes(args[0].itemData.data.actionType)) return {}; // weapon attack
	// validate actor, target and hit
    token = canvas.tokens.get(args[0].tokenId);
    actor = token.actor;
    if (!actor || !token || args[0].hitTargets.length < 1) return {};
	
    const paladinLevels = actor.getRollData().classes.paladin?.levels;
    if (!paladinLevels) {
      MidiQOL.warn("Divine Smite Damage: Trying to do divine smite and not a paladin");
      return {}; // paladin only
    }
    let target = canvas.tokens.get(args[0].hitTargets[0].id ?? args[0].hitTargers[0]._id);
    if (!target) MidiQOL.error("Divine Smite macro failed");

	// get spell slots available
	const rollData = foundry.utils.duplicate(actor.getRollData());
	const inputs = Object.entries(rollData.spells).filter(s => {
		return s[1].value > 0;
	}).map(([key, {value, max}]) => {
		let crd = key === "pact" ? "Pact Slot" : nth(Number(key.at(-1)));
		return [key, crd, value, max];
	});
	if (inputs.length < 1) {
		console.log("no spell slots for divine smite");
		return {};
	}

	const options = inputs.reduce((acc, [key, crd, value, max]) => {
		return acc + `<option value="${key}">${crd} (${value}/${max})</option>`;
	}, ``);
	
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
	const level = slot === "pact" ? rollData.spells["pact"].level : Number(slot.at(-1));
	const value = rollData.spells[slot].value - 1;
	actor.update({[`data.spells.${slot}.value`]: value});

    let numDice = 1 + level;
    if (numDice > 5) numDice = 5;
    let undead = ["undead", "fiend"].some(type => (target?.actor.data.data.details.type?.value || "").toLowerCase().includes(type));
    if (undead) numDice += 1;
    if (args[0].isCritical) {
		numDice = numDice * 2;
	}
    return {damageRoll: `${numDice}d8[radiant]`, flavor: "Divine Smite"};

} catch (err) {
    console.error(`${args[0].itemData.name} - Divine Smite ${version}`, err);
}

function nth(n){return n + (["st","nd","rd"][((n+90)%100-10)%10-1]||"th")}
