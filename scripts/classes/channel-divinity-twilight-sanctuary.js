/*
	You can use your Channel Divinity to refresh your allies with soothing twilight.

	As an action, you present your holy symbol, and a sphere of twilight emanates from you. The sphere is centered on you, has a 30-foot radius, and is filled with dim light. The sphere moves with you, and it lasts for 1 minute or until you are Incapacitated or die. Whenever a creature (including you) ends its turn in the sphere, you can grant that creature one of these benefits:

		* You grant it temporary hit points equal to 1d6 plus your cleric level.
		* You end one effect on it causing it to be Charmed or Frightened.
*/
const version = "11.0";
const resourceName = "Channel Divinity";
const optionName = "Twilight Sanctuary"

try {
	const lastArg = args[args.length - 1];

	if (args[0].macroPass === "preItemRoll") {
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		let actorToken = canvas.tokens.get(lastArg.tokenId);
		
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${optionName}: ${resourceName} - no resource found`);
			return false;
		}

		const points = actor.system.resources[resKey].value;
		if (!points) {
			ui.notifications.error(`${optionName}: ${resourceName} - resource pool is empty`);
			return false;
		}
		
		return await consumeResource(actor, resKey, 1);		
	}
	
} catch (err) {
	console.error(`${optionName}: ${version}`, err);
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

// TurnEnd effect macro
///////////////////////////////////////////////////////////////////////////////////////////////////////

const optionName = "Twilight Sanctuary"

// get the cleric level for tempHP
let originClassLevels = origin.actor.classes.cleric?.system?.levels;
if (!originClassLevels) originClassLevels = 1;

// check for conditions on the actor
let charmedEffect = actor?.effects.find(ef => ef.name === 'Charmed');
let frightenedEffect = actor?.effects.find(ef => ef.name === 'Frightened');

// if no effects, just apply tempHP
if (!charmedEffect && !frightenedEffect) {
	await applyTempHP();
}
else {
	console.log(charmedEffect);
	console.log(frightenedEffect);
	
	// ask which option to apply this turn
	let generatedMenu = [['Temporary HP', 'hp']];
    if (charmedEffect) generatedMenu.push(['Remove Charmed Condition', 'Charmed']);
    if (frightenedEffect) generatedMenu.push(['Remove Frightened Condition', 'Frightened']);
    generatedMenu.push(['None', false]);
	let buttons = generatedMenu.map(([label,value]) => ({label,value}));
	const title = `${optionName} - Which option for ${actor.name}?`;
	
	let selection = await warpgate.buttonDialog(
		{
			buttons,
			title,
		},
		'column'
	);

    switch (selection) {
        case 'hp':
			await applyTempHP();
            break;
        case 'Charmed':
			await MidiQOL.socket().executeAsGM('removeEffects', {'actorUuid': actor.uuid, 'effects': [charmedEffect.id]});
			break;
        case 'Frightened':
			await MidiQOL.socket().executeAsGM('removeEffects', {'actorUuid': actor.uuid, 'effects': [frightenedEffect.id]});
            break;
    }
}

async function applyTempHP() {
	let roll = await new Roll(`1d6[temphp] + ${originClassLevels}`).roll({async: true});
	//await game.dice3d?.showForRoll(roll);
	roll.toMessage({
		rollMode: 'roll',
		speaker: {alias: origin.actor.name},
		flavor: optionName
	});
	
	await MidiQOL.applyTokenDamage(
		[{ damage: roll.total, type: 'temphp' }],
		roll.total,
		new Set([token]),
		null,
		null
	);
}
