
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

    game.settings.register("fvtt-trazzm-homebrew-5e", "dead-walk", {
        name: "The Dead Walk (RotD)",
        hint: "All creatures that die have a 25% chance to immediately rise as a zombie",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("fvtt-trazzm-homebrew-5e", "keening-mist", {
        name: "The Keening Mist (RotD)",
        hint: "Necromancy spells have advantage to hit and disadvantage to save",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

}
