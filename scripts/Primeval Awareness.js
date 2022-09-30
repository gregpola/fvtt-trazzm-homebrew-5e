const version = "0.1.0";
try {
	// validate actor
    token = canvas.tokens.get(args[0].tokenId);
    actor = token.actor;
    if (!actor || !token) return {};
	
	// get spell slots available
	const rollData = foundry.utils.duplicate(actor.getRollData());
	const inputs = Object.entries(rollData.spells).filter(s => {
		return s[1].value > 0;
	}).map(([key, {value, max}]) => {
		let crd = key === "pact" ? "Pact Slot" : nth(Number(key.at(-1)));
		return [key, crd, value, max];
	});
	if (inputs.length < 1) {
		console.log("no spell slots for Primeval Awareness");
		return {};
	}

	const options = inputs.reduce((acc, [key, crd, value, max]) => {
		return acc + `<option value="${key}">${crd} (${value}/${max})</option>`;
	}, ``);
	
	const myContent = `
	<form>
		<p>Use Primeval Awareness?</p>
		<div class="form-group">
			<label style="flex: 1;">Spell Slot:</label>
			<div class="form-fields">
				<select id="spell-slot">${options}</select>
			</div>
		</div>
		<p><i>Lasts 1 minute per spell level<i><p>
	</form>`;
	
	let slot = ""
	let useFeature = false;
	if (!useFeature) {
		let dialog = new Promise((resolve, reject) => {
		  new Dialog({
		  // localize this text
		  title: "Primeval Awareness",
		  content: myContent,
		  buttons: {
			  one: {
				  icon: '<i class="fas fa-check"></i>',
				  label: "Yes",
				  callback: (html) => {
					  slot = html[0].querySelector("#spell-slot").value;
					  resolve(true);
				  }
			  },
			  two: {
				  icon: '<i class="fas fa-times"></i>',
				  label: "No",
				  callback: () => {resolve(false)}
			  }
		  },
		  default: "two"
		  }).render(true);
		});
       useFeature = await dialog;
	}	
	
    if (!useFeature) return {}
	const level = slot === "pact" ? rollData.spells["pact"].level : Number(slot.at(-1));
	const value = rollData.spells[slot].value - 1;
	actor.update({[`data.spells.${slot}.value`]: value});
	
	// TODO set the duration to match the spell slot

} catch (err) {
    console.error(`${args[0].itemData.name} - Primeval Awareness ${version}`, err);
}

function nth(n){return n + (["st","nd","rd"][((n+90)%100-10)%10-1]||"th")}