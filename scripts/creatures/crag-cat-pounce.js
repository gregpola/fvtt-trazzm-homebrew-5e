/*
	If the cat moves at least 20 feet straight toward a creature and then hits it with a claw attack on the same turn,
	that target must succeed on a DC 13 Strength saving throw or be knocked prone. If the target is prone, the cat can
	make one bite attack against it as a bonus action.
 */
const version = "12.3.0";
const optionName = "Pounce";

try {
	let targetToken = workflow?.hitTargets?.first();

	if ((args[0].macroPass === "postActiveEffects") && targetToken) {
		const saveDC = 13;
		const saveFlavor = `${CONFIG.DND5E.abilities["str"].label} Save DC: ${saveDC} - ${optionName}`;
		let saveRoll = await targetToken.actor.rollAbilitySave("str", {flavor: saveFlavor});
		if (saveRoll.total < saveDC) {
			await HomebrewEffects.applyProneEffect(targetToken.actor, item);
			ChatMessage.create({'content': `${token.name} knocks ${targetToken.name} prone!`});

			// make bite attack as a bonus action
			let biteItem = actor.items.find(i => i.name === "Bite");
			if (biteItem) {
				const weaponCopy = biteItem.toObject();
				delete weaponCopy._id;
				weaponCopy.system.range.value = 999;
				const attackItem = new CONFIG.Item.documentClass(weaponCopy, { parent: actor });

				let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions();
				await MidiQOL.completeItemUse(attackItem, config, options);
				await HomebrewMacros.wait(250);
			}
		}
	}
	else if (args[0].macroPass === "preItemRoll") {
		targetToken = workflow?.targets?.first();
		return await HomebrewMacros.chargeTarget(token, targetToken, 20);
	}
	
} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}
