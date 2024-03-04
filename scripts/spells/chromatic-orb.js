const version = "11.0";
const optionName = "Chromatic Orb";

const _elementOptions = [
	{name: "acid", image: 'icons/magic/acid/projectile-smoke-glowing.webp', color: 'greenorange'},
	{name: "cold", image: 'icons/magic/water/projectile-ice-snowball.webp', color: 'dark_bluewhite'},
	{name: "fire", image: 'icons/magic/fire/projectile-fireball-smoke-orange.webp', color: 'red'},
	{name: "lightning", image: 'icons/magic/lightning/projectile-orb-blue.webp', color: 'blueyellow'},
	{name: "poison", image: 'icons/magic/unholy/projectile-missile-green.webp', color: 'greenorange'},
	{name: "thunder", image: 'icons/magic/air/air-wave-gust-blue.webp', color: 'purplepink'}
];

try {
	if (args[0].macroPass === "preItemRoll") {
		const menuOptions = {};
		menuOptions["buttons"] = [
			{ label: "Cast", value: true },
			{ label: "Cancel", value: false }
		];

		menuOptions["inputs"] = [];
		_elementOptions.forEach(item => {
			menuOptions["inputs"].push({ type: "radio",
				label: `<img src='${item.image}' width='30' height='30' style='border: 5px; vertical-align: middle; right-margin: 10px;'><label>${capitalizeFirstLetter(item.name)}</label>`,
				value: item.name,
				options: "group1" });
		});

		let choice = await warpgate.menu( menuOptions,
			{ title: `${optionName} - Type of Orb`, options: { height: "100%", width: "100%" } });

		let targetButton = choice.buttons;
		if (targetButton) {
			const selectedIndex = choice.inputs.indexOf(true);

			if (selectedIndex >= 0) {
				const damageType = _elementOptions[selectedIndex].name;
				let damageParts = item.system.damage.parts;
				damageParts[0][1] = damageType;
				await item.update({"system.damage.parts": damageParts});
			}
		}
		else {
			return false;
		}
	}
				
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function capitalizeFirstLetter(str) {
	return str[0].toUpperCase() + str.slice(1);
}
