/*
	You hurl an undulating, warbling mass of chaotic energy at one creature in range. Make a ranged spell attack against the target. On a hit, the target takes 2d8 + 1d6 damage. Choose one of the d8s. The number rolled on that die determines the attack’s damage type, as shown below.
	
	If you roll the same number on both d8s, the chaotic energy leaps from the target to a different creature of your choice within 30 feet of it. Make a new attack roll against the new target, and make a new damage roll, which could cause the chaotic energy to leap again.

	A creature can be targeted only once by each casting of this spell.

	At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, each target takes 1d6 extra damage of the type rolled for each slot level above 1st.
*/
const version = "12.3.0";
const optionName = "Chaos Bolt";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "chaos-bolt-flag";
const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;

const _elementOptions = [
	{name: "acid", image: 'icons/magic/acid/projectile-faceted-glob.webp', color: 'greenorange'},
	{name: "cold", image: 'icons/magic/water/projectile-ice-snowball.webp', color: 'dark_bluewhite'},
	{name: "fire", image: 'icons/magic/fire/projectile-fireball-smoke-orange.webp', color: 'red'},
	{name: "force", image: 'icons/magic/sonic/projectile-sound-rings-wave.webp', color: 'blue'},
	{name: "lightning", image: 'icons/magic/lightning/orb-ball-blue.webp', color: 'blueyellow'},
	{name: "poison", image: 'icons/magic/unholy/projectile-missile-green.webp', color: 'greenorange'},
	{name: "psychic", image: 'icons/magic/lightning/orb-ball-purple.webp', color: 'purple'},
	{name: "thunder", image: 'icons/magic/air/air-wave-gust-blue.webp', color: 'purplepink'}
];

try {
	if (args[0].macroPass === "postDamageRoll") {
		const targetToken = workflow.hitTargets.first();
		if (targetToken) {
			// check the d8 damage dice to determine the damageType
			let damageTerms = workflow.damageRoll.terms;
			const firstRoll = damageTerms[0].results[0].result;
			const secondRoll = damageTerms[0].results[1].result;
			let firstElement = _elementOptions[firstRoll - 1];
			let secondElement = _elementOptions[secondRoll - 1];
			let doesLeap = firstRoll === secondRoll;
			let selectedElement = doesLeap ? firstElement : undefined;

			// ask which element to use
			if (!selectedElement) {
				selectedElement = await pickElement(firstElement, secondElement);
			}

			// change damage type based on rolls
			const newDamageRoll = CONFIG.Dice.DamageRoll.fromTerms(workflow.damageRoll.terms);
			for (let term of newDamageRoll.terms) {
				if (term instanceof Die) {
					term.options.flavor = selectedElement.name;
				}
			}
			await workflow.setDamageRoll(newDamageRoll);

			// ask for next target
			if (doesLeap) {
				let skipTargets = [];
				let flag = actor.getFlag(_flagGroup, flagName);
				if (flag) {
					// make sure this is from this combatTime, otherwise wipe out the prior targets
					if (combatTime === flag.castTime) {
						skipTargets = flag.skipTargets;
					}
				}

				// add current target to skip targets
				skipTargets.push(targetToken.id);

				let leapTargets = [];
				let possibleTargets = await MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.FRIENDLY, targetToken, 30, {
					canSee: true,
					includeIncapacitated: false
				});
				possibleTargets.forEach(target => {
					if (skipTargets.indexOf(target.id) < 0) {
						leapTargets.push(target);
					}
				});

				if (leapTargets.length > 0) {
					// save the prior targets
					await actor.setFlag(_flagGroup, flagName, {skipTargets: skipTargets, castTime: combatTime});

					let nextTarget = await pickNextTarget(leapTargets);
					if (nextTarget) {
						skipTargets.push(nextTarget.id);
						await actor.setFlag(_flagGroup, flagName, {skipTargets: skipTargets, castTime: combatTime});
					}
				}
			}
		}
	}
	else if (args[0].macroPass === "postActiveEffects") {
		const currentTargetToken = workflow.hitTargets.first();
		if (currentTargetToken) {
			let flag = actor.getFlag(_flagGroup, flagName);
			if (flag) {
				// make sure this is from this combatTime
				if (combatTime === flag.castTime) {
					const lastTargetId = flag.skipTargets[flag.skipTargets.length - 1];
					if (lastTargetId !== currentTargetToken.id) {
						// cast on the next target
						const nextTarget = canvas.tokens.get(lastTargetId);
						if (nextTarget) {
							let leapItem = foundry.utils.duplicate(item);
							let feature = new CONFIG.Item.documentClass(leapItem, {'parent': workflow.actor});
							let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions([nextTarget.document.uuid]);
							await MidiQOL.completeItemUse(feature, config, options);
							await HomebrewMacros.wait(250);
						}
					}
				}
			}
		}
	}

} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}

async function pickElement(first, second) {
	let content = `
            <label><img src=${first.image} width='30' height='30' style='border: 5px; vertical-align: middle;'/><input type="radio" name="choice" value="${first.name}" checked />  ${first.name} </label>
            <label><img src=${second.image} width='30' height='30' style='border: 5px; vertical-align: middle;'/><input type="radio" name="choice" value="${second.name}" checked />  ${second.name} </label>
        `;

	let elementName = await foundry.applications.api.DialogV2.prompt({
		content: content,
		rejectClose: false,
		ok: {
			callback: (event, button, dialog) => {
				return button.form.elements.choice.value;
			}
		},
		window: {
			title: `${optionName} - Bolt Damage Type`
		},
		position: {
			width: 400
		}
	});

	if (elementName === first.name)
		return first;

	return second;
}

async function pickNextTarget(leapTargets) {
	const menuOptions = {};
	menuOptions["buttons"] = [
		{ label: "Leap Bolt", value: true },
		{ label: "Cancel", value: false }
	];

	// token.document.texture.src
	menuOptions["inputs"] = [];
	leapTargets.forEach(item => {
		menuOptions["inputs"].push({ type: "radio",
			label: `${item.name}`,
			value: item,
			options: "group1" });
	});

	let choice = await HomebrewHelpers.menu( menuOptions,
		{ title: `${optionName} - Leap Target`, options: { height: "100%", width: "100%" } });

	let targetButton = choice.buttons;
	if (targetButton) {
		const selectedIndex = choice.inputs.indexOf(true);
		if (selectedIndex >= 0) {
			return leapTargets[selectedIndex];
		}
	}

	return undefined;
}
