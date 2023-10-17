const version = "10.0.0";
const optionName = "Chromatic Orb";
const lastArg = args[args.length - 1];

//define damage types and their colors. The colors correspond to those on Jb2a's patreon guiding bolt animation.
const damage_types = {
	acid: "greenorange",
	cold: "dark_bluewhite",
	fire: "red",
	lightning: "blueyellow",
	poison: "greenorange",
	thunder: "purplepink",
};

try {
	// thanks to Kekilla for an great dialog macro.
	// Midi-qol on use Chromatic Orb, It handles damage. 
	if(args[0].hitTargets.length === 0) return {};
	let choice = false;
	let elementImg = {
	  acid: "icons/magic/acid/projectile-smoke-glowing.webp",
	  cold: "icons/magic/water/projectile-ice-snowball.webp",
	  fire: "icons/magic/fire/projectile-fireball-smoke-orange.webp",  
	  lightning: "icons/magic/lightning/projectile-orb-blue.webp",
	  poison : "icons/magic/unholy/projectile-missile-green.webp",
	  thunder: "icons/magic/air/air-wave-gust-blue.webp"
	};

	let elementList = ["acid", "cold", "fire", "lightning", "poison", "thunder"].reduce((list, element) => {
	  list[element] = {icon: `<img style="display:block; width:100%; height:auto;" src="${elementImg[element]}" title="${capitalizeFirstLetter(element)}">`, callback: () => choice = element }
	  return list;
	}, {});

	function capitalizeFirstLetter(str) {
	  return str[0].toUpperCase() + str.slice(1);
	}

	if (args[0].macroPass === "preDamageRoll") {
		let itemD = await fromUuid(lastArg.uuid);
		let damageType = await new Promise((resolve) => {
			let x = new Dialog({
				title: `${itemD.name} : Pick an Element`,      
				buttons: elementList,
				default: "cancel",
				close: async () => {
				return resolve(choice);
				}
			});
			x.position.height = 100;
			return x.render(true);
		});
		
		let level = Number(lastArg.spellLevel) + 2;
		let damageUpdate = `${level}d8[${damageType}]`;
		itemD.system.damage.parts[0][0] = damageUpdate;
		itemD.system.damage.parts[0][1] = damageType;
		
		// play the animation
		let tokenD = canvas.tokens.get(lastArg.tokenId); // caster token
		let target = canvas.tokens.get(lastArg.hitTargets[0].id); // target token
		const colorD = damage_types[damageType];
		await anime(tokenD, target, colorD);		
	}
				
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, target, colorD) {
	new Sequence()
		.effect()
		.file("jb2a.markers.light.intro.yellow")
		.atLocation(token)
		.fadeIn(500)
		.fadeOut(1000)
		.belowTokens()
		.effect()
		.file("jb2a.extras.tmfx.runes.circle.outpulse.evocation")
		.atLocation(token)
		.duration(1000)
		.fadeIn(500)
		.fadeOut(500)
		.scale(0.5)
		.filter("Glow", { color: 0xffffbf })
		.waitUntilFinished(-500)
		.effect()
		.file("jb2a.guiding_bolt.01."+colorD)
		.fadeIn(500)
		.fadeOut(300)
		.atLocation(token)
		.stretchTo(target)
		.play();_validateLocation
}
