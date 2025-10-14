/*
    When you cast this spell, you vanish from your current plane of existence and appear in the Space Between Worlds
    (avoiding the triggering damage). At the start of your next turn, you return to an unoccupied space of your choice
    within 30 feet of the space you vanished from. If no unoccupied space is available within that range, you appear in
    the nearest unoccupied space (chosen at random if more than one space is equally near).

    While within the Space Between Worlds, you can see and hear the plane you originated from, which is cast as a
    roiling blur, and you can’t see anything there more than 60 feet away. You can only affect and be affected by other
    creatures in the Space Between Worlds. Creatures that aren’t there can’t perceive you or interact with you, unless
    they have the ability to do so.
*/
const optionName = "Vanish to the Space Between Worlds";
const version = "13.5.0";

try {
    await new Portal()
        .color("#ff0000")
        .texture("icons/svg/target.svg")
        .origin(token)
        .range(30)
        .teleport();

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
