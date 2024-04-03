const version = "11.2";
const optionName = "Blessing of the Forge";
const flagName = "blessing-of-the-forge";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
    if (args[0].macroPass === "preItemRoll") {
        // first check if there are any uses remaining
        let uses = workflow.item?.system?.uses?.value ?? 0;
        if (uses < 1) {
            ui.notifications.error(`${optionName} - no uses remaining`);
            return false;
        }

        let target = workflow.targets.first();
        if (!target) {
            ui.notifications.error(`${optionName} - please select a target`);
            return false;
        }

        // find the target actor's weapons & armor that are not magical
        let weapons = target.actor.items.filter(i => ((i.type === `weapon`) && !i.system.properties?.mgc));
        let armor = target.actor.items.filter(i => i.type === 'equipment' && i.system.isArmor); // no current way to know if it is magical

        let targetItems = weapons.concat(armor);
        if (targetItems.length < 1) {
            ui.notifications.error(`${optionName} - ${target.name} has no eligible items`);
            return false;
        }

        let target_content = ``;
        for (let ti of targetItems) {
            target_content += `<option value=${ti.id}>${ti.name}</option>`;
        }

        let content = `
			<div class="form-group">
			  <label>Weapons and Armor:</label>
			  <div style="margin: 10px;">
				  <select name="titem">
					${target_content}
				  </select>
			  </div>
			  <p><em>* Do not select a magical item</em></p>
			</div>`;

        new Dialog({
            title: `⚔️ Choose the item to bless`,
            content,
            buttons:
                {
                    Ok:
                        {
                            label: `Ok`,
                            callback: async (html) => {
                                let itemId = html.find('[name=titem]')[0].value;
                                let selectedItem = target.actor.items.get(itemId);
                                const itemName = selectedItem.name;
                                let isWeapon = selectedItem.type === `weapon`;
                                var armorClass = isWeapon ? 0 : Number(selectedItem.system.armor.value || 0);
                                var attackBonus = isWeapon ? Number(selectedItem.system.attackBonus || 0) : 0;
                                var damageParts = isWeapon ? selectedItem.system.damage.parts : null;

                                // apply the blessing
                                let mutations = {};
                                const newName = itemName + ` (${optionName})`;

                                if (isWeapon) {
                                    damageParts[0][0] = damageParts[0][0] + " + 1";
                                    mutations[selectedItem.name] = {
                                        "name": newName,
                                        "system.properties.mgc": true,
                                        "system.attackBonus": attackBonus + 1,
                                        "system.damage.parts": damageParts
                                    };
                                } else {
                                    mutations[selectedItem.name] = {
                                        "name": newName,
                                        "system.properties.mgc": true,
                                        "system.armor.value": armorClass + 1
                                    };
                                }

                                const updates = {
                                    embedded: {
                                        Item: mutations
                                    }
                                };

                                // mutate the selected item
                                await warpgate.mutate(target.document, updates, {}, {name: itemName});

                                // track target info on the source actor
                                await actor.setFlag(_flagGroup, flagName, {ttoken: target.id, itemName: itemName});

                                ChatMessage.create({content: target.name + "'s " + itemName + " received the Blessing of the Forge from <b>" + actor.name + "</b>"});
                                return true;
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
    } else if (args[0] === "off") {
        let flag = actor.getFlag(_flagGroup, flagName);
        if (flag) {
            await actor.unsetFlag(_flagGroup, flagName);
            const ttoken = canvas.tokens.get(flag.ttoken);
            const itemName = flag.itemName;
            await warpgate.revert(ttoken.document, itemName);
            ChatMessage.create({
                content: `${ttoken.name}'s ${itemName} returns to normal.`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
        }
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
