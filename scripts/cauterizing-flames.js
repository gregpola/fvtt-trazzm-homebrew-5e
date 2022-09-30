const version = "0.1.0";
const optionName = "Cauterizing Flames";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// Make sure there is a target
		if(args[0].targets.length === 0) 
			return ui.notifications.warn(`Please select a target.`);
		
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		const token = await canvas.tokens.get(args[0].tokenId);
		const target = canvas.tokens.get(args[0].targets[0].id);
		const itemD = args[0].item;

		// ask which option to use
		new Dialog({
			// localize this text
			title: `${optionName}`,
			content: `<p>Do you want to damage or heal the target?</p>`,
			buttons: {
				damage: {
					icon: '<p> </p><img src = "icons/magic/fire/beam-jet-stream-yellow.webp" width="50" height="50"></>',
					label: "<p>Damage</p>",
					callback: async(html) => {
						const damageType = "fire";						
						let fireDamage = new Roll(`2d10`).evaluate({ async: false });
						new MidiQOL.DamageOnlyWorkflow(actor, token, fireDamage.total + actor.data.data.abilities.wis.mod, damageType, [target], fireDamage, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemCardId: args[0].itemCardId, useOther: false });
					}
				},
				heal: {
					icon: '<p> </p><img src = "icons/magic/life/cross-worn-green.webp" width="50" height="50"></>',
					label: "<p>Heal</p>",
					callback: async(html) => {
						const healingType = "healing";						
						let healDamage = new Roll(`2d10`).evaluate({ async: false });
						new MidiQOL.DamageOnlyWorkflow(actor, token, healDamage.total + actor.data.data.abilities.wis.mod, healingType, [target], healDamage, { flavor: `(${CONFIG.DND5E.healingTypes[healingType]})`, itemCardId: args[0].itemCardId, useOther: false });
					}
				},
				cancel: {
					icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
					label: "<p>Cancel</p>",
					callback: () => { return; }
				}
			},
			default: "damage"
		}).render(true);
		
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
