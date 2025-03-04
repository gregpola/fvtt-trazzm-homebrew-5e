/*
	At 1st level, the cleric learns one necromancy cantrip of his or her choice from any spell list. When the cleric
	casts a necromancy cantrip that normally targets only one creature, the spell can instead target two creatures
	within range and within 5 feet of each other.

	Improved Reaper: allows two targets for any necromancy spell of 5th or lower level
*/
const version = "12.3.0";
const optionName = "Reaper";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects" && item.type === "spell") {
        const improvedReaper = actor.items.getName("Improved Reaper");
        const maxLevel = improvedReaper ? 5 : 0;

        // check level and school and targeting
        if (item.system.level <= maxLevel && item.system.school === "nec" && item.system.target.value === 1) {
            const primaryTarget = workflow.targets.first();
            let secondaryTargets = await MidiQOL.findNearby(null, primaryTarget, 5, {canSee: true});
            if (secondaryTargets && secondaryTargets.length > 0) {
                // ask which secondary target
                let target_content = ``;
                for (let t of secondaryTargets) {
                    target_content += `<option value=${t.id}><img src='${t.document.texture.src}' width='30' height='30' style='border: 5px; vertical-align: middle;margin-right: 10px;'/>${t.name}</option>`;
                }

                let content = `<div class="form-group">
							<p><label>Second Target: </label></p>
							<p><select name="targets">${target_content}</select></p>
						</div>`;

                let targetId = await foundry.applications.api.DialogV2.prompt({
                    content: content,
                    rejectClose: false,
                    ok: {
                        callback: (event, button, dialog) => {
                            return button.form.elements.targets.value
                        }
                    },
                    window: {
                        title: `${optionName}`,
                    },
                    position: {
                        width: 400
                    }
                });

                if (targetId) {
                    let newTarget = canvas.tokens.get(targetId);
                    if (newTarget) {
                        let duplicateSpell = foundry.utils.duplicate(item)
                        delete duplicateSpell._id;
                        duplicateSpell.system.range = 'any';
                        duplicateSpell.system.target = {value: undefined, units: "", type: "creature"};
                        let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions([newTarget.document.uuid]);
                        let feature = new CONFIG.Item.documentClass(duplicateSpell, {'parent': actor});
                        await MidiQOL.completeItemUse(feature, config, options);
                    }
                }
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
