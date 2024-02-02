const version = "11.0";
const optionName = "Stabilize Action";

try {
	const targetToken = workflow.targets.first();

	// validate that the target can be stabilized
	const currentHP = targetToken.actor?.system.attributes.hp.value ?? 1;
	const deathSaves = targetToken.actor?.system.attributes.death.success ?? 0;
	const deathFails = targetToken.actor?.system.attributes.death.failure ?? 0;

	if ((currentHP > 0) || (deathSaves > 2) || (deathFails > 2)) {
		ChatMessage.create({'content': `${targetToken.name} is not eligible for stabilization`})
		return ui.notifications.error(`${optionName}: ${version} - target is not eligible for stabilization`);
	}

	// ask for a medicine skill check
	await game.MonksTokenBar.requestRoll([{ token: token }], {
		request:[{"type":"skill", "key":"med"}],
		dc:10, showdc:true, silent:true, fastForward:false,
		flavor:`Attempt to stabilize: ${targetToken.name}`,
		rollMode:'roll',
		callback: async (result) => {
			console.log(result);
			if (result.passed) {
				ChatMessage.create({'content': `${token.name} stabilizes ${targetToken.name}`})
				await targetToken.actor.update({"system.attributes.death.success": 3});
			}
		}
	});
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
