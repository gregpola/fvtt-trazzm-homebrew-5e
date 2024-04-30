/*
	Objects come to life at your command. Choose up to ten nonmagical objects within range that are not being worn or carried. Medium targets count as two objects, Large targets count as four objects, Huge targets count as eight objects. You can't animate any object larger than Huge. Each target animates and becomes a creature under your control until the spell ends or until reduced to 0 hit points.
	
	An animated object is a construct with AC, hit points, attacks, Strength, and Dexterity determined by its size. Its Constitution is 10 and its Intelligence and Wisdom are 3, and its Charisma is 1. Its speed is 30 feet; if the object lacks legs or other appendages it can use for locomotion, it instead has a flying speed of 30 feet and can hover. If the object is securely attached to a surface or a larger object, such as a chain bolted to a wall, its speed is 0. It has Blindsight with a radius of 30 feet and is blind beyond that distance. When the animated object drops to 0 hit points, it reverts to its original object form, and any remaining damage carries over to its original object form.
	
	If you command an object to attack, it can make a single melee attack against a creature within 5 feet of it. It makes a slam attack with an attack bonus and bludgeoning damage determined by its size. The GM might rule that a specific object inflicts slashing or piercing damage based on its form.
	
	At Higher Levels. If you cast this spell using a spell slot of 6th level or higher, you can animate two additional objects for each slot level above 5th.	
*/
const version = "11.0";
const optionName = "Animate Objects";
const summonChoices = "animated-objects-choices";
const summonFlag = "animated-objects";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

const summonOptions = new Map([['tiny', 'oTegQQ5gS1E2Rrtz'],
	['small', 'XGVr2FDd2bfr9hZc'],
	['medium', 'b9FbMxVqMfPVoCrF'],
	['large', 'VePAFYyY3VKgI10p'],
	['huge', 'VsrvIw6cfqwcyQVe']]);

try {
	if (args[0].macroPass === "preItemRoll") {
		const spellLevel = item?.data?.level ? item.data.level : 5;
		const summonCountBonus = 2 * (spellLevel - 5);
		
		// Ask which option they wish to animate
		let animateChoices = new Set();
		animateChoices.add({ type: "radio", 
			label: `${Number(summonCountBonus + 10)} tiny objects`, 
			value: ['tiny', Number(summonCountBonus + 10)], 
			options: "group1" });
		animateChoices.add({ type: "radio", 
			label: `${Number(summonCountBonus + 10)} small objects`, 
			value: ['small', Number(summonCountBonus + 10)], 
			options: "group1" });
		animateChoices.add({ type: "radio", 
			label: `${Math.floor(Number(summonCountBonus + 10)/2)} medium objects`, 
			value: ['medium', Math.floor(Number(summonCountBonus + 10)/2)], 
			options: "group1" });
		animateChoices.add({ type: "radio", 
			label: `${Math.floor(Number(summonCountBonus + 10)/4)} large objects`, 
			value: ['large', Math.floor(Number(summonCountBonus + 10)/4)], 
			options: "group1" });
		animateChoices.add({ type: "radio", 
			label: `${Math.floor(Number(summonCountBonus + 10)/8)} huge objects`, 
			value: ['huge', Math.floor(Number(summonCountBonus + 10)/8)], 
			options: "group1" });

		const menuOptions = {};
		menuOptions["buttons"] = [
			{ label: "Animate!", value: true },
			{ label: "Cancel", value: false }
		];
		menuOptions["inputs"] = Array.from(animateChoices);
		let choice = await warpgate.menu(menuOptions, 
			{ title: `${optionName}: which option?`, options: { height: "100%", width: "150px" } });
		let targetButton = choice.buttons;

		if (targetButton) {
			const selectedIndex = choice.inputs.indexOf(true);
			if (selectedIndex >= 0) {
				const selectedObjects = menuOptions["inputs"][selectedIndex];
				await actor.setFlag(_flagGroup, summonChoices, selectedObjects.value);
			}

			return true;
		}

		return false;
	}
	else if (args[0] === "on") {
        if (!game.modules.get("warpgate")?.active)
			ui.notifications.error("Please enable the Warp Gate module");

		const choice = actor.getFlag(_flagGroup, summonChoices);
		if (choice) {
			await actor.unsetFlag(_flagGroup, summonChoices);
			const size = choice[0];
			const quantity = Number(choice[1]);
			
			// build the update data to match summoned traits
			const summonName = `Animated Object (${actor.name})`;
			let updates = {
				token: {
					"name": summonName,
					"disposition": token.document.disposition,
					"actorLink": false,
					"flags": { "fvtt-trazzm-homebrew-5e": { "Animated Object" : { "ActorId": actor.id } } }
				},
				"name": summonName
			};
			
			// Get from the compendium
			const summonId = summonOptions.get(size);
			let entity = await fromUuid("Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-actors." + summonId);
			if (!entity) {
				return ui.notifications.error(`${optionName} - unable to find the actor (${summonId})`);
			}

			// import the actor
			let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), summonId, updates);
			if (!document) {
				return ui.notifications.error(`${optionName} - unable to import from the compendium`);
			}
			await warpgate.wait(500);
			let summonActor = game.actors.getName(summonName);
		
			// Spawn the result
			const maxRange = item.system.range.value ? item.system.range.value : 120;
			const objectInitiative = token.combatant ? (token.combatant.initiative ? token.combatant.initiative - 1 : 1) : 0;
		
			for (let x = 0; x < quantity; x++) {
				let position = await HomebrewMacros.warpgateCrosshairs(token, maxRange, item, summonActor.prototypeToken);
				
				if (position) {
					let options = {collision: true};
					let spawned = await warpgate.spawnAt(position, summonName, updates, { controllingActor: actor }, options);
					if (!spawned || !spawned[0]) {
						ui.notifications.error(`${optionName} - unable to animate the object`);
					}

					let summonedToken = canvas.tokens.get(spawned[0]);
					if (summonedToken && token.combatant) {
						await summonedToken.toggleCombat();
						await summonedToken.combatant.update({initiative: objectInitiative});
					}
				}			
			}

			// keep track of the spawned critters, so that they can be deleted after the spell expires
			await actor.setFlag(_flagGroup, summonFlag, summonName);
		}
		
	}
	else if (args[0] === "off") {
		// delete the summons
		const summonName = actor.getFlag(_flagGroup, summonFlag);
		if (summonName) {
			await actor.unsetFlag(_flagGroup, summonFlag);
			
			let tokens = canvas.tokens.ownedTokens.filter(i => i.name.startsWith(summonName));
			for (let i = 0; i < tokens.length; i++) {
				await warpgate.dismiss(tokens[i].id, game.canvas.scene.id);
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
