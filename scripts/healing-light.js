/*
	At 1st level, you gain the ability to channel celestial energy to heal wounds. You have a pool of d6s that you spend to fuel this healing. The number of dice in the pool equals 1 + your warlock level.

	As a bonus action, you can heal one creature you can see within 60 feet of you, spending dice from the pool. The maximum number of dice you can spend at once equals your Charisma modifier (minimum of one die). Roll the dice you spend, add them together, and restore a number of hit points equal to the total.

	Your pool regains all expended dice when you finish a long rest.
*/
const version = "10.0.0";
const optionName = "Healing Light";
const resourceName = "Healing Pool";

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "preItemRoll") {
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${optionName}: ${resourceName}: - no resource found`);
			return false;
		}

		// handle resource consumption
		const points = actor.system.resources[resKey].value;
		if (!points) {
			ui.notifications.error(`${optionName}: ${resourceName}: - out of resources`);
			return false;
		}
	}	
	else if (args[0].macroPass === "postActiveEffects") {
		if(lastArg.targets.length === 0) 
			return ui.notifications.warn(`Please select a target.`);
		
		const target = canvas.tokens.get(lastArg.targets[0].id);
		const itemD = lastArg.item;
		const actorToken = await canvas.tokens.get(lastArg.tokenId);

		// check resources
		let resKey = findResource(actor);
		const points = actor.system.resources[resKey].value;

		// Build data
		const getData = await actor.getRollData();
		const chrBonus = getData.abilities.cha.mod;
		const finalMax = Math.min(chrBonus, points);
		
		const healingType = "healing";
		const minHeal = Math.clamped(points, 0, target.actor.system.attributes.hp.max - target.actor.system.attributes.hp.value);
		
		const content_heal = `<div style="vertical-align:top;display:flex;">
			<img src="${target.img}" style="border:none;" height="30" width="30">
			<span style="margin-left:10px;line-height:2.1em;">${target.name} <b>HP:</b> ${target.actor.system.attributes.hp.value} / ${target.actor.system.attributes.hp.max}</span></div>
			<hr><form class="flexcol"><div class="form-group"><label for="num"><b>[${points}/${finalMax}]</b>d6 Dice to spend:</span></label><input id="num" name="num" type="number" min="0" max="${finalMax}" value="${minHeal}" width="50"></input></div></form>`;
		
		new Dialog({
			title: itemD.name,
			content: content_heal,
			buttons: {
				heal: {
					icon: '<i class="fas fa-check"></i>', label: 'Heal', callback: async (html) => {
						let number = Math.floor(Number(html.find('#num')[0].value));
						if (number < 1 || number > finalMax) {
							return ui.notifications.warn(`Invalid number of charges entered = ${number}. Aborting action.`);
						} else {
							let healDamage = new Roll(`${number}d6`).evaluate({ async: false });
							await game.dice3d?.showForRoll(healDamage);
							new MidiQOL.DamageOnlyWorkflow(actor, actorToken, healDamage.total, healingType, [target], healDamage, { flavor: `(${CONFIG.DND5E.healingTypes[healingType]})`, itemCardId: lastArg.itemCardId, useOther: false });
							let total = Number(number);
							consumeResource(actor, resKey, total);
						}
					}
				},
				abort: {
					icon: '<i class="fas fa-cross"></i>',
					label: 'Cancel',
					callback: () => { return; }
				}
			},
			default: "heal"
		}).render(true);
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}

// find the resource matching this feature
function findResource(actor) {
	if (actor) {
		for (let res in actor.system.resources) {
			if (actor.system.resources[res].label === resourceName) {
			  return res;
			}
		}
	}
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const {value, max} = actor.system.resources[resKey];
		if (!value) {
			ChatMessage.create({'content': '${resourceName} : Out of resources'});
			return false;
		}
		
		const resources = foundry.utils.duplicate(actor.system.resources);
		const resourcePath = `system.resources.${resKey}`;
		resources[resKey].value = Math.clamped(value - cost, 0, max);
		await actor.update({ "system.resources": resources });
		return true;
	}
}
