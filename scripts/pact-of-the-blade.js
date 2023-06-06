/*
    You can use your action to create a pact weapon in your empty hand. You can choose the form that this melee weapon
    takes each time you create it. You are proficient with it while you wield it. This weapon counts as magical for the
    purpose of overcoming resistance and immunity to non-magical attacks and damage.

    Your pact weapon disappears if it is more than 5 feet away from you for 1 minute or more. It also disappears if you
    use this feature again, if you dismiss the weapon (no action required), or if you die.

    You can transform one magic weapon into your pact weapon by performing a special ritual while you hold the weapon. You
    perform the ritual over the course of 1 hour, which can be done during a short rest. You can then dismiss the weapon,
    shunting it into an extra-dimensional space, and it appears whenever you create your pact weapon thereafter. You can't
    affect an artifact or a sentient weapon in this way. The weapon ceases being your pact weapon if you die, if you
    perform the 1-hour ritual on a different weapon, or if you use a 1-hour ritual to break your bond to it. The weapon
    appears at your feet if it is in the extra-dimensional space when the bond breaks.
 */

const version = "10.0";
const optionName = "Pact of the Blade";
const eligibleWeaponTypes = ["martialM", "simpleM"];

try {
    if (args[0] === "on") {
        let dialog = new Promise((resolve, reject) => {
            new Dialog({
                // localize this text
                title: `${optionName}`,
                content: `<p>Which Pact Weapon option?</p>`,
                buttons: {
                    one: {
                        label: "<p>Choose a form</p>",
                        callback: () => resolve(1)
                    },
                    two: {
                        label: "<p>Transform a magic weapon</p>",
                        callback: () => { resolve(2) }
                    }
                },
                default: "two"
            }).render(true);
        });

        let pactOption = await dialog;
        let content = "";

        if (pactOption === 1) {
            // all eligible common weapons
            let allItems = await game.packs.get("fvtt-trazzm-homebrew-5e.homebrew-items").getDocuments();
            let eligibleWeapons = allItems.filter(e => eligibleWeaponTypes.includes(e.system.weaponType) && !e.system.properties.mgc)
                .sort((a, b)=> {return a.name < b.name ? -1 : 1;});
            let common_content = "";
            for (let ew of eligibleWeapons) {
                common_content += `<option value=${ew.id}>${ew.name}</option>`;
            }

            content = `<div class="form-group">
			  <label>Choose your Pact Weapon:</label>
			  <div style="margin: 10px;">
				  <select name="titem">
					${common_content}
				  </select>
			  </div>
			</div>`;

            new Dialog({
                title: `${optionName}`,
                content,
                buttons:
                    {
                        Ok:
                            {
                                label: `Ok`,
                                callback: async (html) => {
                                    let itemId = html.find('[name=titem]')[0].value;
                                    let selectedItem = eligibleWeapons.find(i => i._id === itemId);

                                    if (selectedItem) {
                                        const itemName = selectedItem.name + " (Pact Weapon)";

                                        const itemData = duplicate(selectedItem);
                                        // couple changes
                                        delete itemData._id;
                                        itemData.name = itemName;
                                        itemData.system.proficient = true;
                                        itemData.system.equipped = true;
                                        itemData.system.properties.mgc = true;

                                        // Hex Warrior
                                        if (actor.items.getName("Hex Warrior")) {
                                            itemData.system.ability = "cha";
                                        }

                                        const updates = {
                                            embedded: {
                                                Item: {
                                                    [itemData.name]: itemData,
                                                },
                                            },
                                        };
                                        await warpgate.mutate(token, updates, {}, { name: optionName });

                                        ChatMessage.create({content: actor.name + " summoned a Pact Weapon"});
                                        return true;
                                    }
                                }
                            },
                        Cancel:
                            {
                                label: `Cancel`,
                                callback: async (html) => {
                                    return false;
                                }
                            }
                    }
            }).render(true);

        }
        else if (pactOption === 2) {
            // the actor's existing magical weapons
            let weapons = actor.items.filter(i => (i.type === `weapon`)
                && eligibleWeaponTypes.includes(i.system.weaponType)
                && i.system.properties.mgc);
            let weapon_content = ``;
            for (let weapon of weapons) {
                weapon_content += `<option value=${weapon.id}>${weapon.name}</option>`;
            }

            content = `<div class="form-group">
			  <label>Choose your Pact Weapon:</label>
			  <div style="margin: 10px;">
				  <select name="titem">
					${weapon_content}
				  </select>
			  </div>
			</div>`;


            new Dialog({
                title: `${optionName}`,
                content,
                buttons:
                    {
                        Ok:
                            {
                                label: `Ok`,
                                callback: async (html) => {
                                    let itemId = html.find('[name=titem]')[0].value;
                                    let selectedItem = actor.items.get(itemId);

                                    if (selectedItem) {
                                        const itemName = selectedItem.name;

                                        let mutations = {};
                                        mutations[selectedItem.name] = {
                                            "name": itemName + ` (${optionName})`,
                                            "system.properties.mgc": true
                                        };

                                        const updates = {
                                            embedded: {
                                                Item: mutations
                                            }
                                        };

                                        // mutate the selected item
                                        await warpgate.mutate(token, updates, {}, { name: optionName });
                                        ChatMessage.create({content: `${actor.name}'s ${itemName} has become their Pact Weapon`});
                                        return true;
                                    }
                                }
                            },
                        Cancel:
                            {
                                label: `Cancel`,
                                callback: async (html) => {
                                    return false;
                                }
                            }
                    }
            }).render(true);
        }
    }
    else if (args[0] === "off") {
        let restore = await warpgate.revert(token, optionName);
        console.log(`${optionName} - restore is: ${restore}`);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
