/*
	As a bonus action, the spider can magically shift from the Material Plane to the Ethereal Plane, or vice versa.
*/
const version = "10.0";
const optionName = "Shadow Jaunt";

try {
	if (args[0] === "on") {
		await token.update({ "hidden": true });
	}
	else if (args[0] === "off") {
		await token.update({ "hidden": false });
	}

} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}