await warpgate.wait(100);

//define damage types and their colors. The colors correspond to those on Jb2a's patreon guiding bolt animation.\n\nconst damage_types = {
	acid: "greenorange",
	cold: "dark_bluewhite",
	fire: "red",
	lightning: "blueyellow",
	poison: "greenorange",
	thunder: "purplepink",
	};
	
	// create the menu
	const {inputs: damage} = await warpgate.menu(
	{
		inputs: [
		{
			type: "select",
			label: "Damage type:",
			options: Object.keys(damage_types),
			},
			],
			},
			{ title: "Chromatic Orb" }
			);
			
			// Establish color of the orb based on damage
			const colorD = damage_types[damage];
			
			// Establish who's targeting whom
			let tokenD = canvas.tokens.get(args[0].tokenId); // caster token
			let target = canvas.tokens.get(args[0].hitTargets[0].id); // target token
			
			// roll the damage and apply the proper form based on choice above
			(async () => {
				if (args[0].hitTargets.length === 0) return {};
				let actorD = game.actors.get(args[0].actor._id);
				let level = Number(args[0].spellLevel) + 2;
				let damageDice = args[0].isCritical ? level * 2 : level;
				let damageRoll = new Roll(`${damageDice}d8`).evaluate({ async: false });
				new MidiQOL.DamageOnlyWorkflow(
				actorD,
				tokenD,
				damageRoll.total,
				damage,
				[target],
				damageRoll,
				{
					flavor: `(${CONFIG.DND5E.damageTypes[damage]})`,
					itemCardId: "new",
					useOther: true,
					itemData: args[0].itemData
					}
					);
					})();
					
					// Fancy special effects
					new Sequence()
					.effect()
					.file("jb2a.markers.light.intro.yellow")
					.atLocation(tokenD)
					.fadeIn(500)
					.fadeOut(1000)
					.belowTokens()
					.effect()
					.file("jb2a.extras.tmfx.runes.circle.outpulse.evocation")
					.atLocation(tokenD)
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
					.atLocation(tokenD)
					.stretchTo(target)
					.playIf(args[0].hitTargets.length === 1) // Comment this line out if not using MIDI
					.play();