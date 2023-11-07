/*
	You touch a nonmagical weapon. Until the spell ends, that weapon becomes a magic weapon with a +1 bonus to Attack rolls and Damage Rolls.

    At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, the bonus increases to +2. When you use a spell slot of 6th level or higher, the bonus increases to +3.
*/
const version = "11.0";
const optionName = "Magic Weapon";
const flagName = "spell-magic-weapon";

try {
    if (args[0].macroPass === "preItemRoll") {
        let target = workflow.targets.first();
        if (!target) {
            ui.notifications.error(`${optionName} - please select a target`);
            return false;
        }

        // find the target actor's weapons that are not magical
        let weapons = target.actor.items.filter(i => ((i.type === `weapon`) && !i.system.properties?.mgc));
        if (weapons.length < 1) {
            ui.notifications.error(`${optionName} - ${target.name} has no eligible weapons`);
            return false;
        }

        return true;
    }
    else if (args[0].macroPass === "postActiveEffects") {
        let target = workflow.targets.first();
        const spellLevel = workflow.castData.castLevel;

        // find the target actor's weapons that are not magical
        let weapons = target.actor.items.filter(i => ((i.type === `weapon`) && !i.system.properties?.mgc));
        if (weapons.length < 1) {
            ui.notifications.error(`${optionName} - ${target.name} has no eligible weapons`);
            return false;
        }

        let target_content = ``;
        for (let ti of weapons) {
            target_content += `<option value=${ti.id}>${ti.name}</option>`;
        }

        let content = `
			<div class="form-group">
			  <label>Weapons:</label>
			  <div style="margin: 10px;">
				  <select name="titem">
					${target_content}
				  </select>
			  </div>
			</div>`;

        new Dialog({
            title: `⚔️ Choose the item to imbue with magic`,
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
                                const bonusValue = spellLevel > 5 ? 3 : spellLevel > 3 ? 2 : 1;
                                var damageParts = selectedItem.system.damage.parts;

                                // apply the blessing
                                let mutations = {};
                                const newName = itemName + ` (${optionName})`;

                                damageParts[0][0] = damageParts[0][0] + " + " + bonusValue.toString();
                                mutations[selectedItem.name] = {
                                    "name": newName,
                                    "system.properties.mgc": true,
                                    "system.attackBonus": bonusValue,
                                    "system.damage.parts": damageParts
                                };

                                const updates = {
                                    embedded: {
                                        Item: mutations
                                    }
                                };

                                // mutate the selected item
                                await warpgate.mutate(target.document, updates, {}, {name: itemName});

                                // track target info on the source actor
                                await actor.setFlag("fvtt-trazzm-homebrew-5e", flagName, {tokenId: target.id, itemName: itemName});
                                ChatMessage.create({content: target.name + "'s " + itemName + " has become magical!"});
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
    }
    else if (args[0] === "off") {
        const flag = actor.getFlag("fvtt-trazzm-homebrew-5e", flagName);
        if (flag) {
            const targetToken = canvas.tokens.get(flag.tokenId);
            const itemName = flag.itemName;
            await warpgate.revert(targetToken.document, itemName);
            await actor.unsetFlag("fvtt-trazzm-homebrew-5e", flagName);
            ChatMessage.create({
                content: `${targetToken.name}'s ${itemName} returns to normal`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
