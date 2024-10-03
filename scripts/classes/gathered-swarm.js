/*
	A swarm of intangible nature spirits has bonded itself to you and can assist you in battle. While you’re alive, the swarm remains in your space, crawling on you or flying and skittering around you within your space. You determine its appearance, or you generate its appearance by rolling on the Swarm Appearance table.

	Once on each of your turns, you can cause the swarm to assist you in one of the following ways, immediately after you hit a creature with an attack:

		* The attack’s target takes 1d6 piercing damage from the swarm.
		* The attack’s target must succeed on a Strength saving throw against your spell save DC or be moved by the swarm up to 15 feet horizontally in a direction of your choice. 
		130* You are moved by the swarm 5 feet horizontally in a direction of your choice.
*/
const version = "12.3.0";
const optionName = "Gathered Swarm";
const timeFlag = "gathered-swarm-time";
const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;

try {
	if (args[0].macroPass === "DamageBonus") {
		const actorToken = token;
		const targetToken = workflow.hitTargets.first();

		// Skip if the action isn't an weapon attack roll
		if (!["mwak", "rwak", "msak", "rsak"].includes(workflow.item.system.actionType)) {
			console.log(`${optionName} - action type isn't applicable`);
			return {};
		}
		
		// check once per turn
		if (isAvailableThisTurn(actor) && game.combat) {
			// ask if they want to use the feature
			let dialog = new Promise((resolve, reject) => {
				new Dialog({
					// localize this text
					title: optionName,
					content: `<p>Use an option on this attack?</p>`,
					buttons: {
						one: {
							icon: '<p><img src = "icons/skills/melee/strike-blade-knife-blue-red.webp" width="50" height="50"></img></p>',
							label: "<p>Add damage</p>",
							callback: () => resolve(1)
						},
						two: {
							icon: '<p> </p><img src = "icons/equipment/hand/gauntlet-tooled-leather-brown.webp" width="50" height="50"></>',
							label: "<p>Move target</p>",
							callback: () => { resolve(2) }
						},
						three: {
							icon: '<p> </p><img src = "icons/skills/movement/feet-spurred-boots-brown.webp" width="50" height="50"></>',
							label: "<p>Move self</p>",
							callback: () => { resolve(3) }
						},
						cancel: {
							icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
							label: "<p>No</p>",
							callback: () => { resolve(0) }
						}
					},
					default: "cancel"
				}).render(true);
			});
			
			let featureOption = await dialog;
			if (featureOption) {
				await actor.setFlag('midi-qol', timeFlag, `${combatTime}`);
				let mightySwarm = actor.items.getName("Mighty Swarm");
				
				switch (featureOption) {
					// extra damage
					case 1:
						const diceCount = workflow.isCritical ? 2: 1;
						const die = mightySwarm ? 'd8' : 'd6';
						return {damageRoll: `${diceCount}${die}[piercing]`, flavor: optionName};
					
					// move target
					case 2:
						const spellcastingAbility = actor.system.attributes.spellcasting;
						const abilityBonus = actor.system.abilities[spellcastingAbility].mod;
						const dc = 8 + actor.system.attributes.prof + abilityBonus;
						const flavor = `${CONFIG.DND5E.abilities["str"].label} DC${dc} ${optionName}`;
						let saveRoll = await targetToken.actor.rollAbilitySave("str", {flavor: flavor, damageType: "push"});
						await game.dice3d?.showorkfloworRoll(saveRoll);
						if (saveRoll.total < dc) {
							await moveTarget(actorToken, targetToken, workflow.item);
							
							if (mightySwarm) {
								const uuid = targetToken.actor.uuid;
								const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Prone', uuid);
								if (!hasEffectApplied) {
									 await game.dfreds?.effectInterface.addEffect({ effectName: 'Prone', uuid });
								}
							}
						}					
						break;
					
					// move yourself
					case 3:
						await moveSelf(actorToken, workflow.item);
							
						if (mightySwarm) {
							let hasCover = await game.dfreds.effectInterface.hasEffectApplied('Cover (Half)', actor.uuid);
							if (!hasCover) {
								hasCover = await game.dfreds.effectInterface.hasEffectApplied('Cover (Three-Quarters)', actor.uuid);
							}							
							if (!hasCover) {
								await applyCover(actor, workflow.uuid);
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

function isAvailableThisTurn(actor) {
	if (game.combat) {
		const lastTime = actor.getFlag("midi-qol", timeFlag);
		if (combatTime === lastTime) {
			return false;
		}
		
		return true;
	}
	
	return false;
}

async function moveTarget(actorToken, targetToken, item) {
	await HomebrewMacros.teleportToken(targetToken, 15);
}

async function moveSelf(actorToken, item) {
	await HomebrewMacros.teleportToken(actorToken, 5);
}

async function applyCover(actor, origin) {
	const effectData = {
		label: "Cover (Half)",
		icon: "modules/dfreds-convenient-effects/images/broken-wall.svg",
		origin: origin,
		duration: {startTime: game.time.worldTime, seconds: 6},
		changes: [
			{
				key: 'macro.CE',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: "Cover (Half)",
				priority: 20
			}
		],
		flags: {
			dae: {
				selfTarget: false,
				stackable: "none",
				durationExpression: "",
				macroRepeat: "none",
				specialDuration: [
					"turnStartSource"
				],
				transfer: false
			}
		},
		disabled: false
	};
	
	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
}
	