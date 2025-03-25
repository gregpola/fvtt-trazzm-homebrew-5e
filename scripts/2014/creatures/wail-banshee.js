/*
    The banshee releases a mournful wail, provided that she isn’t in sunlight. This wail has no effect on constructs and
    undead. All other creatures within 30 feet of her that can hear her must make a DC 13 Constitution saving throw. On
    a failure, a creature drops to 0 hit points. On a success, a creature takes 10 (3d6) psychic damage.
 */
const version = "12.3.0";
const optionName = "Wail";

try {
    if (args[0].macroPass === "preambleComplete") {
        // check target types, remove the undead
        for (let target of workflow.targets) {
            // remove targets that are undead or constructs
            if (["undead", "construct"].includes(MidiQOL.typeOrRace(target.actor))) {
                workflow.targets.delete(target);
            }
        }

        game.user.updateTokenTargets(Array.from(workflow.targets).map(t => t.id));

    }
    else if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            let damageTotal = targetToken.actor.system.attributes.hp.value;
            await MidiQOL.applyTokenDamage([{ damage: damageTotal, type: 'psychic' }], damageTotal, new Set([targetToken]));
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
