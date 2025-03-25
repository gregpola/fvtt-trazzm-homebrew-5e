/*
	Starting at 3rd level, you can use your reaction to deflect or catch the missile when you are hit by a ranged weapon
	attack. When you do so, the damage you take from the attack is reduced by 1d10 + your Dexterity modifier + your monk level.

	If you reduce the damage to 0, you can catch the missile if it is small enough for you to hold in one hand and you
	have at least one hand free. If you catch a missile in this way, you can spend 1 Ki point to make a ranged attack
	with the weapon or piece of ammunition you just caught, as part of the same reaction. You make this attack with
	proficiency, regardless of your weapon proficiencies, and the missile counts as a monk weapon for the attack, which
	has a normal range of 20 feet and a long range of 60 feet.
 */
const version = "12.3.0";
const optionName = "Deflect Missiles";
const damageReductionEffectName = "Deflect Missiles - Damage Reduction";
let throwbackItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', 'Deflect Missiles - Throwback');

try {
	if (args[0].macroPass === "postActiveEffects") {
		// check for throw back
		const reductionEffect = HomebrewHelpers.findEffect(actor, damageReductionEffectName);
		if (reductionEffect) {
			const isMelee = workflow.workflowOptions.damageDetail[0].properties.has('mwak');
			const reductionRoll = reductionEffect.changes.find(change => change.key === `flags.midi-qol.DR.${isMelee ? 'mwak' : 'rwak'}`);
			if (reductionRoll) {
				const drAmount = Number(reductionRoll.value);
				if (drAmount >= workflow.workflowOptions.damageTotal) {
					const throwBack = await foundry.applications.api.DialogV2.confirm({
						window: {
							title: `${optionName}`,
						},
						content: `<p>Throw the missile back at the attacker?</p><p>(costs 1 Ki point)</p>`,
						rejectClose: false,
						modal: true
					});

					if (throwBack) {
						const theItem = await fromUuid(workflow.workflowOptions.sourceItemUuid);
						const theItemDamageParts = theItem.system.damage.parts;
						const theItemDamageTerm = theItemDamageParts[0][0];
						const theItemDamageType = theItemDamageParts[0][1];
						const modIndex = theItemDamageTerm.indexOf("@mod");

						let baseDamage = theItemDamageTerm;
						if (modIndex > -1) {
							baseDamage = theItemDamageTerm.substring(0, modIndex).trim();
						}

						// get the monk's ability modifier
						let abilityToUse = "dex";
						if (actor.system.abilities.str.mod > actor.system.abilities.dex.mod) {
							abilityToUse = "str";
						}
						throwbackItem.system.ability = abilityToUse;

						// apply the item damage data to the throwback item
						let damageParts = throwbackItem.system.damage.parts;
						damageParts[0][0] = baseDamage + ' + @mod';
						damageParts[0][1] = theItemDamageType;
						throwbackItem.system.damage.parts = damageParts;
						await actor.createEmbeddedDocuments("Item", [throwbackItem]);

						// get the target
						const targetTokenOrActor = await fromUuid(workflow.workflowOptions.sourceActorUuid);
						const targetActor = targetTokenOrActor.actor ?? targetTokenOrActor;
						const targetToken = targetActor.token ?? targetActor.getActiveTokens()?.shift();

						// throw it
						const actorKiItem = actor.items.find(i => i.name === 'Ki');
						let actorsItem = actor.items.find(i => i.name === 'Deflect Missiles - Throwback');
						await actorsItem.update({'system.consume.target': actorKiItem.id});
						let throwFeature = new CONFIG.Item.documentClass(actorsItem, {'parent': actor, 'system.consume.target': actorKiItem.id});
						let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions([targetToken.uuid], undefined, undefined, true);
						config.consumeUsage = false;
						config.consumeQuantity = false;
						config.consumeRecharge = false;

						await MidiQOL.completeItemUse(throwFeature, config, options);
						await HomebrewMacros.wait(250);
						await actor.deleteEmbeddedDocuments('Item', [actorsItem.id]);
					}
				}
			}
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
