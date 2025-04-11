/*
    Protective spirits flit around you in a 15-foot Emanation for the duration. If you are good or neutral, their
    spectral form appears angelic or fey (your choice). If you are evil, they appear fiendish.

    When you cast this spell, you can designate creatures to be unaffected by it. Any other creature’s Speed is halved
    in the Emanation, and whenever the Emanation enters a creature’s space and whenever a creature enters the Emanation
    or ends its turn there, the creature must make a Wisdom saving throw. On a failed save, the creature takes 3d8
    Radiant damage (if you are good or neutral) or 3d8 Necrotic damage (if you are evil). On a successful save, the
    creature takes half as much damage. A creature makes this save only once per turn.
 */
const version = "12.4.0"
const optionName = "Spirit Guardians";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const lastAppliedTimeFlag = "spirit-guardians-time";

try {
    for (let targetToken of workflow.targets) {
        const timeFlagName = `${lastAppliedTimeFlag}-${actor.uuid}`;
        HomebrewHelpers.setUsedThisTurn(targetToken.actor, timeFlagName);
    }

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
