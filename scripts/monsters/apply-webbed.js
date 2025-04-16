const version = "12.4.0";
const optionName = "Webbedd";

const params =
    [{
        filterType: "web",
        filterId: "simpleweb",
        time: 100,
        div1: 20,
        div2: 10,
        animated :
            {
                time :
                    {
                        active: true,
                        speed: 0.0005,
                        animType: "move"
                    }
            }
    }]

try {
    if (args[0] === "on") {
        await TokenMagic.addUpdateFilters(token, params);    }
    else if (args[0] === "off") {
        await TokenMagic.deleteFilters(token, "simpleweb");
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
