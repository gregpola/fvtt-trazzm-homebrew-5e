/*
	You brandish the weapon used in the spell’s casting and make a melee attack with it against one creature within 5 feet
	of you. On a hit, the target suffers the weapon attack’s normal effects, and you can cause green fire to leap from
	the target to a different creature of your choice that you can see within 5 feet of it. The second creature takes
	fire damage equal to your spellcasting ability modifier.

	This spell’s damage increases when you reach certain levels. At 5th level, the melee attack deals an extra 1d8 fire
	damage to the target on a hit, and the fire damage to the second creature increases to 1d8 + your spellcasting ability
	modifier. Both damage rolls increase by 1d8 at 11th level (2d8 and 2d8) and 17th level (3d8 and 3d8).
 */
const version = "12.3.1";
const optionName = "Green-Flame Blade";
const damageType = "fire";

try {
	if (args[0].tag === "OnUse" && args[0].macroPass === "preItemRoll") {
		const autoCastWorkflow = workflow.options?.greenFlameBladeAutoCastWorkflow;
		if (!autoCastWorkflow) {
			// Only do prevalidation when auto casting
			return;
		}

		return handleAutoCastPreItemRoll(workflow, autoCastWorkflow);

	} else if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
		const macroData = args[0];
		if (macroData.hitTargets.length > 0) {
			weaponAttack(workflow);
		} else {
			ui.notifications.error(`${optionName}: No target selected, please select a target and try again.`);
		}

	} else if (args[0].tag === "DamageBonus") {
		return handleAutoCastDamageBonus(workflow, item);
	}

} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("modules/fvtt-trazzm-homebrew-5e/assets/effects/Flames_01_Regular_Green_200x200.webm")
        .atLocation(target)
		.scaleToObject(2)
		.play();
}

/**
 * Makes an attack with the selected weapon followed by a secondary attack, or if triggered by auto cast, configures
 * proper hooks and active effect.
 * @param {MidiQOL.Workflow} originWorkflow The workflow of the spell or of the triggering melee weapon attack.
 * @returns {void}
 */
async function weaponAttack(originWorkflow) {
	const caster = originWorkflow.actor;
	const autoCastWorkflow = originWorkflow.options?.greenFlameBladeAutoCastWorkflow;
	if (autoCastWorkflow) {
		handleAutoCast(workflow, autoCastWorkflow);
		return;
	} else {
		const filteredWeapons = originWorkflow.actor.itemTypes.weapon.filter(
			(i) => i.system.activation.type === "action" && i.system.actionType == "mwak"
		);

		if (filteredWeapons.length === 0) {
			console.warn(`${optionName}: No weapon available for primary attack.`);
			return;
		}

		const defaultWeaponId = DAE.getFlag(originWorkflow.actor, "greenFlameBladeChoice");

		const selectedWeaponId = await chooseWeapon(originWorkflow.item, defaultWeaponId, filteredWeapons);
		if (!selectedWeaponId) {
			console.warn(`${optionName}: Weapon selection for primary attack was cancelled.`);
			return;
		}

		const characterLevel = caster.type === "character" ? caster.system.details.level : caster.system.details.cr;
		const cantripDice = 1 + Math.floor((characterLevel + 1) / 6);
		const weaponItem = caster.getEmbeddedDocument("Item", selectedWeaponId);
		await DAE.setFlag(caster, "greenFlameBladeChoice", selectedWeaponId);
		const weaponCopy = weaponItem.toObject();
		delete weaponCopy._id;
		if (cantripDice > 1) {
			weaponCopy.system.damage.parts.push([`${cantripDice - 1}d8[${damageType}]`, damageType]);
		}
		weaponCopy.name = `${weaponItem.name} [${originWorkflow.item.name}]`;
		const attackItem = new CONFIG.Item.documentClass(weaponCopy, { parent: caster });
		const options = { showFullCard: false, greenFlameBladeAutoCastDisabled: true };
		const primaryWorkflow = await MidiQOL.completeItemUse(attackItem, {}, options);
		if (!primaryWorkflow) {
			// Workflow was cancelled, do nothing
			return;
		}

		const targetToken = primaryWorkflow.targets.first();
		if (primaryWorkflow.hitTargets.size > 0) {
			await anime(token, targetToken);
			await attackNearby(originWorkflow, targetToken, [caster.id], cantripDice);
		}
	}
}

/**
 * Shows a dialog to allow the caster's player to choose the melee weapon which will be used to make
 * the spell's primary attack.
 * @param {Item} gfbItem The spell item.
 * @param {number} defaultWeaponId The default weapon id, will be used to pre-select a weapon from the choices.
 * @param {Array} weaponSelection List of weapons to choose from.
 * @returns {number} The selected weapon item id.
 */
async function chooseWeapon(gfbItem, defaultWeaponId, weaponSelection) {
	const weaponContent = weaponSelection
		.map((w) => {
			const selected = defaultWeaponId && defaultWeaponId == w.id ? " selected" : "";
			return `<option value="${w.id}"${selected}>${w.name}</option>`;
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

/**
 * Makes a secondary attack on the chosen target.
 * @param {MidiQOL.Workflow} originWorkflow The spell's workflow.
 * @param {Token} primaryTargetToken The primary target's token
 * @param {Array} ignoreIds An array of actor's ids to be ignored as potential secondary targets.
 * @param {number} cantripDice the cantrip dice derived from the caster's level.
 * @returns {void}
 */
async function attackNearby(originWorkflow, primaryTargetToken, ignoreIds, cantripDice) {
	const gfbItem = originWorkflow.item;
	const caster = originWorkflow.actor;
	const casterToken = originWorkflow.token;

	// Get tokens 5 ft from primary target visible by caster
	const potentialTargets = await MidiQOL.findNearby([0, 1], primaryTargetToken, 5, {canSee: true});
	if (potentialTargets.length === 0) {
		console.warn(`${optionName}: No potential secondary target.`);
		return;
	}
	// Find first target with opposite disposition
	const targetDisposition = casterToken.document.disposition * -1;
	const defaultTargetId = potentialTargets.find((tok) => tok.document.disposition === targetDisposition)?.id;

	const selectedId = await chooseTarget(gfbItem, potentialTargets, defaultTargetId);
	if (!selectedId) {
		console.warn(`${optionName}: Secondary target selection was cancelled.`);
		return;
	}
	const targetToken = canvas.tokens.get(selectedId);
	const mod = caster.system.abilities[gfbItem.abilityMod].mod;
	const secDamage = cantripDice > 1 ? `${cantripDice - 1}d8[${damageType}] + ${mod}` : `${mod}`;
	const secondaryItemData = {
		type: "spell",
		name: `${gfbItem.name}: Secondary Damage`,
		img: gfbItem?.img,
		system: {
			level: originWorkflow.itemLevel,
			preparation: { mode: "atwill" },
			target: { value: 1, type: "creature" },
			duration: { units: "inst" },
			actionType: "other",
			chatFlavor: gfbItem.system.chatFlavor,
			damage: { parts: [[secDamage, damageType]] },
		},
	};

	const secondaryItem = new CONFIG.Item.documentClass(secondaryItemData, { parent: caster });
	const options = {
		showFullCard: false,
		configureDialog: false,
		critical: false,
		targetUuids: [targetToken.document.uuid],
	};
	await MidiQOL.completeItemUse(secondaryItem, {}, options);
	await anime(casterToken, targetToken);
}

/**
 * Shows a dialog to allow the caster's player to choose the secondary target on which the secondary damage will be applied.
 * @param {Item} gfbItem The spell item.
 * @param {Array} potentialTargets List of potenttial targets to choose from.
 * @param {number} defaultTargetId The default token id, will be used to pre-select a target from the choices.
 * @returns {number} The selected target token id.
 */
async function chooseTarget(gfbItem, potentialTargets, defaultTargetId) {
	const targetContent = potentialTargets
		.map((t) => {
			const selected = defaultTargetId && defaultTargetId == t.id ? " selected" : "";
			return `<option value="${t.id}""${selected}>${t.name}</option>`;
		})
		.join("");

	const content = `<div class="form-group"><p>Choose a secondary target to attack:</p><select name="secondaryTargetId"}>${targetContent}</select><p></p></div>`;

	const choiceDialog = new Promise((resolve) => {
		new Dialog({
			title: `${gfbItem.name}`,
			content,
			buttons: {
				choose: {
					label: "Choose",
					callback: (html) => resolve(html.find("[name=secondaryTargetId]")[0].value),
				},
				Cancel: {
					label: game.i18n.localize("Cancel"),
					callback: (html) => resolve(null),
				},
			},
		}).render(true);
	});
	return await choiceDialog;
}

/**
 * Validates that the requirements for auto casting are fulfilled, if not the spell's workflow is cancelled.
 * @param {MidiQOL.Workflow} gfbWorkflow The spell's workflow.
 * @param {MidiQOL.Workflow} autoCastWorkflow The workflow of the melee weapon that triggered the auto casting.
 * @returns {boolean} true if requirements for auto casting are fulfilled, false otherwise.
 */
function handleAutoCastPreItemRoll(gfbWorkflow, autoCastWorkflow) {
	if (autoCastWorkflow.options?.greenFlameBladeAutoCastDisabled) {
		// Auto cast is disabled, because the attack was triggered by the spell itself.
		console.warn(
			`${optionName}: Triggering an autocast is not allowed when the spell triggered the primary attack.`
		);
		return false;
	}
	const targetToken = autoCastWorkflow.hitTargets?.first();
	if (!targetToken) {
		// No hit target do nothing
		console.warn(`${optionName}: No effect because there is no hit target.`);
		return false;
	}
	if (
		!(
			autoCastWorkflow.item?.type === "weapon" &&
			autoCastWorkflow.item?.system?.equipped &&
			autoCastWorkflow.item?.system?.activation?.type === "action" &&
			autoCastWorkflow.item?.system?.actionType === "mwak"
		)
	) {
		// Not an equipped melee weapon
		console.warn(`${optionName}: Only equipped melee weapons can trigger an auto cast.`);
		return false;
	}
}

/**
 * Handles the modified spell's workflow for auto casting. If the caster level is high enough, an active effect that
 * adds a DamageBonusMacro for one turn and one hit is created on the caster, to handle extra dice damage.
 * A hook on midi-qol.RollComplete event is registered to trigger the secondary attack when the triggering melee weapon attack
 * is completed.
 * @param {MidiQOL.Workflow} gfbWorkflow The spell's workflow.
 * @param {MidiQOL.Workflow} autoCastWorkflow The workflow of the melee weapon that triggered the auto casting.
 */
async function handleAutoCast(gfbWorkflow, autoCastWorkflow) {
	const targetToken = autoCastWorkflow.hitTargets?.first();
	const caster = gfbWorkflow.actor;
	const characterLevel = caster.type === "character" ? caster.system.details.level : caster.system.details.cr;
	const cantripDice = 1 + Math.floor((characterLevel + 1) / 6);

	// If level is sufficient, add damage bonus effect with fire for GFB to the current attack
	if (cantripDice > 1) {
		const effectData = {
			changes: [
				// macro to apply the bonus damage
				{
					key: "flags.dnd5e.DamageBonusMacro",
					mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
					value: "ItemMacro",
					priority: 20,
				},
			],

			origin: gfbWorkflow.item.uuid, //flag the effect as associated to the item used
			disabled: false,
			duration: { turns: 1, rounds: 0 },
			icon: gfbWorkflow.item.img,
			label: gfbWorkflow.item.name,
		};
		setProperty(effectData, "flags.dae.specialDuration", ["1Hit"]);
		await caster.createEmbeddedDocuments("ActiveEffect", [effectData]);

		// Add flag to current attack workflow to make sure that the bonus damage only applies to this attack
		setProperty(autoCastWorkflow, "greenFlameBlade.autoCast", true);
		// Set flag to current attack workflow for cantrip dice
		setProperty(autoCastWorkflow, "greenFlameBlade.cantripDice", cantripDice);
	}

	// Register hook to trigger secondary attack after the primary attack has completed
	Hooks.once(`midi-qol.RollComplete.${autoCastWorkflow.item.uuid}`, async (workflow) => {
		if (workflow.id !== autoCastWorkflow.id) {
			// Not same workflow do nothing
			console.warn(
				`${optionName}: Not same workflow has primaty attack, expected ${autoCastWorkflow.id} but was ${workflow.id}.`
			);
			return;
		}

		if (workflow.hitTargets.size > 0) {
			await attackNearby(gfbWorkflow, targetToken, [caster.id], cantripDice);
		}
	});
}

/**
 * Adds the spell's bonus damage on the primary attack when the caster is 5th level or higher.
 * @param {MidiQOL.Workflow} currentWorkflow The workflow of the triggering melee weapon attack.
 * @param {Item} gfbItem The spell item.
 * @returns {object} bonusDamage The bonus damage formula and it's flavor.
 * @returns {string} bonusDamage.damageRoll The bonus damage formula.
 * @returns {string} bonusDamage.flavor The damage bonus flavor.
 */
function handleAutoCastDamageBonus(currentWorkflow, gfbItem) {
	if (!foundry.utils.getProperty(currentWorkflow, "greenFlameBlade.autoCast")) {
		// Not the attack workflow that triggered the auto GFB.
		console.warn(`${optionName}: Not the orignal triggering workflow.`);
		return {};
	}
	const cantripDice = foundry.utils.getProperty(currentWorkflow, "greenFlameBlade.cantripDice") ?? 1;
	return { damageRoll: `${cantripDice - 1}d8[${damageType}]`, flavor: `${gfbItem.name} Bonus Damage` };
}
