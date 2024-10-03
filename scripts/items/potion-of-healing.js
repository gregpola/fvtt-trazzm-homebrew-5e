
+onst version = "10.0";
const optionName = "Potion of Healing";

try {
	if (args[0].macroPass === "preambleComplete") {
		if(args[0].targets.length === 0) 
			return ui.notifications.warn(`Please select a target.`);
		
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		let target = args[0].hitTargets[0];
		let tactor = target?.actor;
		const token = await canvas.tokens.get(args[0].tokenId);
		const healingType = "healing";

		// ask which optional house-rule they are using
		// self target
		if (actor === tactor) {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Which potion usage option are you using?</p>`,
				buttons: {
					one: {
						label: "<p>Self</p><p>Bonus Action</p><p>(Normal)</p>",
						callback: async (html) => {
							let healDamage = new Roll(`2d4+2`).evaluate({ async: false });
							await new MidiQOL.DamageOnlyWorkflow(tactor, token, healDamage.total, healingType, [target], healDamage, { flavor: `(${CONFIG.DND5E.healingTypes[healingType]})`, itemCardId: args[0].itemCardId, useOther: false });
						}
					},
					two: {
						label: "<p>Self</p>Action</p><p>(Max)</p>",
						callback: async (html) => {
							let healDamage = new Roll(`10`).evaluate({ async: false });
							await new MidiQOL.DamageOnlyWorkflow(tactor, token, healDamage.total, healingType, [target], healDamage, { flavor: `(${CONFIG.DND5E.healingTypes[healingType]})`, itemCardId: args[0].itemCardId, useOther: false });
						}
					},
					three: {
						label: "<p>Self</p><p>During Rest</p><p>(Max + Con)</p>",
						callback: async (html) => {
							const conMod = actor.system.abilities.con.mod;
							let healDamage = new Roll(`10+${conMod}`).evaluate({ async: false });
							await new MidiQOL.DamageOnlyWorkflow(tactor, token, healDamage.total, healingType, [target], healDamage, { flavor: `(${CONFIG.DND5E.healingTypes[healingType]})`, itemCardId: args[0].itemCardId, useOther: false });
						}
					},
					cancel: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
						label: "<p>Cancel</p>",
						callback: () => { return; }
					}
				},
				default: "one"
			}).render(true);
			
		}
		else {
		// other target
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Which potion feeding option are you using?</p>`,
				buttons: {
					one: {
						label: "<p>Other</p>Action</p><p>(Normal)</p>",
						callback: async (html) => {
							let healDamage = new Roll(`2d4+2`).evaluate({ async: false });
							await new MidiQOL.DamageOnlyWorkflow(tactor, token, healDamage.total, healingType, [target], healDamage, { flavor: `(${CONFIG.DND5E.healingTypes[healingType]})`, itemCardId: args[0].itemCardId, useOther: false });
						}
					},
					two: {
						label: "<p>Other</p>During Rest</p><p>(Max + Con)</p>",
						callback: async (html) => {
							const conMod = tactor.system.abilities.con.mod;
							let healDamage = new Roll(`10+${conMod}`).evaluate({ async: false });
							await new MidiQOL.DamageOnlyWorkflow(tactor, token, healDamage.total, healingType, [target], healDamage, { flavor: `(${CONFIG.DND5E.healingTypes[healingType]})`, itemCardId: args[0].itemCardId, useOther: false });
						}
					},
					cancel: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
						label: "<p>Cancel</p>",
						callback: () => { return; }
					}
				},
				default: "one"
			}).render(true);
			
		}

	}

} catch (err) {
    console.error(`${optionName} v${version}`, err);
}
