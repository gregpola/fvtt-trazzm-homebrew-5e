/*
	You seize the air and compel it to create one of the following effects at a point you can see within range:

		* One Medium or smaller creature that you choose must succeed on a Strength saving throw or be pushed up to 5 feet away from you.
		* You create a small blast of air capable of moving one object that is neither held nor carried and that weighs no more than 5 pounds. The object is pushed up to 10 feet away from you. It isn’t pushed with enough force to cause damage.
		* You create a harmless sensory effect using air, such as causing leaves to rustle, wind to slam shutters shut, or your clothing to ripple in a breeze.
*/
const version = "10.0.0";
const optionName = "Gust";

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	let actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0].macroPass === "postActiveEffects") {
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		const sourceItem = await fromUuid(lastArg.itemUuid);
		const spellcastingAbility = actor.system.attributes.spellcasting;
		const maxRange = sourceItem.system.range.value ? sourceItem.system.range.value : 30;
		
		// first ask which effect they want
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: '<p>Which option do you want?</p>',
				buttons: {
					one: {
						label: "<p>Push Creature</p>",
						callback: () => resolve(1)
					},
					two: {
						label: "<p>Push Object</p>",
						callback: () => { resolve(2) }
					},
					three: {
						label: "<p>Sensory Effect</p>",
						callback: () => { resolve(3) }
					}
				},
				default: "one"
			}).render(true);
		});
		
		let choice = await dialog;
		if (choice) {
			// get the possible targets
			let possibleTargets = [];
			let position = await HomebrewMacros.warpgateCrosshairs(actorToken, maxRange, sourceItem);
			if (position) {
				const targetObjects = await canvas.tokens.placeables.filter(t => {
					const detectX = position.x.between(t.document.x, t.document.x + canvas.grid.size * t.document.width);
					const detectY = position.y.between(t.document.y, t.document.y + canvas.grid.size * t.document.height-1);
					return detectX && detectY;
				});
				
				if (targetObjects && (targetObjects.length > 0)) {
					for (const t of targetObjects) {
						possibleTargets.push(t);
					}
				}

			}
			else {
				return ui.notifications.error(`${optionName} - invalid gust location`);
			}
			
			if (choice === 1) {
				if (possibleTargets.length === 0) {
					return ui.notifications.error(`${optionName} - no targets at gust location`);
				}
		
				let targetToken = possibleTargets[0];
				const spellcastingAbility = actor.system.attributes.spellcasting;
				const abilityBonus = actor.system.abilities[spellcastingAbility].mod;
				const dc = 8 + actor.system.attributes.prof + abilityBonus;
				const flavor = `${CONFIG.DND5E.abilities["str"]} DC${dc} ${optionName}`;
				let saveRoll = await targetToken.actor.rollAbilitySave("str", {flavor: flavor, damageType: "push"});
				await game.dice3d?.showForRoll(saveRoll);
				if (saveRoll.total < dc) {
					await HomebrewMacros.pushTarget(actorToken, targetToken, 1);
				}					
			}
			else if (choice === 2) {
				if (possibleTargets.length === 0) {
					return ui.notifications.error(`${optionName} - no targets at gust location`);
				}

				let targetToken = possibleTargets[0];
				await HomebrewMacros.pushTarget(actorToken, targetToken, 2);
			}
			else if (choice === 3) {
				// not sure what to do here
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
