/*
    As you finish a Short or Long Rest, you can play a song on a Musical Instrument with which you have proficiency and
    give Heroic Inspiration to allies who hear the song. The number of allies you can affect in this way equals your
    Proficiency Bonus (currently @prof).
*/
const version = "12.4.0";
const optionName = "Encouraging Song";

try {
    if (macroActivity && macroActivity.targets) {
        for (let targetToken of macroActivity.targets) {
            await targetToken.actor.update({'system.attributes.inspiration' : true});
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
