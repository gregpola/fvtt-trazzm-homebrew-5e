/*
	At 9th level, your charm becomes extraordinarily beguiling. As an action, you can make a Charisma (Persuasion) check
	contested by a creature’s Wisdom (Insight) check. The creature must be able to hear you, and the two of you must share
	a language.

	If you succeed on the check and the creature is hostile to you, it has disadvantage on attack rolls against targets
	other than you and can’t make opportunity attacks against targets other than you. This effect lasts for 1 minute,
	until one of your companions attacks the target or affects it with a spell, or until you and the target are more than
	60 feet apart.

	If you succeed on the check and the creature isn’t hostile to you, it is charmed by you for 1 minute. While Charmed,
	it regards you as a friendly acquaintance. This effect ends immediately if you or your companions do anything harmful to it.
 */
const version = "12.3.0";
const optionName = "Panache";
const effectNameHostile = "Disadvantage against others";

try {
	if (args[0].macroPass === "postActiveEffects") {
		let target = workflow.targets.first();
		if (target) {
			// make sure there is a shared language
			if (!HomebrewHelpers.hasSharedLanguage(actor, target.actor)) {
				ui.notifications.error(`${optionName}: ${version} - no shared language`);
				return;
			}

			// make sure the target is not deafened
			const isDeafened = HomebrewHelpers.findEffect(target.actor, 'Deafened');
			if (isDeafened) {
				ui.notifications.error(`${optionName}: ${version} - ${target.name} cannot hear you`);
				return;
			}

			// run opposed check
			await MidiQOL.contestedRoll({
				source: {token, rollType: "skill", ability: "per"},
				target: {token: targetToken, rollType: "skill", ability: "ins"},
				flavor: item.name, success: success.bind(this, token, targetToken, item), displayResults: true, itemCardId: workflow.itemCardId,
				rollOptions: {fastForward: false, chatMessage: true, rollMode: "gmroll"}
			});
		}
	}
	// check for disadvantage on attacks
	else if (args[0].macroPass === "preAttackRoll") {
		const shouldHaveDisadvantage = checkHostileDisadvantage(actor, workflow.targets.first().actor.uuid);
		if (shouldHaveDisadvantage) {
			workflow.disadvantage = true;
		}
	}
	
} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}

function findEffect(actor, effectName, origin) {
    return actor?.getRollData().effects?.find(ef => ef.name === effectName && ef.origin === origin);
}

function checkHostileDisadvantage(actor, targetId) {
	let effect = findEffect(actor, effectNameHostile, targetId);
	return effect ? false : true;
}

async function success(token, targetToken, item) {
	if (target.document.disposition !== token.document.disposition) {
		const hasHostileEffect = findEffect(target.actor, effectNameHostile, workflow.item.uuid);
		if (hasHostileEffect) {
			await MidiQOL.socket().executeAsGM("removeEffects", {
				actorUuid: target.actor.uuid,
				effects: [hasHostileEffect.id]
			});
		}

		const hostileEffectData = {
			name: effectNameHostile,
			icon: workflow.item.img,
			origin: actor.uuid,
			duration: {startTime: game.time.worldTime, seconds: 60},
			changes: [{
				key: 'flags.midi-qol.onUseMacroName',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: `ItemMacro.${workflow.item.uuid},preAttackRoll`,
			}],
			flags: {
				dae: {
					selfTarget: false,
					stackable: "none",
					durationExpression: "",
					macroRepeat: "none",
					specialDuration: [],
					transfer: false
				}
			},
			disabled: false
		};
		await MidiQOL.socket().executeAsGM("createEffects", {
			actorUuid: target.actor.uuid,
			effects: [hostileEffectData]
		});

	} else {
		const hasCharmedEffect = findEffect(target.actor, "Charmed", workflow.item.uuid);
		if (hasCharmedEffect) {
			await MidiQOL.socket().executeAsGM("removeEffects", {
				actorUuid: target.actor.uuid,
				effects: [hasCharmedEffect.id]
			});
		}

		await HomebrewEffects.applyCharmedEffect(target.actor, item, ["isDamaged", "isSave"] );
	}
}
