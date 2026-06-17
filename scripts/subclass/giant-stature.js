/*
    As a Bonus Action, you transform and enlarge your armor for 1 minute. For the duration, your reach increases by
    5 feet, and if you are smaller than Large, you become Large, along with anything you are wearing. If there isn’t
    enough room for you to increase your size, your size doesn’t change. You can use this Bonus Action a number of times
    equal to your Intelligence modifier (minimum of once). You regain all expended uses when you finish a Long Rest.

    L15 - Perfected Armor
    In addition, when you use your Giant Stature, your reach increases by 10 feet, your size can increase to Large or
    Huge (your choice), and you have Advantage on Strength checks and Strength saving throws for the duration.
*/
const optionName = "Giant Stature";
const version = "14.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "giant-stature";

const SIZE_ORDER = ["tiny", "sm", "med", "lg", "huge", "grg"];
const SIZE_TO_GRID = {
    tiny: 0.5,
    sm: 1,
    med: 1,
    lg: 2,
    huge: 3,
    grg: 4,
};

try {
    if (args[0] === "on") {
        const perfectedArmor = actor.items.getName("Perfected Armor");

        let flag = actor.getFlag(_flagGroup, _flagName);
        if (!flag) {
            const currentSize = actor.system.traits.size;
            if (["tiny", "sm", "med"].includes(currentSize)) {
                await actor.setFlag(_flagGroup, _flagName,
                    { originalSize: currentSize, originalHeight: token.document.height, originalWidth: token.document.width });

                let newSize = "lg";
                if (perfectedArmor) {
                    // ask what size
                    let content = '<p>What size do you want to become?</p>' +
                        '<label><input type="radio" name="choice" value="lg" checked> Large</label>' +
                        '<label><input type="radio" name="choice" value="huge"> Huge</label>';

                    const sizeChoice = await foundry.applications.api.DialogV2.prompt({
                        content: content,
                        rejectClose: false,
                        ok: {
                            callback: (event, button, dialog) => {
                                return button.form.elements.choice.value;
                            }
                        },
                        window: {
                            title: `${optionName}`,
                        },
                        position: {
                            width: 400
                        }
                    });

                    newSize = sizeChoice ? sizeChoice : "lg";
                }

                const newGrid = SIZE_TO_GRID[newSize];
                await token.document.update({
                    width: newGrid,
                    height: newGrid
                });

                await actor.update({ "system.traits.size": newSize });
            }
        }
    }
    else if (args[0] === "off") {
        let flag = actor.getFlag(_flagGroup, _flagName);
        if (flag) {
            await actor.update({ "system.traits.size": flag.originalSize });

            await token.document.update({
                width: flag.originalWidth,
                height: flag.originalHeight
            });

            await actor.unsetFlag(_flagGroup, _flagName);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
