/*
    A generic Enlarge macro that can be used for Enlarge or Reduce automation
*/
const optionName = "Enlarge";
const version = "14.5.0";

try {
    if (args[0] === "on") {
        await HomebrewHelpers.changeTokenSize(token, "lg");
    }
    else if (args[0] === "off") {
        await HomebrewHelpers.revertTokenSizeChange(token);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
