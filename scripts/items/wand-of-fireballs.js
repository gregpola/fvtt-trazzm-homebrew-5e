/*

*/
const version = "12.3.0";
const optionName = "Wand of Fireballs";

try {
    const currentCharges = item.system.uses.value;

    if (args[0].macroPass === "preItemRoll") {
        if (!currentCharges) {
            ui.notifications.error(`${optionName} - is out of charges`);
            return false;
        }

        workflow.config.consumeUsage = false;
        workflow.config.needsConfiguration = false;
        workflow.options.configureDialog = false;
        return true;

    }
    else if (macroPass === "postActiveEffects") {
        // Ask how many charges to use
        const options = Array.fromRange(currentCharges + 1).reduce((acc, e) => acc += `<option value="${e+1}">${e+1}</option>`, "");
        let the_content = `<p>How many charges do you want to spend?.</p><form class="flexcol"><table><tbody><tr><th>Target</th><th>Missiles</th></tr>${targetList}</tbody></table></form>`;

        let chargeCount = await foundry.applications.api.DialogV2.prompt({
            window: {title: `${optionName} Charges`},
            content: the_content,

        });
        // test for destruction

    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
