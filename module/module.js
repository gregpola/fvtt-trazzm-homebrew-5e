import { RelentlessRage } from "./RelentlessRage.js";

const SUB_MODULES = {
    RelentlessRage
};

Hooks.once('init', async function () {
    console.log('fvtt-trazzm-homebrew-5e | Initializing homebrew-5e');
    initialize_module();
});

/**
 * Creation & delete hooks for persistent effects
 */
function initialize_module() {
    Object.values(SUB_MODULES).forEach(cl => cl.register());
}
