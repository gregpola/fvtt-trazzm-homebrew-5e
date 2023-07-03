
export function registerSettings() {

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
