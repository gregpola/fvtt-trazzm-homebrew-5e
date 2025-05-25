const optionName = "Dragonborn Breath Weapon";
const version = "12.4.0";
const animationPrefix = "modules/fvtt-trazzm-homebrew-5e/assets/animations/";

const _breathOptions = {
    ray: {
        "acid": 'BreathWeapon_Acid01_Regular_Green_30ft_Line_Burst_1200x200.webm',
        "cold": 'BreathWeapon_Acid01_Regular_Blue_30ft_Line_Burst_1200x200.webm',
        "fire": 'BreathWeapon_Fire01_Regular_Orange_30ft_Line_Burst_1200x200.webm',
        "lightning": 'BreathWeapon_Lightning01_Regular_Blue_30ft_Line_Burst_1200x200.webm',
        "poison": 'BreathWeapon_Fire01_Regular_Green_30ft_Line_Burst_1200x200.webm'
    },
    cone: {
        "acid": 'BreathWeapon_Fire01_Regular_Green_30ft_Cone_Burst_600x600.webm',
        "cold": 'BreathWeapon_Cold01_Regular_Blue_30ft_Cone_Burst_600x600.webm',
        "fire": 'BreathWeapon_Fire01_Regular_Orange_30ft_Cone_Burst_600x600.webm',
        "lightning": 'TemplateCone5eLightning01_01_Regular_BluePurple_30ft_Loop_800x800.webm',
        "poison": 'BreathWeapon_Poison01_Regular_Green_30ft_Cone_Burst_600x600.webm'
    }
};

try {
    if (args[0].macroPass === "preItemRoll") {
        Hooks.once("createMeasuredTemplate", async (template) => {
            // look for visibility and region
            await template.update({'hidden': true});
        });
    }
    else if (args[0].macroPass === "preSave") {
        // get the template
        const templateDocument = await fromUuid(workflow.templateUuid);
        if (templateDocument) {
            const latestTemplate = templateDocument;
            let animationFile = animationPrefix;

            // get the damage type
            const damageType = workflow.damageDetail[0].type.toLowerCase();

            // run animation based on shape and damage type
            if (templateDocument.t === "ray") {
                animationFile += _breathOptions.ray[damageType];
            }
            else {
                animationFile += _breathOptions.cone[damageType];
            }

            new Sequence()
                .effect()
                .file(animationFile)
                .atLocation(latestTemplate)
                .scaleToObject()
                .rotateTowards(latestTemplate)
                .play();
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
