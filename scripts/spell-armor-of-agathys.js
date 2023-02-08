const version = "10.0.0";
const optionName = "Armor of Agathys";

try {

	if(args.length !== 3 || args[0] !== "onUpdateActor") return;
	const lastArg = args[2];
	const spellLevel = args[1];

	let message = game.messages.contents.filter(mes=>mes.data.content.includes("<div class=\"dnd5e chat-card item-card midi-qol-item-card\"")).pop();
	let workflow = MidiQOL.Workflow.getWorkflow(message.flags["midi-qol"].workflowId);

	const validAttacks = ["mwak", "msak"];
	if (validAttacks.includes(workflow.item?.system?.actionType) && workflow.hitTargets?.has(lastArg.sourceToken) && !workflow.agathysFlag){
	  const attackerToken = workflow.token;
	  const damageAmount = 5 * spellLevel;
	  const damageType = "cold";
	  const messageContent = `${optionName} reactive damage: ${damageAmount} (${damageType})`;
	  await ChatMessage.create({content: messageContent});
	  await MidiQOL.applyTokenDamage( [{type: `${damageType}`, damage: damageAmount}], damageAmount, new Set([attackerToken]), item, new Set(), {forceApply: false});
	  workflow.agathysFlag = true;
	}

	if(lastArg.updates.system.attributes.hp.temp <= 0){
	  const effectId = lastArg.sourceActor.effects.find(eff => eff.label === optionName).id;
	  await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: lastArg.actorUuid, effects: [effectId]});
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
