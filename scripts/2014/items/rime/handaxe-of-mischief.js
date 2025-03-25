const version = "12.3.1";
const optionName = "Handaxe of Mischief";
const damageTypes = ['acid', 'cold', 'fire', 'force', 'lightning', 'poison'];
const videoFiles = ['Flames_01_Regular_Green_200x200.webm',
    'Flames_01_Regular_Blue_200x200.webm',
    'Flames_01_Regular_Orange_200x200.webm',
    'Flames_01_Regular_Purple_200x200.webm',
    'Flames_01_Regular_Blue_200x200.webm',
    'Flames_01_Regular_Green_200x200.webm'];
const baseFilePath = "modules/fvtt-trazzm-homebrew-5e/assets/effects/";

try {
    // make sure it's an attack with the axe
    if (item.name === 'Handaxe of Mischief') {
        let targetToken = workflow.hitTargets.first();
        if (args[0].macroPass === "DamageBonus" && targetToken) {
            // add random damage type
            let typeRoll = await new Roll(`1d6`).evaluate();
            const diceMult = workflow.isCritical ? 2: 1;
            const damageType = damageTypes[typeRoll.total - 1];
            await anime(targetToken, videoFiles[typeRoll.total - 1]);
            return {damageRoll: `${diceMult}d6[${damageType}]`, flavor: optionName};
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, videoFile) {
    new Sequence()
        .effect()
        .file(baseFilePath + videoFile)
        .atLocation(token)
        .play()
}
