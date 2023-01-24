[![Github All Releases](https://img.shields.io/github/downloads/gregpola/fvtt-trazzm-homebrew-5e/total.svg)]() 
# fvtt-trazzm-homebrew-5e
    A collection of homebrew content for dnd5e in FoundryVTT

### Compatibility:
  - Tested with FVTT v10 and the DND5E system 2.1+.

### Installation Instructions

To install a module, follow these instructions:

  1. Start FVTT and browse to the Game Modules tab in the Configuration and Setup menu
  2. Select the 'Install Module' button and enter the following URL: https://github.com/gregpola/fvtt-trazzm-homebrew-5e/releases/latest/download/module.json
  3. Click Install and wait for installation to complete 

### Module Dependencies
  * active-auras
  * dfreds-convenient-effects
  * dae - Dynamic effects using Active Effects
  * effectmacro
  * item-macro
  * midi-qol
    * Use the import file found in the config folder to ensure you have the settings required to support automation
  * sequencer
  * templatemacro

### World Scripts
  - This module has some world scripts to support some features. To install them, folow these steps:
    1. Shutdown your world.
    2. Copy the scripts named world-* from the module scripts directory to the root folder of your world.
        The path is something like: ../FoundryVTT/data/worlds/<world name>.
    3. Edit the world's world.json to include those scripts:
        "esmodules": [
            "world-protection-from-evil.js",
            "world-mirror-image.js"
        ],
    4. Restart your world