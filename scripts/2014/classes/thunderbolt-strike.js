/*
	At 6th level, when you deal lightning damage to a Large or smaller creature, you can also push it up to 10 feet away from you.
*/
const version = "12.3.0";
const optionName = "Thunderbolt Strike";

try {
	if ((args[0].macroPass === "DamageBonus") && (workflow.hitTargets.size > 0)) {
		const targetToken = workflow.hitTargets.first();
		
		// check the damage type
		if (workflow.damageDetail.filter(i=>i.type === "lightning").length < 1) {
			console.log(`${optionName} - not lightning damage`);
			return {};
		}
			
		// check the target's size, must be Large or smaller
		const tsize = targetToken.actor.system.traits.size;
		if (!["tiny","sm","med","lg"].includes(tsize)) {
			console.log(`${optionName} - target is too large to push`);
			return {};
		}

		// ask if they want to use the option
		const content = `
				<p>Use ${optionName} to push the target up to 10 feet away?</p>
				<label><input type="radio" name="choice" value="10" checked>  10 feet </label>
				<label><input type="radio" name="choice" value="5">  5 feet </label>`;

		let distancePushed = await foundry.applications.api.DialogV2.prompt({
			content: content,
			rejectClose: false,
			ok: {
				label: "Push Target",
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

		if (distancePushed) {
			await HomebrewMacros.pushTarget(token, targetToken, distancePushed === '10' ? 2 : 1);
		}
	}

} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
