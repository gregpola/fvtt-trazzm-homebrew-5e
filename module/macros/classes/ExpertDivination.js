/*
	Beginning at 6th level, casting divination spells comes so easily to you that it expends only a fraction of your
	spellcasting efforts. When you cast a divination spell of 2nd level or higher using a spell slot, you regain one
	expended spell slot. The slot you regain must be of a level lower than the spell you cast and can’t be higher than 5th level.
*/
const version = "12.3.1";
const optionName = "Expert Divination";

export async function expertDivination({speaker, actor, token, character, item, args}) {
    // make sure it was a spell casting
    if (item.type !== 'spell') {
        console.log(`${optionName} - not a spell`);
        return;
    }

    // check the spell school
    if (item.system.school !== 'div') {
        console.log(`${optionName} - not a Divination spell`);
        return;
    }

    // check the spell level
    const spellLevel = item.system.level;
    if (spellLevel < 2) {
        console.log(`${optionName} - level too low`);
        return;
    }

    let slotOptions = new Set();

    // check 1st level
    if ((actor.system.spells.spell1.value < actor.system.spells.spell1.max) && (spellLevel > 1)) {
        slotOptions.add({ type: "radio",
            label: '1st Level',
            value: 1,
            options: "group1" });
    }

    // check 2nd level
    if ((actor.system.spells.spell2.value < actor.system.spells.spell2.max) && (spellLevel > 2)) {
        slotOptions.add({ type: "radio",
            label: '2nd Level',
            value: 2,
            options: "group1" });
    }

    // check 3rd level
    if ((actor.system.spells.spell3.value < actor.system.spells.spell3.max) && (spellLevel > 3)) {
        slotOptions.add({ type: "radio",
            label: '3rd Level',
            value: 3,
            options: "group1" });
    }

    // check 4th level
    if ((actor.system.spells.spell4.value < actor.system.spells.spell4.max) && (spellLevel > 4)) {
        slotOptions.add({ type: "radio",
            label: '4th Level',
            value: 4,
            options: "group1" });
    }

    // check 5th level
    if ((actor.system.spells.spell5.value < actor.system.spells.spell5.max) && (spellLevel > 5)) {
        slotOptions.add({ type: "radio",
            label: '5th Level',
            value: 5,
            options: "group1" });
    }

    // check available options
    if (slotOptions.size < 1) {
        console.log(`${optionName} - no applicable missing spell slots`);
        return;
    }

    const menuOptions = {};
    menuOptions["buttons"] = [
        { label: "Recover", value: true },
        { label: "Cancel", value: false }
    ];
    menuOptions["inputs"] = Array.from(slotOptions);

    let choice = await HomebrewHelpers.menu(menuOptions,
        { title: `${optionName}: which slot level to recover?`, options: { height: "100%", width: "150px" } });
    let targetButton = choice.buttons;

    if (targetButton) {
        let slot = choice.inputs.indexOf(true);
        if (slot > -1) {
            slot++;
            await actor.update({[`system.spells.spell${slot}.value`]: foundry.utils.getProperty(actor, `system.spells.spell${slot}.value`) + 1});
        }

        ChatMessage.create({
            content: `${actor.name} recovered a level ${slot} spell slot`,
            speaker: ChatMessage.getSpeaker({ actor: actor })});
    }
}
