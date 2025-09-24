/*
    Until the spell ends, you can use a bonus action on each of your turns to cause a bolt of lightning to leap from the
    center of the sphere toward one creature you choose within 60 feet of the center. Make a ranged spell attack. You
    have advantage on the attack roll if the target is in the sphere. On a hit, the target takes 4d6 lightning damage.
 */
const version = "13.5.0";
const optionName = "Storm Sphere Bolt";

try {
    if (args[0].macroPass === "preAttackRoll") {
        const targetToken = workflow.targets.first();

        if (targetToken) {
            let tokenInTemplate = false;

            const spellTemplate = targetToken.scene.templates.find(t => t.flags.dnd5e.item === macroItem.uuid);
            if (spellTemplate) {
                const templateShape = spellTemplate.object?.shape;

                if (templateShape) {
                    tokenInTemplate = targetToken.document.getOccupiedGridSpaceOffsets().map(i => targetToken.scene.grid.getCenterPoint(i)).some(i => spellTemplate.object.testPoint(i))
                    if (tokenInTemplate) {
                        workflow.advantage = true;
                    }
                }

                if (!tokenInTemplate) {
                    // check maximum distance from template
                    const distance = canvas.grid.measurePath([spellTemplate, targetToken.document]).distance;
                    if (distance > 60) {
                        workflow.aborted = true;
                        return ui.notifications.error(`${optionName}: ${version} - target is too far from the storm`);
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
