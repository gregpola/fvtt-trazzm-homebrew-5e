/*
	Starting at 3rd level, you can use your reaction to deflect or catch the missile when you are hit by a ranged weapon
	attack. When you do so, the damage you take from the attack is reduced by 1d10 + your Dexterity modifier + your monk level.

	If you reduce the damage to 0, you can catch the missile if it is small enough for you to hold in one hand and you
	have at least one hand free. If you catch a missile in this way, you can spend 1 Ki point to make a ranged attack
	with the weapon or piece of ammunition you just caught, as part of the same reaction. You make this attack with
	proficiency, regardless of your weapon proficiencies, and the missile counts as a monk weapon for the attack, which
	has a normal range of 20 feet and a long range of 60 feet.
 */
const version = "11.0";
const kiName = "Ki";
const optionName = "Deflect Missiles";
const cost = 1;

try {
	if (args[0].macroPass === "postActiveEffects") {
		const effect =  actor.effects.find(ef=>ef.name === "Deflect Missiles Damage Reduction");
		const change = effect.changes.find(change => change.key === "flags.midi-qol.DR.rwak");
		const dr = (await new Roll(change.value, actor.getRollData()).evaluate({async: true})).total;

		if (dr >= workflow.workflowOptions.damageTotal) {
			// check ki points
			let kiFeature = actor.items.find(i => i.name === kiName);
			if (!kiFeature) {
				console.error(`${optionName} - no Ki feature`);
				return;
			}

			let usesLeft = kiFeature.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < cost) {
				console.error(`${optionName} - not enough Ki left`);
				return;
			}

			const throwBack = await Dialog.confirm({
				title: game.i18n.localize("Return Missile"),
				content: `<p>Throw the missile back at the attacker</p><p>(costs 1 of ${usesLeft} Ki)</p>`,
			});
			if (!throwBack) return;

			let theItem = await fromUuid(workflow.workflowOptions.sourceAmmoUuid ??workflow.workflowOptions.sourceItemUuid); // use the ammo if there is one otherwise the weapon
			const theItemData = theItem.toObject();
			theItemData.system.range.value = 20;
			theItemData.system.range.long = 40;
			theItemData.actionType = "rwak";
			theItemData.system.consume = args[0].itemData.system.consume;

			let ownedItem = new CONFIG.Item.documentClass(theItemData, { parent: actor });
			const newValue = kiFeature.system.uses.value - cost;
			await kiFeature.update({"system.uses.value": newValue});

			const targetTokenOrActor = await fromUuid(workflow.workflowOptions.sourceActorUuid);
			const targetActor = targetTokenOrActor.actor ?? targetTokenOrActor;
			const target = targetActor.token ?? targetActor.getActiveTokens()?.shift();
			await MidiQOL.completeItemRoll(ownedItem, {targetUuids: [target.uuid ?? target.document.uuid], workflowOptions: {notReaction: true, autoConsumeResource: "both"}});
		}
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
