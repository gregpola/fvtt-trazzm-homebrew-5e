/*
	You create a long, vine-like whip covered in thorns that lashes out at your command toward a creature in range.
	Make a melee spell attack against the target. If the attack hits, the creature takes 1d6 piercing damage, and if the
	creature is Large or smaller, you pull the creature up to 10 feet closer to you.

	The spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6).
*/
const version = "12.3.0";
const optionName = "Thorn Whip";

try {
	const targetToken = workflow.hitTargets?.first();

	if (args[0].macroPass === "postActiveEffects" && targetToken) {
		// check the target's size, must be Large or smaller
		const tsize = targetToken.actor.system.traits.size;
		if (["tiny","sm","med","lg"].includes(tsize)) {
			// ask the player how far they want to pull the target
			const content = `
				<p>How far do you want to pull '${targetToken.name}'?</p>
				<label><input type="radio" name="choice" value="10" checked>  10 feet </label>
				<label><input type="radio" name="choice" value="5">  5 feet </label>`;

			let distancePulled = await foundry.applications.api.DialogV2.prompt({
				content: content,
				rejectClose: false,
				ok: {
					label: "Pull Target",
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

			if (distancePulled) {
				await HomebrewMacros.pullTarget(token, targetToken, distancePulled === '10' ? 2 : 1);
			}
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
