/*
    At the end of each of the troll’s turns, each creature within 5 feet of it takes 11 (2d10) necrotic damage, unless
    the troll has taken acid or fire damage since the end of its last turn.
*/
const version = "11.0";
const optionName = "Rancid Degeneration";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _damageTypesFlag = "damage-types";

try {
    if (args[0].macroPass === "isDamaged") {
        let damageTypesReceived = actor.getFlag(_flagGroup, _damageTypesFlag);
        if (!damageTypesReceived) {
            damageTypesReceived = [];
        }

        if (workflow.damageDetail) {
            let addedDamageType = false;

            for (let dd of workflow.damageDetail) {
                if (dd.type && !damageTypesReceived.includes(dd.type)) {
                    damageTypesReceived.push(dd.type);
                    addedDamageType = true;
                }
            }

            if (addedDamageType) {
                await actor.setFlag(_flagGroup, _damageTypesFlag, damageTypesReceived);
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}


// Turn end macro
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const optionName = "Rancid Degeneration";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _damageTypesFlag = "damage-types";
const _stopDamageTypes = ["acid", "fire"];

// check for stop damage types
let stopDamage = false;
let receivedDamageTypes = actor.getFlag(_flagGroup, _damageTypesFlag);
if (receivedDamageTypes && receivedDamageTypes.length > 0) {
    for (let dt of receivedDamageTypes) {
        if (_stopDamageTypes.includes(dt)) {
            stopDamage = true;
        }
    }
}

await actor.unsetFlag(_flagGroup, _damageTypesFlag);

if (!stopDamage) {
    const targets = MidiQOL.findNearby(null, token, 5);
    if (targets.length > 0) {
        let damageRoll = await new Roll('2d10').evaluate({async: false});
        await game.dice3d?.showForRoll(damageRoll);
        await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "necrotic", targets, damageRoll, {
            flavor: optionName,
            itemCardId: "new"
        });
    }
}
