/*
	A willing creature you touch is imbued with bravery. Until the spell ends, the creature is immune to being Frightened
	and gains Temporary Hit Points equal to your Spellcasting ability modifier at the start of each of its turns. When
	the spell ends, the target loses any remaining temporary hit points from this spell.

	At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st.
 */
const version = "11.0";
const optionName = "Heroism";

try {
	let mod = args[1];

	if (args[0] === "on") {
		ChatMessage.create({ content: `${optionName} is applied to ${actor.name}` })
	}

	else if (args[0] === "off") {
		ChatMessage.create({ content: `${optionName} ends for ${actor.name}` });
	}

	else if(args[0] === "each"){
		let bonus = mod > tactor.system.attributes.hp.temp ? mod : tactor.system.attributes.hp.temp;
		actor.update({ "data.attributes.hp.temp": bonus });
		ChatMessage.create({ content: `${optionName} continues on ${actor.name}` })
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
