/*
	When you hit a creature with your natural weapons while you are raging, the beast within you can curse your target with rabid fury. The target must succeed on a Wisdom saving throw (DC equal to 8 + your Constitution modifier + your proficiency bonus) or suffer one of the following effects (your choice):

	The target must use its reaction to make a melee attack against another creature of your choice that you can see.
	The target takes 2d12 psychic damage.

	You can use this feature a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest.
*/
const version = "10.0.0";
const optionName = "Infectious Fury";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	const targetActor = lastArg.hitTargets[0].actor;
	
	if (args[0].macroPass === "DamageBonus") {
		// make sure raging
		let rageEffect = actor.effects.find(i => i.label === "Rage");
		if (!rageEffect) {
			console.log(`${optionName}: not raging`);
			return {};
		}
		
		// make sure Form of the Beast is active 
		let transformEffect = actor.effects.find( i => i.label === "Form of the Beast");
		if (!transformEffect) {
			console.log(`${optionName}: not transformed`);
			return {};
		}
		
		// make sure the feature has uses available
		let featureItem = actor.items.getName(optionName);
		if (!featureItem) {
			console.error(`${optionName} - feature not found`);
			return {};
		}
		
		const usesLeft = featureItem.system.uses?.value ?? 0;
		if (!usesLeft) {
			console.error(`${optionName} - out of uses`);
			return {};
		}
		
		// ask if they want to use the option
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Curse your target with rabid fury?</p><p>(${usesLeft} uses remaining)</p>`,
				buttons: {
					one: {
						label: "<p>The target must use its reaction to make a melee attack against another creature of your choice that you can see.</p>",
						callback: () => resolve(1)
					},
					two: {
						label: "<p>The target takes 2d12 psychic damage</p>",
						callback: () => { resolve(2) }
					},
					cancel: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="30" height="30"></>',
						label: "<p>No</p>",
						callback: () => { resolve(false) }
					}
				},
				default: "two"
			}).render(true);
		});
		
		let useFeature = await dialog;
		if (useFeature) {
			const pb = actor.system.attributes.prof ?? 2;
			const conMod = actor.system.abilities.con.mod;
			const saveDC = 8 + pb + conMod;
			const saveFlavor = `${CONFIG.DND5E.abilities["wis"].label} DC${saveDC} ${optionName}`;

			if (useFeature === 1) {
				// reduce feature uses
				await featureItem.update({ "system.uses.value": usesLeft - 1 });
				let saveRoll = await targetActor.rollAbilitySave("wis", {flavor: saveFlavor});
				await game.dice3d?.showForRoll(saveRoll);
				if (saveRoll.total < saveDC) {
					ChatMessage.create({
						content: `${targetActor.name} is forced to use it's reaction to make an attack against ${actor.name}'s choice`,
						speaker: ChatMessage.getSpeaker({ actor: actor })});					
				}

			}
			else if (useFeature === 2) {
				// reduce feature uses
				await featureItem.update({ "system.uses.value": usesLeft - 1 });
				let saveRoll = await targetActor.rollAbilitySave("wis", {flavor: saveFlavor, damageType: "psychic"});
				await game.dice3d?.showForRoll(saveRoll);
				if (saveRoll.total < saveDC) {
					const damageRoll = await new Roll(`2d12`).evaluate({ async: false });
					await game.dice3d?.showForRoll(damageRoll);
					return {damageRoll: `${damageRoll.total}[psychic]`, flavor: `${optionName} Damage`};		
				}
				
			}
		}
		
		return {};
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
