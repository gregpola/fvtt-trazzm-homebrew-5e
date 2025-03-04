const version = "12.3.0";
const optionName = "Potion of Supreme Healing";
const healingType = "healing";

try {
	if (args[0].macroPass === "preambleComplete") {
		const targetToken = workflow.targets.first();
		const selfTarget = (token === targetToken);

		let content = '<p>Which potion usage option are you using?</p>';

		if (selfTarget) {
			content += '<label><input type="radio" name="choice" value="self-bonus" checked style="margin-right: 10px; margin-bottom: 10px;" />Bonus Action (normal)</label>';
			content += '<label><input type="radio" name="choice" value="self-action" style="margin-right: 10px; margin-bottom: 10px;" />Action (max)</label>';
			content += '<label><input type="radio" name="choice" value="self-rest" style="margin-right: 10px; margin-bottom: 10px;" />During Rest (max + con)</label>';
		}
		else {
			content += '<label><input type="radio" name="choice" value="other-action" checked style="margin-right: 10px; margin-bottom: 10px;" />Action (normal)</label>';
			content += '<label><input type="radio" name="choice" value="other-rest" style="margin-right: 10px; margin-bottom: 10px;" />During Rest (max + con)</label>';
		}

		let flavor = await foundry.applications.api.DialogV2.prompt({
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

		if (flavor) {
			let rollDice = '10d4+20';

			switch (flavor) {
				case "self-action":
					rollDice = '60';
					break;
				case "self-rest":
				case "other-rest":
					const conMod = targetToken.actor.system.abilities.con.mod;
					rollDice = `60+${conMod}`;
					break;
			}

			let healDamage = await new Roll(rollDice).evaluate();
			await new MidiQOL.DamageOnlyWorkflow(actor, token, healDamage.total, healingType, [targetToken], healDamage, { flavor: `${item.name}`, itemCardId: args[0].itemCardId, useOther: false });
		}
	}

} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}
