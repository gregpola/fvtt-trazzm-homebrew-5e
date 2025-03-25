/*
    For the duration, the willing creature you touch has resistance to one damage type of your choice: acid, cold, fire, lightning, or thunder.
 */
const version = "12.3.0";
const optionName = "Protection from Energy";
const _elements = { acid: "acid", cold: "cold", fire: "fire", lightning: "lightning", thunder: "thunder" };


const _elementOptions = [
    {name: "acid", image: 'icons/magic/acid/projectile-smoke-glowing.webp', color: 'greenorange'},
    {name: "cold", image: 'icons/magic/water/projectile-ice-snowball.webp', color: 'dark_bluewhite'},
    {name: "fire", image: 'icons/magic/fire/projectile-fireball-smoke-orange.webp', color: 'red'},
    {name: "lightning", image: 'icons/magic/lightning/projectile-orb-blue.webp', color: 'blueyellow'},
    {name: "thunder", image: 'icons/magic/air/air-wave-gust-blue.webp', color: 'purplepink'}
];

try {
    if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.targets.first();
        if (targetToken) {
            let damageType = "fire";

            // ask which type of energy
            const menuOptions = {};
            menuOptions["buttons"] = [
                { label: "OK", value: true }
            ];

            menuOptions["inputs"] = [];
            _elementOptions.forEach(item => {
                menuOptions["inputs"].push({ type: "radio",
                    label: `<img src='${item.image}' width='30' height='30' style='border: 5px; vertical-align: middle; right-margin: 10px;'><label>${capitalizeFirstLetter(item.name)}</label>`,
                    value: item.name,
                    options: "group1" });
            });

            let choice = await HomebrewHelpers.menu( menuOptions,
                { title: `${optionName} - Type of Energy`, options: { height: "100%", width: "100%" } });

            let targetButton = choice.buttons;
            if (targetButton) {
                const selectedIndex = choice.inputs.indexOf(true);

                if (selectedIndex >= 0) {
                    damageType = _elementOptions[selectedIndex].name;
                }
            }

            let effectDataResistance = {
                name: optionName + "- Damage Resistance",
                icon: workflow.item.img,
                origin: workflow.item.uuid,
                changes: [
                    { key: `system.traits.dr.value`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: `${damageType}`, priority: 20 }
                ],
                disabled: false
            };
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: [effectDataResistance] });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
