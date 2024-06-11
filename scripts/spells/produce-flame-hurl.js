const version = "11.0";
const optionName = "Produce Flame - Hurl";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // revert mutation that gave this item
        await warpgate.revert(token.document, "Hurl Flame");

    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
