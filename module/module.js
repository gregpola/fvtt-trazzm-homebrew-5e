import {CombatHandler} from "./CombatHandler.js";
import {RestHandler} from "./RestHandler.js";
import {SaveHandler} from "./SaveHandler.js";
import {SpellHandler} from "./SpellHandler.js";
import {BarbarianFeatures} from "./BarbarianFeatures.js";
import {WarlockFeatures} from "./WarlockFeatures.js";
import {WizardFeatures} from "./WizardFeatures.js";
import {SummonHelper} from "./SummonHelper.js";
import {macros} from './macros.js';
import {registerSettings} from './settings.js';
import {doTurnStartOptions} from "./utils.js";
import {doLegendaryAction} from "./utils.js";

const SUB_MODULES = {
    CombatHandler,
    RestHandler,
    SaveHandler,
    SpellHandler,
    BarbarianFeatures,
    WarlockFeatures,
    WizardFeatures,
    SummonHelper
};

export let socket = undefined;

Hooks.once('init', async function () {
    console.log('%c fvtt-trazzm-homebrew-5e | Initializing homebrew-5e', 'color: #D030DE');
    registerSettings();
    initialize_module();
});

Hooks.once("ready", async () => {
    // Handle showing changelog
    const currentVersion = game.modules.get("fvtt-trazzm-homebrew-5e").version;
    const lastVersion = game.settings.get("fvtt-trazzm-homebrew-5e", "lastVersion");

    if (foundry.utils.isNewerVersion(currentVersion, lastVersion)) {
        const journal = await fromUuid("Compendium.fvtt-trazzm-homebrew-5e.homebrew-journal-entries.JournalEntry.L9YHsoeODbdhqdKU");
        const page = journal.pages.contents[journal.pages.contents.length - 1];
        journal.sheet.render(true, {pageId: page.id});
        game.settings.set("fvtt-trazzm-homebrew-5e", "lastVersion", currentVersion)
    }
});


Hooks.once('socketlib.ready', async function() {
    socket = socketlib.registerModule('fvtt-trazzm-homebrew-5e');
    socket.register('doTurnStartOptions', doTurnStartOptions);
    socket.register('doLegendaryAction', doLegendaryAction);
});

/**
 * Creation & delete hooks for persistent effects
 */
function initialize_module() {
    Object.values(SUB_MODULES).forEach(cl => cl.register());
}

globalThis['trazzmHomebrew'] = {
    macros
}
