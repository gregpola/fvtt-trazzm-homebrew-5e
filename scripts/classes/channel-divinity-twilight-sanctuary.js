/*
	You can use your Channel Divinity to refresh your allies with soothing twilight.

	As an action, you present your holy symbol, and a sphere of twilight emanates from you. The sphere is centered on you,
	has a 30-foot radius, and is filled with dim light. The sphere moves with you, and it lasts for 1 minute or until
	you are Incapacitated or die. Whenever a creature (including you) ends its turn in the sphere, you can grant that
	creature one of these benefits:

		* You grant it temporary hit points equal to 1d6 plus your cleric level.
		* You end one effect on it causing it to be Charmed or Frightened.
*/
const version = "11.1";
const optionName = "Twilight Sanctuary"
const channelDivinityName = "Channel Divinity (Cleric)";
const cost = 1;

try {
	if (args[0].macroPass === "preItemRoll") {
		// check Channel Divinity uses available
		let channelDivinity = actor.items.find(i => i.name === channelDivinityName);
		if (channelDivinity) {
			let usesLeft = channelDivinity.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < cost) {
				console.error(`${optionName} - not enough ${channelDivinityName} uses left`);
				ui.notifications.error(`${optionName} - not enough ${channelDivinityName} uses left`);
			}
			else {
				const newValue = channelDivinity.system.uses.value - cost;
				await channelDivinity.update({"system.uses.value": newValue});
				return true;
			}
		}
		else {
			console.error(`${optionName} - no ${channelDivinityName} item on actor`);
			ui.notifications.error(`${optionName} - no ${channelDivinityName} item on actor`);
		}

		return false;
	}
	
} catch (err) {
	console.error(`${optionName}: ${version}`, err);
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
