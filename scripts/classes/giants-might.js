/*
	You have learned how to imbue yourself with the might of giants. As a bonus action, you magically gain the following benefits, which last for 1 minute:

		* If you are smaller than Large, you become Large, along with anything you are wearing. If you lack the room to become Large, your size doesn’t change.

		* You have advantage on Strength checks and Strength saving throws.
		
		* Once on each of your turns, one of your attacks with a weapon or an unarmed strike can deal an extra 1d6 damage to a target on a hit.

	You can use this feature a number of times equal to your proficiency bonus, and you regain all expended uses of it when you finish a long rest.
*/
const version = "10.0.0";
const optionName = "Giant’s Might";
const mutationFlag = "giants-might";
const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0] === "on") {
		let runicJuggs = actor.items.getName("Runic Juggernaut");
		if (runicJuggs) {
			// ask what size they want to grow to
			new Dialog({
				title: 'Runic Juggernaut',
				content: 'What size do you want to grow to?',
				buttons:
				{
					Large:
					{
						label: `Large`,
						callback: async () => {
							const updates = {
								token: {
									width: 2,
									height: 2
								},
								actor: {
									"system.traits.size": "lg"
								}
							}
							await warpgate.mutate(actorToken.document, updates, {}, { name: mutationFlag });
						}
					},
					Huge:
					{
						label: `Huge`,
						callback: async () => {
							const updates = {
								token: {
									width: 3,
									height: 3
								},
								actor: {
									"system.traits.size": "huge"
								}
							}
							await warpgate.mutate(actorToken.document, updates, {}, { name: mutationFlag });
						}
					}
				}
			}).render(true);
		}
		else {
			const updates = {
				token: {
					width: 2,
					height: 2
				},
				actor: {
					"system.traits.size": "lg"
				}
			}
			await warpgate.mutate(actorToken.document, updates, {}, { name: mutationFlag });
		}
		
	}
	else if (args[0] === "off") {
		await warpgate.revert(actorToken.document, mutationFlag);
	}
	else if (args[0].macroPass === "DamageBonus") {
		
		// make sure it's an allowed attack
		if (!["mwak", "rwak"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}
		
		// check once per turn
		if (isAvailableThisTurn(actor) && game.combat) {
			// ask if they want to use it
			let dialog = new Promise((resolve, reject) => {
				new Dialog({
					// localize this text
					title: optionName,
					content: `<p>Add extra damage to this attack (once per turn)?</p>`,
					buttons: {
						one: {
							icon: '<p> </p><img src = "icons/magic/earth/strike-fist-stone-gray.webp" width="50" height="50"></>',
							label: "<p>Yes</p>",
							callback: () => resolve(true)
						},
						two: {
							icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
							label: "<p>No</p>",
							callback: () => { resolve(false) }
						}
					},
					default: "two"
				}).render(true);
			});
			
			let useFeature = await dialog;
			if (useFeature) {
				await actor.setFlag('midi-qol', 'giantsMightTime', `${combatTime}`);

				const diceCount = lastArg.isCritical ? 2: 1;
				let die = "d6";
				let greatStature = actor.items.getName("Great Stature");
				if (greatStature) {
					die = "d8";
				}
				let runicJuggs = actor.items.getName("Runic Juggernaut");
				if (runicJuggs) {
					die = "d10";
				}
				
				return {damageRoll: `${diceCount}${die}[${lastArg.damageDetail[0].type}]`, flavor: optionName};
			}
		}		
	}
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}

function isAvailableThisTurn(actor) {
	if (game.combat) {
		const lastTime = actor.getFlag("midi-qol", "giantsMightTime");
		if (combatTime === lastTime) {
			return false;
		}
		
		return true;
	}
	
	return false;
}
