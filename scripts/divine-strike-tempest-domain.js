const version = "0.1.0";
const optionName = "Divine Strike (Tempest Domain)";
const timeFlag = "divineStrikeTempestDomain";

try {
	if (args[0].macroPass === "DamageBonus") {	
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		const target = args[0].hitTargets[0];
		let tactor = target?.actor;
		const ttoken = canvas.tokens.get(args[0].hitTargets[0].object.id);
		let pusher = canvas.tokens.get(args[0].tokenId);

		// validate targeting
		if (!actor || !target) {
		  console.log(`${optionName}: no target selected`);
		  return {};
		}

		// make sure it's an allowed attack
		const at = args[0].item?.data?.actionType;
		if (!at || !["mwak", "rwak"].includes(at)) {
			console.log(`${optionName}: not an eligible attack: ${at}`);
			return {};
		}

		// Check for availability i.e. once per actors turn
		if (!isAvailableThisTurn() || !game.combat) {
			console.log(`${optionName}: is not available for this attack`);
			return;
		}

		// ask if they want to use the option
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Apply ${optionName} to this attack?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/weapons/swords/sword-flanged-lightning.webp" width="30" height="30"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
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
			const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
			const lastTime = actor.getFlag("midi-qol", timeFlag);
			if (combatTime !== lastTime) {
				await actor.setFlag("midi-qol", timeFlag, combatTime)
			}
			
			// add damage bonus
			const clericLevel = actor.classes?.cleric?.data?.data?.levels ?? 0;
			const damageType = game.i18n.localize("thunder");
			const levelMulti = clericLevel > 13 ? 2 : 1;
			const critMulti = args[0].isCritical ? 2: 1;
			const totalDice = levelMulti * critMulti;
			return {damageRoll: `${totalDice}d8[${damageType}]`, flavor: optionName};
		}
	}


} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}

function isAvailableThisTurn() {
	if (game.combat) {
	  const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
	  const lastTime = actor.getFlag("midi-qol", timeFlag);
	  if (combatTime === lastTime) {
	   console.log(`${optionName}: Already used this turn`);
	   return false;
	  }
	  
	  return true;
	}
	
	return false;
}
