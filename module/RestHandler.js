const VERSION = "12.3.0";

export class RestHandler {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering RestHandler");
        RestHandler.hooks();
    }

    static hooks() {
        Hooks.on("dnd5e.restCompleted", (actor, result, config) => {
            //console.log(result);
        });
    }

    static async wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }

}
