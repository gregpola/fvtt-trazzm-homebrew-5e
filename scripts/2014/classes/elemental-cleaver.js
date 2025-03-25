/*
    Your bond with the elemental might of giants grows, and you learn to infuse weapons with primordial energy.

    When you enter your rage, you can choose one weapon that you are holding and infuse it with one of the following
    damage types: acid, cold, fire, thunder, or lightning. While you wield the infused weapon during your rage, the
    weapon’s damage type changes to the chosen type, it deals an extra 1d6 damage of the chosen type when it hits, and
    it gains the thrown property, with a normal range of 20 feet and a long range of 60 feet. If you throw the weapon,
    it reappears in your hand the instant after it hits or misses a target. The infused weapon’s benefits are suppressed
    while a creature other than you wields it.

    While raging and holding the infused weapon, you can use a bonus action to change the infused weapon’s current
    damage type to another one from the damage type options above.
*/
const version = "12.3.0";
const optionName = "Elemental Cleaver";
const effectName = "Elemental Cleaver Infused";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "elemental-cleaver-data";

const _elementOptions = [
    {name: "Acid", image: 'icons/magic/fire/dagger-rune-enchant-flame-strong-green.webp'},
    {name: "Cold", image: 'icons/magic/fire/dagger-rune-enchant-flame-strong-blue.webp'},
    {name: "Fire", image: 'icons/magic/fire/dagger-rune-enchant-flame-strong-red.webp'},
    {name: "Lightning", image: 'icons/magic/fire/dagger-rune-enchant-flame-strong-blue-yellow.webp'},
    {name: "Thunder", image: 'icons/magic/fire/dagger-rune-enchant-flame-strong-teal-purple.webp'}
];

try {
    if (args[0].macroPass === "postActiveEffects") {
        // build weapon selection
        let availableWeapons = actor.items.filter(i => (i.type === `weapon`));
        let weaponOptions = ``;
        for (let weapon of availableWeapons) {
            weaponOptions += `<option value=${weapon.id}>${weapon.name}</option>`;
        }

        // build element selection
        let elementOptions = ``;
        for (let element of _elementOptions) {
            elementOptions += `<option value=${element.name.toLowerCase()}><img src=${element.image} width='30' height='30' style='border: 5px; vertical-align: middle;'/>  ${element.name}</option>`;
        }

        // build the dialog content
        let _content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>Weapons to Infuse:</label></div>
				<div class="flexcol" style="margin-bottom: 10px;">
				  <select name="wchoice">
					${weaponOptions}
				  </select>
				</div>
				<div class="flexrow" style="margin-bottom: 10px;"><label>Elemental Type:</label></div>
				<div class="flexcol" style="margin-bottom: 10px;">
				  <select name="echoice">
					${elementOptions}
				  </select>
				</div>
			</div>
		  </form>`;

        new foundry.applications.api.DialogV2({
            window: { title: `${optionName}` },
            content: _content,
            buttons: [{
                action: "initial",
                label: "Initial Use",
                default: true,
                callback: (event, button, dialog) => {
                    return ['initial', button.form.elements.wchoice.value, button.form.elements.echoice.value];
                }
            }, {
                action: "change",
                label: "Change Element",
                callback: (event, button, dialog) => {
                    return ['change', button.form.elements.wchoice.value, button.form.elements.echoice.value];
                }
            }],
            rejectClose: false,
            submit: async result => {
                console.log(result);

                // get the weapon selected
                let selectedWeapon = actor.items.find(i => i.id === result[1]);
                if (selectedWeapon) {
                    const damageType = result[2];
                    let baseFormula = selectedWeapon.system.damage.parts[0][0];
                    let baseType = selectedWeapon.system.damage.parts[0][1];
                    let versatile = selectedWeapon.system.damage.versatile;

                    // stash the old data
                    await actor.setFlag(_flagGroup, flagName, {
                        'id': selectedWeapon.id,
                        'name': selectedWeapon.name,
                        'baseFormula': baseFormula,
                        'baseType': baseType,
                        'versatile': versatile
                    });

                    const demiurgicColossus = actor.items.getName("Demiurgic Colossus");
                    let bonusDice = demiurgicColossus ? 2 : 1;
                    baseFormula += ' + ' + bonusDice + 'd6';
                    if (versatile?.length) versatile += ' + ' + bonusDice + 'd6';

                    // build the damage parts
                    let copy_item = foundry.utils.duplicate(selectedWeapon);

                    copy_item.name = copy_item.name + ` (${damageType} Infused)`;
                    copy_item.system.damage.parts[0][0] = baseFormula;
                    copy_item.system.damage.parts[0][1] = damageType;
                    copy_item.system.damage.versatile = versatile;
                    await actor.updateEmbeddedDocuments("Item", [copy_item]);

                    ChatMessage.create({
                        content: `${token.name}'s ${selectedWeapon.name} is imbued with nature's power`,
                        speaker: ChatMessage.getSpeaker({ actor: actor })});

                    // use bonus action
                    if (result[0] === "change") {
                        await MidiQOL.setBonusActionUsed(actor);
                    }
                }
                else {
                    console.error(`${optionName}: ${version}`, 'Unable to find the weapon');
                }
            }
        }).render({ force: true });
    }
    else if (args[0] === "off") {
        let flag = actor.getFlag(_flagGroup, flagName);
        if (flag) {
            await actor.unsetFlag(_flagGroup, flagName);
            let enchantedWeapon = actor.items.get(flag.id);
            if (enchantedWeapon) {
                let copy_item = foundry.utils.duplicate(enchantedWeapon.toObject(false));
                copy_item.name = flag.name;
                copy_item.system.damage.parts[0][0] = flag.baseFormula;
                copy_item.system.damage.parts[0][1] = flag.baseType;
                copy_item.system.damage.versatile = flag.versatile;
                await actor.updateEmbeddedDocuments("Item", [copy_item]);

                ChatMessage.create({
                    content: `${token.name}'s ${flag.name} returns to normal.`,
                    speaker: ChatMessage.getSpeaker({ actor: actor })});
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
