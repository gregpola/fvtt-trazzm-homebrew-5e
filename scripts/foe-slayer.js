const version = "0.1.0";
try {
	// Must be an attack
    if (!["mwak", "rwak"].includes(args[0].itemData.data.actionType)) return {}; // weapon attack
	// validate actor, target and hit
    token = canvas.tokens.get(args[0].tokenId);
    actor = token.actor;
    if (!actor || !token || args[0].hitTargets.length < 1) return {};
	
    let target = canvas.tokens.get(args[0].hitTargets[0].id ?? args[0].hitTargers[0]._id);
    if (!target) MidiQOL.error("Foe Slayer macro failed - can't find target");
	
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
