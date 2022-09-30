const version = "0.1.0";
const optionName = "Healing Light";
const resourceName = "Healing Pool";

try {
	if (args[0].macroPass === "postActiveEffects") {
		if(args[0].targets.length === 0) 
			return ui.notifications.warn(`Please select a target.`);
		
		const target = canvas.tokens.get(args[0].targets[0].id);
		const itemD = args[0].item;
		const actorD = await game.actors.get(args[0].actor._id);
		const tokenD = await canvas.tokens.get(args[0].tokenId);

		// check resources
		let resKey = findResource(actorD);
		if (!resKey) {
			return ui.notifications.error(`${resourceName} - no resource found`);
		}

		const points = actorD.data.data.resources[resKey].value;
		if (!points) {
			console.log(`${resourceName} - resource pool is empty`);
			return;
		}

		// Build data
		const getData = await actorD.getRollData();
		const chrBonus = getData.abilities.cha.mod;
		const finalMax = Math.min(chrBonus, points);
		
		const healingType = "healing";
		const minHeal = Math.clamped(points, 0, target.actor.data.data.attributes.hp.max - target.actor.data.data.attributes.hp.value);
		
		const content_heal = `<div style="vertical-align:top;display:flex;">
			<img src="${target.data.img}" style="border:none;" height="30" width="30">
			<span style="margin-left:10px;line-height:2.1em;">${target.data.name} <b>HP:</b> ${target.actor.data.data.attributes.hp.value} / ${target.actor.data.data.attributes.hp.max}</span></div>
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
							new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, healDamage.total, healingType, [target], healDamage, { flavor: `(${CONFIG.DND5E.healingTypes[healingType]})`, itemCardId: args[0].itemCardId, useOther: false });
							let total = Number(number);
							consumeResource(actorD, resKey, total);
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


function findResource(actor) {
	for (let res in actor.data.data.resources) {
		if (actor.data.data.resources[res].label === resourceName) {
		  return res;
		}
    }
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const points = actor.data.data.resources[resKey].value;
		const pointsMax = actor.data.data.resources[resKey].max;
		let resources = duplicate(actor.data.data.resources);
		resources[resKey].value = Math.clamped(points - cost, 0, pointsMax);
		await actor.update({"data.resources": resources});
	}
}

