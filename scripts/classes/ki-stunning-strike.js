/*
	Starting at 5th level, you can interfere with the flow of ki in an opponent's body. When you hit another creature with
	a melee weapon attack, you can spend 1 ki point to attempt a stunning strike. The target must succeed on a Constitution
	saving throw or be stunned until the end of your next turn.
*/	
const version = "11.1";
const kiName = "Ki";
const optionName = "Stunning Strike";
const cost = 1;

try {
	if ((args[0].macroPass === "DamageBonus") && (workflow.hitTargets.size > 0)) {
		const targetToken = workflow.hitTargets.first();

		// make sure it's an allowed attack
		if (!["mwak"].includes(workflow.item.system.actionType)) {
			console.log(`${optionName} not allowed: not an mwak`);
			return {};
		}

		const reach = workflow.item.system.properties.rch;
		const thrown = workflow.item.system.properties.thr;
		const tokenDistance = MidiQOL.computeDistance(token, targetToken, true);
		if ((tokenDistance > 5) && thrown && !reach) {
			console.log(`${optionName} not allowed: ranged attack`);
			return {};
		}

		// check resources
		let usesLeft = 0;
		let kiFeature = actor.items.find(i => i.name === kiName);
		if (kiFeature) {
			usesLeft = kiFeature.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < cost) {
				console.log(`${optionName} - not enough Ki left`);
				return {};
			}
		}
		else {
			console.log(`${optionName} - no ${kiName} item on actor`);
			return {};
		}

		let dialog = new Promise((resolve, reject) => {
		  new Dialog({
		  // localize this text
		  title: optionName,
		  content: `<p>Use Stunning Strike? (${usesLeft} Ki available)</p>`,
		  buttons: {
			  one: {
				  icon: '<i class="fas fa-check"></i>',
				  label: "Yes",
				  callback: () => { resolve(true) }
			  },
			  two: {
				  icon: '<i class="fas fa-times"></i>',
				  label: "No",
				  callback: () => { resolve(false) }
			  }
		  },
		  default: "two"
		  }).render(true);
		});
	   let useFeature = await dialog;

		if (useFeature) {
			const abilityBonus = actor.system.abilities.wis.mod;
			const dc = 8 + actor.system.attributes.prof + abilityBonus;
			const saveFlavor = `${CONFIG.DND5E.abilities["con"]} DC${dc} ${optionName || ""}`;
			
			let saveRoll = await targetToken.actor.rollAbilitySave("con", {flavor: saveFlavor, damageType: "stun"});
			await game.dice3d?.showForRoll(saveRoll);
			if (saveRoll.total < dc) { 
				// Apply stunned
				const effectData = {
					label: "Stunned",
					icon: "modules/dfreds-convenient-effects/images/stunned.svg",
					origin: actor.uuid,
					duration: {startTime: game.time.worldTime, seconds: 60},
					changes: [
						{
							key: 'macro.CE',
							mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
							value: "Stunned",
							priority: 20
						}
					],
					flags: {
						dae: {
							selfTarget: false,
							stackable: "none",
							durationExpression: "",
							macroRepeat: "none",
							specialDuration: ["turnEndSource"],
							transfer: false
						}
					},
					disabled: false
				};
				
				await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: [effectData] });
			}

			const newValue = kiFeature.system.uses.value - cost;
			await kiFeature.update({"system.uses.value": newValue});
		}
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
