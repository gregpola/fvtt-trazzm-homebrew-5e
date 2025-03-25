/*
	Your organic parts may be hurt by acid, but your crystalline parts are capable of converting it into life. As a
	reaction to taking acid damage, you may regain 10 hit points on your next turn. Acid damage can never kill you, only
	knock you out.
*/
const version = "10.0";
const optionName = "Acid Conversion";

try {
	if (args[0].tag!== "TargetOnUse")
		return;

	// check for damage type
	//if (workflow.item)

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
