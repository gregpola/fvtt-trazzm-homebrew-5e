/*
	You create a floating, spectral weapon within range that lasts for the duration or until you cast this spell again. When you cast the spell, you can make a melee spell attack against a creature within 5 feet of the weapon. On a hit, the target takes force damage equal to 1d8 + your spellcasting ability modifier.

	As a bonus action on your turn, you can move the weapon up to 20 feet and repeat the attack against a creature within 5 feet of it.

	The weapon can take whatever form you choose. Clerics of deities who are associated with a particular weapon (as St. Cuthbert is known for his mace and Thor for his hammer) make this spell's effect resemble that weapon.

	Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d8 for every two slot levels above the 2nd.
*/
const version = "12.3.0";
const optionName = "Spiritual Weapon";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "spiritual-weapon";

const imagePrefix = "modules/JB2A_DnD5e/Library/2nd_Level/Spiritual_Weapon/";

const _weaponOptions = [
	{img: "SpiritualWeapon_Club01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Club01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Dagger02_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Dagger02_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Falchion01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Falchion01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Glaive01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Glaive01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_GreatAxe01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_GreatAxe01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_GreatClub01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_GreatClub01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_GreatSword01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_GreatSword01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Halberd01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Halberd01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Hammer01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Hammer01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Hammer02_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Hammer02_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_HandAxe01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_HandAxe01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Javelin01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Javelin01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Katana01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Katana01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_LongSword01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_LongSword01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Mace01_01_Flaming_Yellow_Thumb.webp", token: "SpiritualWeapon_Mace01_01_Flaming_Yellow_200x200.webm"},
	{img: "SpiritualWeapon_Mace01_01_Spectral_Blue_Thumb.webp", token: "SpiritualWeapon_Mace01_01_Spectral_Blue_200x200.webm"},
	{img: "SpiritualWeapon_Mace01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Mace01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Maul01_01_Flaming_Yellow_Thumb.webp", token: "SpiritualWeapon_Maul01_01_Flaming_Yellow_200x200.webm"},
	{img: "SpiritualWeapon_Maul01_01_Spectral_Blue_Thumb.webp", token: "SpiritualWeapon_Maul01_01_Spectral_Blue_200x200.webm"},
	{img: "SpiritualWeapon_Maul01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Maul01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Quarterstaff01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Quarterstaff01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Rapier01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Rapier01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Scimitar01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Scimitar01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Scythe01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Scythe01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Shortsword01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Shortsword01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Spear01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Spear01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Trident01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Trident01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Warhammer01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Warhammer01_02_Spectral_Green_400x400.webm"},
	{img: "SpiritualWeapon_Wrench01_02_Spectral_Green_Thumb.webp", token: "SpiritualWeapon_Wrench01_02_Spectral_Green_400x400.webm"}
];

try {
	if (args[0].macroPass === "preItemRoll") {
		// pick your weapon appearance
		const menuOptions = {};
		menuOptions["buttons"] = [
			{ label: "Cast", value: true },
			{ label: "Cancel", value: false }
		];

		menuOptions["inputs"] = [];
		_weaponOptions.forEach(item => {
			menuOptions["inputs"].push({
				type: "radio",
				label: `<img src='${imagePrefix}${item.img}' width='30' height='30' style='border: 5px; vertical-align: middle; right-margin: 10px;'>`,
				value: item.name,
				options: "group1"
			});
		});

		let choice = await HomebrewHelpers.menu( menuOptions,
			{ title: `${optionName} - Weapon Style`, options: { height: "100%", width: "100%" } });

		let targetButton = choice.buttons;
		if (targetButton) {
			const selectedIndex = choice.inputs.indexOf(true);
			if (selectedIndex >= 0) {
				const selectedForm = _weaponOptions[selectedIndex];
				await actor.setFlag(_flagGroup, flagName, {token: selectedForm.token});
				return true;
			}
		}

		return false;

	}
	else if (args[0].macroPass === "postActiveEffects") {
		const summonEffect = HomebrewHelpers.findEffect(actor, "Summon: Spiritual Weapon");
		if (summonEffect) {
			let summonFlag = summonEffect.getFlag("dnd5e", "dependents");
			let summonedToken = await fromUuid(summonFlag[0].uuid);

			if (summonedToken) {
				// update the summoned weapon
				const spellLevel = workflow.castData.castLevel;
				const attackDice = 1 + Math.floor((spellLevel - 2) / 2);
				const spellmod = actor.system.attributes.spellmod;
				const pb = actor.system.attributes.prof;
				const msakBonus = actor.system.bonuses.msak.attack ? Number(actor.system.bonuses.msak.attack) : 0;
				const toHitBonus = spellmod + pb + msakBonus;
				// TODO update other spellcasting attributes

				// get the appearance
				let tokenImage = _weaponOptions[0].token;
				let flag = actor.getFlag(_flagGroup, flagName);
				if (flag) {
					tokenImage = flag.token;
				}

				// update the actor and token data
				const summonName = `${optionName} (${actor.name})`;
				await summonedToken.actor.update({
					"name": summonName,
					"system.attributes.spellmod": spellmod
				});

				await summonedToken.update({
					"name": summonName,
					"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
					"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
					"bar1": {attribute: "attributes.hp"},
					"elevation": 5,
					'texture.src': `${imagePrefix}${tokenImage}`
				});

				// update the attack damage
				let attackItem = summonedToken.actor.items.find(i => i.name === "Spiritual Weapon Attack");
				if (attackItem) {
					let damageParts = foundry.utils.duplicate(attackItem.system.damage.parts);
					damageParts[0][0] = `${attackDice}d8 + @mod`;
					attackItem = attackItem.clone({
						"system.attack.bonus": toHitBonus,
						"system.damage.parts" : damageParts
					}, {keepId: true});
				}

				await summonedToken.toggleCombatant();
				const objectInitiative = token.combatant.initiative ? token.combatant.initiative - 0.01
					: 1 + (summonedToken.actor.system.abilities.dex.value / 100);
				await summonedToken.combatant.update({initiative: objectInitiative});

			} else {
				ui.notifications.error(`${optionName}: ${version} - unable to find the summoned token`);
			}
		} else {
			ui.notifications.error(`${optionName}: ${version} - unable to find the active effect`);
		}
	}

} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}
