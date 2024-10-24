/*
	The wood of a club or quarterstaff you are holding is imbued with nature's power. For the duration, you can use your
	spellcasting ability instead of Strength for the attack and damage rolls of melee attacks using that weapon, and the
	weapon's damage die becomes a d8. The weapon also becomes magical, if it isn't already. The spell ends if you cast
	it again or if you let go of the weapon.
*/
const version = "12.3.0";
const optionName = "Shillelagh";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "shillelagh-data";

try {
	if (args[0] === "on") {
		// build list of weapons that can be enchanted
		// TODO filter out non-appropriate weapons
		let weapons = actor.items.filter(i => i.type === `weapon` && (i.system.type?.baseItem === "quarterstaff" || i.system.type?.baseItem === "club"));
		let weapon_content = ``;
		for (let weapon of weapons) {
			weapon_content += `<label><input type="radio" name="choice" value="${weapon.id}" checked/><img src=${weapon.img} width='30' height='30' style='border: 5px; vertical-align: middle; margin-left: 15px; margin-right: 10px;'> ${weapon.name} </img></label>`;
		}

		let myContent = `
			<p><label>Select the weapon to enchant: </label></p>
			${weapon_content}`;

		const weaponId = await foundry.applications.api.DialogV2.confirm({
			window: {
				title: `${optionName}`,
			},
			content: myContent,
			yes: {
				callback: (event, button, dialog) => {
					return button.form.elements.choice.value;
				}
			},
			rejectClose: false,
			modal: true,
			position: {
				width: 400
			}
		});

		if (weaponId) {
			const weaponChoice = weapons.find(i => i.id === weaponId);

			// stash the old data
			await actor.setFlag(_flagGroup, flagName, {
				'name': weaponChoice.name,
				'ability': weaponChoice.system.ability,
				'magic': weaponChoice.system.properties.has('mgc'),
				'damage': weaponChoice.system.damage.parts
			});

			let copy_item = foundry.utils.duplicate(weaponChoice);
			copy_item.name = copy_item.name + ` (${optionName})`;

			const spellMod = actor.system.abilities[actor.system.attributes.spellcasting].mod;
			let weaponMod;
			let weaponAbility = copy_item.system.ability;
			if (copy_item.system.ability) {
				weaponMod = actor.system.abilities[copy_item.system.ability].mod;
			}
			else if (copy_item.system.properties.includes('fin')) {
				weaponAbility = actor.system.abilities.dex.mod > actor.system.abilities.str.mod ? "dex" : "str";
				weaponMod = actor.system.abilities[weaponAbility].mod;
			}
			else {
				weaponAbility = 'str';
				weaponMod = actor.system.abilities[weaponAbility].mod;
			}
			copy_item.system.ability = spellMod > weaponMod ? actor.system.attributes.spellcasting : weaponAbility;

			if (!copy_item.system.properties.includes('mgc')) {
				copy_item.system.properties.push('mgc');
			}

			let damageParts = weaponChoice.system.damage.parts;
			let damage = damageParts[0][0];
			var newdamage = damage.replace(/1d(4|6)/g,"1d8");
			copy_item.system.damage.parts[0][0] = newdamage;
			await actor.updateEmbeddedDocuments("Item", [copy_item]);

			ChatMessage.create({
				content: `${token.name}'s ${weaponChoice.name} is imbued with nature's power`,
				speaker: ChatMessage.getSpeaker({ actor: actor })});
		}

	}
	else if (args[0] === "off") {
		let flag = actor.getFlag(_flagGroup, flagName);
		if (flag) {
			await actor.unsetFlag(_flagGroup, flagName);
			const itemName = flag.name + ` (${optionName})`;
			let shillelaghItem = actor.items.find(i => i.name === itemName);

			if (shillelaghItem) {
				let copy_item = foundry.utils.duplicate(shillelaghItem.toObject(false));
				copy_item.name = flag.name;
				copy_item.system.ability = flag.ability;
				copy_item.system.damage.parts = flag.damage;

				if (!flag.magic) {
					const index = copy_item.system.properties.indexOf('mgc');
					if (index > -1) {
						copy_item.system.properties.splice(index, 1);
					}
				}
				await actor.updateEmbeddedDocuments("Item", [copy_item]);

				ChatMessage.create({
					content: `${token.name}'s ${flag.name} returns to normal.`,
					speaker: ChatMessage.getSpeaker({ actor: actor })});
			}
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
