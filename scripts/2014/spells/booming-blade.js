/*
	You brandish the weapon used in the spell’s casting and make a melee attack with it against one creature within 5 feet
	of you. On a hit, the target suffers the weapon attack’s normal effects and then becomes sheathed in booming energy
	until the start of your next turn. If the target willingly moves 5 feet or more before then, the target takes
	1d8 thunder damage, and the spell ends.

	This spell’s damage increases when you reach certain levels. At 5th level, the melee attack deals an extra 1d8 thunder
	damage to the target on a hit, and the damage the target takes for moving increases to 2d8. Both damage rolls increase
	by 1d8 at 11th level (2d8 and 3d8) and again at 17th level (3d8 and 4d8).
*/
const version = "12.3.0";
const optionName = "Booming Blade";
const sequencerFile = "jb2a.static_electricity.01.blue";
const sequencerScale = 1.5;
const damageType = "thunder";
const flagName = "booming-blade-target";

try {
	if (args[0].macroPass === "preItemRoll") {
		if (workflow.targets.size < 1) {
			ui.notifications.error(`${optionName}: No target selected, please select a target and try again.`);
			return false;
		}
	}
	else if (args[0].macroPass === "postActiveEffects") {
		weaponAttack(workflow);
	}
	else if (args[0].macroPass === "DamageBonus") {
		let targetToken = workflow.hitTargets.first();
		if (targetToken) {
			await targetToken.actor.setFlag("fvtt-trazzm-homebrew-5e", flagName, actor.uuid);
			const characterLevel = actor.type === "character" ? actor.system.details.level : actor.system.details.cr;
			const cantripDice = Math.floor((characterLevel + 1) / 6);

			// apply on move effect
			const effectData = {
				name: macroItem.name,
				icon: macroItem.img,
				origin: macroItem.uuid,
				changes: [
					{
						key: 'macro.itemMacro',
						mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
						value: `ItemMacro.${macroItem.name}`,
						priority: 20
					},
					{
						'key': 'macro.tokenMagic',
						'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
						'value': 'electric',
						'priority': 21
					}
				],
				flags: {
					dae: {
						selfTarget: false,
						stackable: "none",
						durationExpression: "",
						macroRepeat: "none",
						specialDuration: [
							"turnStartSource",
							"isMoved"
						],
						transfer: false
					},
					cantripDice: cantripDice + 1
				},
				disabled: false
			};
			await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: [effectData] });


			// apply damage bonus
			if (cantripDice > 0) {
				if (workflow.isCritical) {
					const critDamage = cantripDice * 8;
					return {damageRoll: `${cantripDice}d8 + ${critDamage}[${damageType}]`, flavor: `${optionName}`};
				}
				else {
					return {damageRoll: `${cantripDice}d8[${damageType}]`, flavor: `${optionName}`};
				}
			}
		}
	}
	else if (lastArgValue["expiry-reason"]?.includes("midi-qol:isMoved")) {
		// apply damage and remove effect
		const caster = item.parent;
		const casterToken = canvas.tokens.placeables.find((t) => t.actor?.uuid === caster.uuid);

		sequencerEffect(token, sequencerFile, sequencerScale);
		const damageRoll = await new Roll(`${lastArgValue.efData.flags.cantripDice}d8[${damageType}]`).evaluate({ async: false });
		await new MidiQOL.DamageOnlyWorkflow(caster, casterToken.document, damageRoll.total, damageType, [token],
			damageRoll, {flavor: `${optionName}`, itemCardId: lastArgValue.itemCardId});
	}
	else if (args[0] === "off") {
		const flag = actor.getFlag("fvtt-trazzm-homebrew-5e", flagName);
		if (flag) {
			await actor.unsetFlag("fvtt-trazzm-homebrew-5e", flagName);
		}
	}

} catch (err)  {
	console.error(`${optionName}: ${version}`, err);
}

/*
 * Makes an attack with the selected weapon.
 * @param {MidiQOL.Workflow} originWorkflow The workflow of the spell or of the triggering melee weapon attack.
 * @returns {void}
 */
async function weaponAttack(originWorkflow) {
	const caster = originWorkflow.actor;
	const filteredWeapons = originWorkflow.actor.itemTypes.weapon.filter(
		(i) => i.system.activation.type === "action" && i.system.actionType == "mwak"
	);

	if (filteredWeapons.length === 0) {
		console.warn(`${optionName}: No weapon available for primary attack.`);
		return;
	}

	const selectedWeaponId = await chooseWeapon(originWorkflow.item, filteredWeapons);
	if (!selectedWeaponId) {
		console.warn(`${optionName}: Weapon selection for primary attack was cancelled.`);
		return;
	}

	const attackItem = caster.items.find((i) => i.id === selectedWeaponId).clone({}, {keepId: true});
	attackItem.prepareData();
	attackItem.prepareFinalAttributes()
	const options = { showFullCard: false, createWorkflow: true, configureDialog: true };
	await MidiQOL.completeItemUse(attackItem, {}, options);
}

/**
 * Shows a dialog to allow the caster's player to choose the melee weapon which will be used to make
 * the spell's primary attack.
 *
 * @param {Item} gfbItem The spell item.
 * @param {Array} weaponSelection List of weapons to choose from.
 * @returns {number} The selected weapon item id.
 */
async function chooseWeapon(gfbItem, weaponSelection) {
	const weaponContent = weaponSelection
		.map((w) => {
			return `<option value="${w.id}">${w.name}</option>`;
		})
		.join("");

	const content = `<div class="form-group"><p>Choose a weapon to attack with:</p><select name="weapons"}>${weaponContent}</select><p></p></div>`;
	const choiceDialog = new Promise((resolve) => {
		new Dialog({
			title: `${gfbItem.name}`,
			content,
			buttons: {
				ok: {
					label: "Ok",
					callback: (html) => resolve(html.find("[name=weapons]")[0].value),
				},
				cancel: {
					label: game.i18n.localize("Cancel"),
					callback: (html) => resolve(null),
				},
			},
		}).render(true);
	});
	return await choiceDialog;
}

// sequencer caller for effects on target
function sequencerEffect(target, file, scale) {
	if (game.modules.get("sequencer")?.active && hasProperty(Sequencer.Database.entries, "jb2a")) {
		new Sequence().effect().file(file).atLocation(target).scaleToObject(scale).play();
	}
}
