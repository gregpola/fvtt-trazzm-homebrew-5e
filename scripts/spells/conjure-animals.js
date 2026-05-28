/*
	You have Advantage on Strength saving throws while you’re within 5 feet of the pack, and when you move on your turn,
	you can also move the pack up to 30 feet to an unoccupied space you can see.
*/
const optionName = "Conjure Animals";
const version = "14.5.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "preTargetSave") {
        console.log(workflow);
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
