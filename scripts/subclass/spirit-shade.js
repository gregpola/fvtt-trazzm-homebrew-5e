/*
	The target has the Invisible condition until the end of its next turn or until the target makes an attack roll,
	deals damage, or casts a spell.

	When the invisibility ends, each creature in a 5-foot Emanation originating from the target must succeed on a
	Constitution saving throw or take Necrotic damage equal to two rolls of your Bardic Inspiration die.
*/
const optionName = "Shade Spirit";
const version = "14.5.0";
const shardName = "Shade Spirit Shard";
const shardId = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.lficYmZY5StvRObf";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.targets.first();
        if (targetToken) {
            // add the shard to the target
            const sourceActor = macroItem.parent;
            const dc = sourceActor.system.attributes.spell.dc;
            const inspirationDie = sourceActor.system.scale.bard.inspiration.formula;

            let shardItem = await fromUuid(shardId);
            let tempItem = shardItem.toObject();
            let results = await targetToken.actor.createEmbeddedDocuments('Item',[tempItem]);

            const shard = results[0];
            await shard.update({
                'system.equipped' : true
            });

            let activity = shard.system.activities.getName("Save");
            const damageParts = foundry.utils.duplicate(activity.damage.parts);
            damageParts[0].custom.formula = `${inspirationDie} + ${inspirationDie}`;
            await activity.update({
                "damage.parts": damageParts
            });

            await activity.update({
                "save.dc.formula" : `${dc}`,
                "save.dc.value": dc
            });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
