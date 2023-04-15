import {InitiativeHandler} from "./InitiativeHandler.js";
import {SaveHandler} from "./SaveHandler.js";
import {SpellHandler} from "./SpellHandler.js";
import {BarbarianFeatures} from "./BarbarianFeatures.js";
import {WarlockFeatures} from "./WarlockFeatures.js";
import {WizardFeatures} from "./WizardFeatures.js";
import {macros} from './macros.js';

const SUB_MODULES = {
    InitiativeHandler,
    SaveHandler,
    SpellHandler,
    BarbarianFeatures,
    WarlockFeatures,
    WizardFeatures
};

Hooks.once('init', async function () {
    console.log('%c fvtt-trazzm-homebrew-5e | Initializing homebrew-5e', 'color: #D030DE');
    initialize_module();
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