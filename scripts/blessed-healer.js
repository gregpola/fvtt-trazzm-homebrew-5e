const version = "0.1.0";
const optionName = "Blessed Healer";

try {
	if (args[0].macroPass === "DamageBonus") {	
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		let target = args[0]?.targets[0];
		let tactor = target?.actor;

		// make sure it's an allowed attack
		const at = args[0].item?.data?.actionType;
		if (!at || !["heal"].includes(at)) {
			console.log(`${optionName}: not an eligible actionType: ${at}`);
			return {};
		}
		
		// make sure the target is not the actor
		if (actor === tactor) {
			console.log(`${optionName}: must target someone else`);
			return {};
		}
		
		// get the spell level
		const spellLevel = args[0].rollOptions?.spellLevel ?? 0;
		if (spellLevel < 1) {
			console.log(`${optionName}: spell level must be at least 1`);
			return {};
		}

		// add the healing to the actor
		await wait(1000);
		const healingBonus = 2 + spellLevel;
		const wounds = actor.data.data.attributes.hp.max - actor.data.data.attributes.hp.value;
		const healAmount = Math.min(healingBonus, wounds);
		const hp = actor.data.data.attributes.hp.value + healAmount;
		await actor.update({"data.attributes.hp.value": hp});
		ChatMessage.create({speaker: {alias: actor.name}, 
			content: `<div class="dnd5e red-full chat-card">
				<div class="dnd5e chat-card item-card">
					<header class="card-header flexrow red-header">
						<img src="icons/magic/life/cross-flared-green.webp" width="36" height="36" title="${optionName}">
						<h3 class="item-name">${optionName}</h3>
					</header>
					<p>Healed self for ${healAmount} hit points.</p>
				</div></div>`});

	}


} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
