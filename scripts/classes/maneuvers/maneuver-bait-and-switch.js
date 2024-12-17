/*
	When you’re within 5 feet of a creature on your turn, you can expend one superiority die and switch places with that
	creature, provided you spend at least 5 feet of movement and the creature is willing and isn’t incapacitated. This
	movement doesn’t provoke opportunity attacks.

	Roll the superiority die. Until the start of your next turn, you or the other creature (your choice) gains a bonus
	to AC equal to the number rolled.
*/
const version = "12.3.0";
const optionName = "Bait and Switch";
const gameRound = game.combat ? game.combat.round : 0;

try {
	if (args[0].macroPass === "postActiveEffects") {
		const targetToken = workflow.targets.first();

		// ask who gets the AC bpnus
		const content = `
			<p>Who gets the AC bonus?</p>
			<label><input type="radio" name="choice" value="self" checked>  ${actor.name} </label>
			<label><input type="radio" name="choice" value="target">  ${targetToken.name} </label>`;

		let acTarget = await foundry.applications.api.DialogV2.prompt({
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

		if (!acTarget) return;

		const fullSupDie = actor.system.scale["battle-master"]["superiority-die"];
		let bonusRoll = await new Roll(`${fullSupDie.die}`).evaluate();
		await game.dice3d?.showForRoll(bonusRoll);

		if (acTarget === 'self') {
			await applyArmorBonus(item.uuid, actor.uuid, bonusRoll.total);
		}
		else if (acTarget === 'target') {
			await applyArmorBonus(item.uuid, targetToken.acto.uuid, bonusRoll.total);
		}

		// Swap places
		await HomebrewMacros.swapTokenPositions(token, targetToken);
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}

async function applyArmorBonus(sourceOrigin, targetId, bonus) {
	const effectData = {
		name: optionName,
		icon: "icons/magic/control/energy-stream-link-large-white.webp",
		origin: sourceOrigin,
		changes: [
			{
				key: 'system.attributes.ac.bonus',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: bonus,
				priority: 20
			}
		],
		duration: { rounds: 1, turns: 2, startRound: gameRound, startTime: game.time.worldTime },
		flags: { 
			dae: {
				specialDuration: ["turnStartSource"]
			}
		},
		disabled: false
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetId, effects: [effectData] });
}
