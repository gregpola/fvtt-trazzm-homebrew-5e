/*
	A swarm of intangible nature spirits has bonded itself to you and can assist you in battle. While you’re alive, the
	swarm remains in your space, crawling on you or flying and skittering around you within your space. You determine
	its appearance, or you generate its appearance by rolling on the Swarm Appearance table.

	Once on each of your turns, you can cause the swarm to assist you in one of the following ways, immediately after
	you hit a creature with an attack:

		* The attack’s target takes 1d6 piercing damage from the swarm.
		* The attack’s target must succeed on a Strength saving throw against your spell save DC or be moved by the swarm up to 15 feet horizontally in a direction of your choice. 
		* You are moved by the swarm 5 feet horizontally in a direction of your choice.
*/
const version = "12.3.2";
const optionName = "Gathered Swarm";
const timeFlag = "gathered-swarm-time";

try {
	if (args[0].macroPass === "DamageBonus") {
		const targetToken = workflow.hitTargets.first();

		// Skip if the action isn't an weapon attack roll
		if (!["mwak", "rwak", "msak", "rsak"].includes(workflow.item.system.actionType)) {
			console.log(`${optionName} - action type isn't applicable`);
			return {};
		}
		
		// check once per turn
		if (HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) && game.combat) {
			// ask if they want to use the feature
			const content = `
			<p>Use an swarm option on this attack?</p>
			<label style="margin-right: 10px; margin-bottom: 10px;"><input type="radio" name="choice" value="damage" checked>   Extra 1d6 piercing damage  </label>
			<label style="margin-right: 10px; margin-bottom: 10px;"><input type="radio" name="choice" value="moveTarget">   Attempt to move your target </label>
			<label style="margin-right: 10px; margin-bottom: 10px;"><input type="radio" name="choice" value="moveSelf">   Move 5 feet in the direction of your choice </label>`;

			let featureOption = await foundry.applications.api.DialogV2.prompt({
				content: content,
				rejectClose: false,
				ok: {
					callback: (event, button, dialog) => {
						return button.form.elements.choice.value;
					}
				},
				window: {
					title: `${optionName}`,
				},
				position: {
					width: 400
				}
			});

			if (featureOption) {
				await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
				let mightySwarm = actor.items.getName("Mighty Swarm");
				switch (featureOption) {
					// extra damage
					case 'damage':
						const diceCount = workflow.isCritical ? 2: 1;
						const die = mightySwarm ? 'd8' : 'd6';
						return {damageRoll: `${diceCount}${die}[piercing]`, flavor: optionName};
					
					// move target
					case 'moveTarget':
						const dc = actor.system.attributes.spelldc;
						const flavor = `${CONFIG.DND5E.abilities["str"].label} DC${dc} ${optionName}`;
						let saveRoll = await targetToken.actor.rollAbilitySave("str", {flavor: flavor, damageType: "push"});
						await game.dice3d?.showorkfloworRoll(saveRoll);
						if (saveRoll.total < dc) {
							await HomebrewMacros.pushTarget(token, targetToken, 3)

							if (mightySwarm) {
								await HomebrewEffects.applyProneEffect(targetToken.actor, item.uuid);
							}
						}					
						break;
					
					// move yourself
					case 'moveSelf':
						await HomebrewMacros.teleportToken(token, 5);

						if (mightySwarm) {
							let hasCover = actor.getRollData().effects.find(eff => eff.name.startsWith('Cover '));
							if (!hasCover) {
								await HomebrewEffects.applyHalfCoverEffect(actor, ['turnStart']);
							}
						}
						break;
				}
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
