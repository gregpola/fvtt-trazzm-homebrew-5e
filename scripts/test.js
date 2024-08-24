// ##################################################################################################
// Read First!!!!
// Allow to choose a weapon or ammo on which the oil is applied. The chosen weapon or ammo applies
// the oil effect on a hit for the duration.
// v1.0.1
// Author: Elwin#1410
// Dependencies:
//  - DAE, item macro [off]
//  - Times Up
//  - MidiQOL "on use" item macro, [postActiveEffects][DamageBonus]
//  - Warpgate (dialog and mutation)
//  - Ammo Tracker (optional)
//
// How to configure:
// The item details must be:
//   - Activation cost: 1 Action
//   - Target: Self
//   - Range: None
//   - Duration: 1 hour
//   - Limited Uses: 1 of 1 per Charges
//   - Destroy on empty: (checked)
//   - Action type: (empty)
// The Feature Midi-QOL must be:
//   - On Use Macros:
//       ItemMacro | After Active Effects
//   - This item macro code must be added to the DIME code of the item.
//
// Usage:
// This item must be used to activate its effect. It applies a mutation that adds the oil effect on a hit
// on the selected weapon or ammunition.
//
// Description:
// In the "off" DAE macro call:
//   Reverts the warpgate mutation that added the oil effect.
// In the postActiveEffects phase (of the source item):
//   Prompts a dialog to choose the weapon or ammunition on which the oil will be applied.
//   If the chosen weapon or ammunition item quantity does not match the allowed quantity (1 or 3),
//   a new item is created from the selected item with the allowed quantity and this quantity is removed
//   from the selected item. A mutation is applied to the selected item or the new item created
//   (when quantity does not match allowed quantity). This mutation changes the name and description,
//   sets an onUse [postActiveEffects] item macro and a special item macro to handle it and
//   adds an active effect with a macro.itemMacro change, this is used to be notified when the oil expires.
//   If Ammo Tracker is active and a new ammunition item was created, updates the Combat flag that
//   contains the module's ammunition tracking info.
// In the DamageBonus phase (of the oiled item):
//   If all the hit targets are of the dragon type, add the oil's special damage bonus.
// In the postActiveEffects phase (of the oiled item):
//   On a hit, if the oiled item is a weapon, and it has uses, its uses are decremented, if there is no more
//   uses or if the oiled item is an ammo and the quantity is 0,
//   the oil active effect is deleted to force its expiration.
// ###################################################################################################

const DEFAULT_ITEM_NAME = "Oil of Dragon's Bane";
const debug = false;
const MUT_NAME_PREFIX = "oilAppliedTo";
const AMMO_TRACKER_MOD = "ammo-tracker-fvtt";

///////////////// BEGIN CUSTOMIZE THIS /////////////////////////////
// Change dependending on the allowed weapon types
const ALLOWED_WEAPON_TYPES = ["simpleM", "martialM", "simpleR", "martialR"];
// Change depending on the number of ammunitions that can be covered by one dose.
const MAX_AMMO = 3;
// Null if no max uses with a weapon for this oil, otherwise set a number of hits allowed.
const MAX_WEAPON_HITS = 3;
///////////////// END CUSTOMIZE THIS /////////////////////////////

const dependencies = ["dae", "times-up", "midi-qol", "warpgate"];
if (!requirementsSatisfied(DEFAULT_ITEM_NAME, dependencies)) {
    return;
}

/**
 * If the requirements are met, returns true, false otherwise.
 *
 * @param {string} name - The name of the item for which to check the dependencies.
 * @param {string[]} dependencies - The array of module ids which are required.
 *
 * @returns {boolean} true if the requirements are met, false otherwise.
 */
function requirementsSatisfied(name, dependencies) {
    let missingDep = false;
    dependencies.forEach((dep) => {
        if (!game.modules.get(dep)?.active) {
            const errorMsg = `${name} | ${dep} must be installed and active.`;
            ui.notifications.error(errorMsg);
            console.warn(errorMsg);
            missingDep = true;
        }
    });
    return !missingDep;
}

if (debug) {
    console.warn(DEFAULT_ITEM_NAME, { phase: args[0].tag ? `${args[0].tag}-${args[0].macroPass}` : args[0] }, arguments);
}

if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
    // Called on oil vial item
    const weaponChoices = actor.itemTypes.weapon
        .filter((i) => ALLOWED_WEAPON_TYPES.includes(i.system?.type?.value) && !hasItemProperty(i, "amm"))
        .concat(actor.itemTypes.consumable.filter((i) => i.system?.type?.value === "ammo"))
        .filter((i) => i.system?.quantity > 0 && !i.getFlag("world", "appliedOil.origin"));

    if (debug) {
        console.warn(`${DEFAULT_ITEM_NAME} | weaponChoices`, weaponChoices);
    }

    const data = {
        buttons: weaponChoices.map((i) => ({
            label: i.name + (i.type === "consumable" ? `[${i.system.quantity}]` : ""),
            value: i.id,
        })),
        title: "⚔️ Choose your Oiled Weapon or Ammo:",
    };
    const selectedWeaponId = await warpgate.buttonDialog(data, "column");
    if (!selectedWeaponId) {
        if (debug) {
            console.warn(`${DEFAULT_ITEM_NAME} | Weapon or ammo selection was cancelled.`);
        }
        return;
    }
    const selectedWeapon = workflow.actor.items.get(selectedWeaponId);
    let oiledItem = selectedWeapon;
    const allowedQuantity = selectedWeapon.type === "consumable" ? Math.min(MAX_AMMO, selectedWeapon.system.quantity) : 1;

    const oiledName = "Oiled";
    if (allowedQuantity !== selectedWeapon.system.quantity) {
        // Split item with allowed quantity
        let weaponData = selectedWeapon.toObject();
        delete weaponData._id;
        weaponData.system.quantity = allowedQuantity;
        await actor.updateEmbeddedDocuments("Item", [
            {
                _id: selectedWeapon.id,
                ["system.quantity"]: selectedWeapon.system.quantity - allowedQuantity,
            },
        ]);
        const [newItem] = await actor.createEmbeddedDocuments("Item", [weaponData]);
        oiledItem = newItem;
    }

    const mutName = `${MUT_NAME_PREFIX}-${oiledItem.id}`;
    const macroName = `${mutName}-by-${actor.uuid}`;
    const oiledItemNameOrig = selectedWeapon.name;
    const newItemName = `${selectedWeapon.name} [${oiledName}]`;
    const appliedOilValue = {
        origin: rolledItem.uuid,
        name: rolledItem.name,
        img: rolledItem.img,
    };
    let onUseMacroNameValue = selectedWeapon.getFlag("midi-qol", "onUseMacroName");
    if (onUseMacroNameValue) {
        onUseMacroNameValue += `,[postActiveEffects]${macroName}`;
    } else {
        onUseMacroNameValue = `[postActiveEffects]${macroName}`;
    }
    const updates = {
        embedded: {
            Item: {
                [oiledItem.id]: {
                    name: newItemName,
                    system: {
                        description: {
                            value: `<p><em>${oiledName} by ${rolledItem.name}</em></p>\n${
                                selectedWeapon.system?.description?.value ?? ""
                            }`,
                        },
                    },
                    flags: {
                        world: { appliedOil: appliedOilValue },
                        "midi-qol": { onUseMacroName: onUseMacroNameValue },
                    },
                },
            },
        },
    };
    if (oiledItem.type === "weapon" && MAX_WEAPON_HITS) {
        appliedOilValue.uses = MAX_WEAPON_HITS;
    }

    const options = {
        name: mutName,
        comparisonKeys: { Item: "id" },
    };

    // Remove previous applied AE if it exists (needs to be done before mutating otherwise the [off] callback reverts the mutation)
    await workflow.actor.effects
        .find((ae) => foundry.utils.getProperty(ae, "flags.world.appliedOil") === `${rolledItem.uuid}-${oiledItem.uuid}`)
        ?.delete();

    if (!!warpgate.mutationStack(workflow.token.document).getName(mutName)) {
        await warpgate.revert(workflow.token.document, mutName);
    }

    await warpgate.mutate(workflow.token.document, updates, {}, options);
    // Create macro to handle oil effect (this is done to allow existing item macro to be untouched),
    // but delete if it already exists.
    await game.macros.getName(macroName)?.delete();
    await Macro.createDocuments([
        {
            name: macroName,
            type: "script",
            scope: "global",
            command: getOiledItemMacro(oiledItem.uuid),
        },
    ]);

    let effectDuration = { type: "seconds", seconds: 60 * 60 };
    if (rolledItem.system?.duration?.value && rolledItem.system?.duration?.units) {
        effectDuration = DAE.convertDuration(rolledItem.system.duration);
    }
    const effectData = {
        changes: [
            // Flag to handle end of effect
            {
                key: "macro.execute",
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: macroName,
                priority: 20,
            },
            // Flag to handle extra damage
            {
                key: "flags.dnd5e.DamageBonusMacro",
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: macroName,
                priority: 20,
            },
        ],
        flags: {
            world: { appliedOil: `${rolledItem.uuid}-${oiledItem.uuid}` },
        },
        origin: oiledItem.uuid, //flag the effect as associated to the oiled item
        disabled: false,
        duration: effectDuration,
        icon: rolledItem.img,
        name: `${rolledItem.name} applied to ${oiledItemNameOrig}`,
    };
    await workflow.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);

    // Make the proper adjustements for Ammo Tracker
    if (
        game.modules.get(AMMO_TRACKER_MOD)?.active &&
        selectedWeapon.type === "consumable" &&
        oiledItem.id !== selectedWeaponId &&
        workflow.actor.type === "character"
    ) {
        for (let combat of game.combats) {
            const actorAmmoAttr = `projectileData.${workflow.actor.id}`;
            const actorAmmo = combat.getFlag(AMMO_TRACKER_MOD, actorAmmoAttr);
            if (actorAmmo?.[selectedWeaponId]) {
                const updatedActorAmmo = foundry.utils.deepClone(actorAmmo);
                updatedActorAmmo[selectedWeaponId] = updatedActorAmmo[selectedWeaponId] - allowedQuantity;
                updatedActorAmmo[oiledItem.id] = allowedQuantity;
                await combat.setFlag(AMMO_TRACKER_MOD, actorAmmoAttr, updatedActorAmmo);
            }
        }
    }
}

/**
 * Returns the item macro to handle the oiled item effect.
 *
 * @param {string} oiledItemUuid - The oiled item uuid.
 * @returns {string} the item macro to handle the oiled item effect.
 */
function getOiledItemMacro(oiledItemUuid) {
    return `
const DEFAULT_ITEM_NAME = "${DEFAULT_ITEM_NAME}";
const debug = ${debug};

const MUT_NAME_PREFIX = "${MUT_NAME_PREFIX}";

if (debug) {
  console.warn(DEFAULT_ITEM_NAME, { phase: args[0].tag ? args[0].macroPass : args[0] }, arguments);
}

if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
  const macroData = args[0];
  if (workflow.hitTargets.size === 0) {
    return;
  }
  await handleOiledItemPostActiveEffects(workflow, rolledItem);
} else if (args[0].tag === "DamageBonus") {
  return await handleOiledItemDamageBonus(workflow, "${oiledItemUuid}");
} else if (args[0] === "off") {
  const sourceToken = canvas.tokens.get(lastArgValue.tokenId);
  const sourceItem = fromUuidSync(lastArgValue.origin);
  const mutName = \`\${MUT_NAME_PREFIX}-\${sourceItem?.id}\`;
  await warpgate.revert(sourceToken.document, mutName);
  // Make sure that if other mutations were added after this one, 
  // we remove oiled from the name
  const oiledName = " Oiled";
  if (sourceItem.name.includes(oiledName)) {
    const newName = sourceItem.name.replace(oiledName, "");
    await sourceItem.update({name: newName});
  }

  // Note: warpgate does not remove added flags, it nulls them, unset them is the item was not an added one
  if (sourceItem) {
    await sourceItem.unsetFlag("world", "appliedOil");
  }
  
  // Delete created macro.
  const macroName = \`\${mutName}-by-\${sourceToken.actor.uuid}\`;
  await game.macros.getName(macroName)?.delete();
}

${handleOiledItemPostActiveEffects.toString()}

${handleOiledItemDamageBonus.toString()}

`;
}

/**
 * Handles the item uses when an attack hits with the oiled weapon or ammo.
 *
 * @param {MidiQOL.Workflow} currentWorkflow - The current midi workflow.
 * @param {Item5e} usedItem - The weapon or ammo used.
 */
async function handleOiledItemPostActiveEffects(currentWorkflow, usedItem) {
    const appliedOil = usedItem?.getFlag("world", "appliedOil");
    if (!appliedOil) {
        console.error(`${DEFAULT_ITEM_NAME} | Missing appliedOil flag on oiled weapon or ammo.`);
        return;
    }

    const appliedOilFlag = `${appliedOil.origin}-${usedItem.uuid}`;
    let deleteEffect = false;

    if (usedItem.type === "weapon") {
        const newUses = appliedOil.uses - 1;
        if (newUses > 0) {
            await currentWorkflow.item.setFlag("world", "appliedOil.uses", newUses);
        } else {
            // The maximum uses has been reached, the oiled weapon effect expires...
            deleteEffect = true;
        }
    } else {
        // when all the ammo are used, the oiled ammo effect expires...
        deleteEffect = usedItem.system.quantity === 0;
    }
    if (deleteEffect) {
        await currentWorkflow.actor.effects
            .find((ae) => foundry.utils.getProperty(ae, "flags.world.appliedOil") === appliedOilFlag)
            ?.delete();
    }
}

/**
 * Handles the oiled item damage bonus.
 *
 * @param {MidiQOL.Workflow} currentWorkflow - The current midi workflow.
 * @param {string} oiledItemUuid - The oiled item uuid associated to the macro.
 */
async function handleOiledItemDamageBonus(currentWorkflow, oiledItemUuid) {
    if (
        workflow.hitTargets.size < 1 ||
        workflow.hitTargets.some((t) => t.actor?.system.details?.type?.value !== "dragon")
    ) {
        if (debug) {
            console.warn(`${DEFAULT_ITEM_NAME} | Not all hit targets are dragons, skip.`);
        }
        return;
    }
    if (currentWorkflow.item.uuid !== oiledItemUuid && currentWorkflow.ammo?.uuid !== oiledItemUuid) {
        if (debug) {
            console.warn(`${DEFAULT_ITEM_NAME} | Not the oiled weapon or ammo assigned to this macro.`);
        }
        return;
    }
    const appliedOil =
        currentWorkflow.item.getFlag("world", "appliedOil") ?? currentWorkflow.ammo?.getFlag("world", "appliedOil");
    if (!appliedOil) {
        console.error(`${DEFAULT_ITEM_NAME} | Missing appliedOil flag on oiled weapon or ammo.`);
        return;
    }
    const rollOptions = currentWorkflow.damageRolls[0]?.options ?? {};
    const isCritical = !currentWorkflow.isCritical ? rollOptions.critical : currentWorkflow.isCritical;
    const damageBonusFormula = new CONFIG.Dice.DamageRoll("6d6", actor.getRollData(), {
        critical: isCritical,
        criticalBonusDamage: rollOptions.criticalBonusDamage,
        criticalBonusDice: rollOptions.criticalBonusDice,
        criticalMultiplier: rollOptions.criticalMultiplier,
        multiplyNumeric: rollOptions.multiplyNumeric,
        powerfulCritical: rollOptions.powerfulCritical,
    }).formula;
    return {
        damageRoll: damageBonusFormula,
        flavor: `${fromUuidSync(appliedOil.origin)?.name ?? DEFAULT_ITEM_NAME} - Bonus Damage`,
    };
}

/**
 * Returns true if the item has the property.
 * @param {Item5e} item to test for a property
 * @param {string} propName name of the property to test.
 * @returns {boolean} true if the item has the property, false otherwise.
 */
function hasItemProperty(item, propName) {
    if (isNewerVersion(game.system.version, "3")) {
        return item.system?.properties?.has(propName);
    }
    return item.system?.properties?.[propName];
}