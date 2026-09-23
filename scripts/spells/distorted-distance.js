/**
 * You create an illusory spatial dilation that fills a 60-foot-radius sphere centered on a point within range. For each
 * creature you can see in the Sphere, you can choose one of the following effects for it:
 *
 * Dizzying Elongation. The creature makes an Intelligence saving throw. On a failed save, the creature takes 2d10 damage,
 * and the Sphere is &Reference[Difficult Terrain] for it until the end of its turn.
 *
 * Shortened Space. The creature’s Speed increases by 20 feet until the end of its next turn.
 *
 * Until the spell ends, whenever a creature enters the Sphere or ends its turn there, you can choose for it to receive
 * one of these effects. A creature can be affected by this spell only once per turn.
 */
const optionName = "Distorted Distance";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // pick the effect

        let content = `
            <p>Apply ${optionName} to this attack?</p>
            <sub>Once per turn, when you damage a target with a weapon, you can add ${damageDice} radiant or necrotic damage.</sub>
            <p>Select the damage type:</p>
            <label><input type="radio" name="choice" value="radiant" checked> Radiant</label>
            <label><input type="radio" name="choice" value="necrotic"> Necrotic</label>`;

        const option = await foundry.applications.api.DialogV2.prompt({
            content: content,
            rejectClose: false,
            ok: {
                callback: (event, button, dialog) => {
                    return button.form.elements.choice.value;
                }
            },
            window: {
                title: `${optionName}`,
            },
            position: {
                width: 400
            }
        });

        if (option) {

        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
