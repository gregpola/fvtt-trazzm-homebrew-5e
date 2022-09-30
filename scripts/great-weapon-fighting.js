const version = "0.1.0";
const workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
const theItem = MidiQOL.Workflow.getWorkflow(args[0].uuid).item;

try {
	// make sure the attempted hit was made with a meleee weapon
	if (!["mwak"].includes(args[0].item.data.actionType)) return;
	
	// check for style restrictions (hvy?)
	if (!args[0].item.data.properties.two) return;

	if (args[0].macroPass === "DamageBonus") {
		// backup the whole original item as a property on the workflow
		let backupItem = theItem.clone();
		await setProperty(workflow, "originalItem", backupItem);

	} else if (args[0].macroPass === "preambleComplete") {
		let itemData = theItem.data.data;

		// strip damage type in [] from the originalDamage if it exists and add reroll and the damage type back in
		for (let i = 0; i < itemData.damage.parts.length; i++) {
			let oldDamage = itemData.damage.parts[i][1];
			let oldDice = itemData.damage.parts[i][0];
			if (oldDamage === damageType) {
				let index = oldDice.indexOf('[');
				if (index !== -1) oldDice = oldDice.slice(0, index); // remove everything after the first open bracket '['
				itemData.damage.parts[i][1] = damageType;
				itemData.damage.parts[i][0] = oldDice + "ro2" + "[" + damageType + "]";
				itemData.scaling.formula = itemData.scaling.formula + "ro2";
			}
		}

	} else if (args[0].macroPass === "postActiveEffects") {
		// restore original damage and scaling from the backup item
		let backupItem = await getProperty(workflow, "originalItem");
		
		for (let i = 0; i < backupItem.data.data.damage.parts.length; i++) 
			theItem.data.data.damage.parts[i] = backupItem.data.data.damage.parts[i];
		theItem.data.data.scaling = backupItem.data.data.scaling;

	}

} catch (err) {
    console.error(`Great Weapon Fighting ${version}`, err);
}
