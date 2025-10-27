
export function registerSettings() {

    game.settings.register("fvtt-trazzm-homebrew-5e", "lastVersion", {
        name: "Last Version",
        hint: "The last version checked against to determine whether to show the changelog",
        scope: "client",
        config: false,
        type: String,
        default: "1.0.0"
    })

    game.settings.register("fvtt-trazzm-homebrew-5e", "pan-to-combatant", {
        name: "Pan to Combatant",
        hint: "When your turn starts pan to the token you control",
        scope: "client",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register("fvtt-trazzm-homebrew-5e", "shrink-compendium-windows", {
        name: "Shrink Compendium Windows",
        hint: "Reduce the default height of compendium windows. Set to 0 for no adjustments.",
        scope: "client",
        config: true,
        default: 150,
        type: Number
    });

}
