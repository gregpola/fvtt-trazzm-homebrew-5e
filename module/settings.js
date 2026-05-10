import Constants from './t5e-constants.js';
import {PointBuySettings, PointBuySettingsConfig} from "./PointBuyCalculator.js";

export function registerSettings() {

    game.settings.register(Constants.MODULE_ID, Constants.LAST_VERSION, {
        name: "Last Version",
        hint: "The last version checked against to determine whether to show the changelog",
        scope: "client",
        config: false,
        type: String,
        default: "1.0.0"
    })

    game.settings.register(Constants.MODULE_ID, Constants.PAN_TO_COMBATANT, {
        name: "Pan to Combatant",
        hint: "When your turn starts pan to the token you control",
        scope: "client",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register(Constants.MODULE_ID, Constants.SHRINK_COMPENDIUM_WINDOWS, {
        name: "Shrink Compendium Windows",
        hint: "Reduce the default height of compendium windows. Set to 0 for no adjustments.",
        scope: "client",
        config: true,
        default: 150,
        type: Number
    });

    game.settings.register(Constants.MODULE_ID, Constants.USE_WEAPON_FUMBLES, {
        name: "Weapon Fumble Handling",
        hint: "What flavor of weapon fumbles to use",
        scope: "world",
        config: true,
        default: Constants.FUMBLE_DUNGEON_DUDES,
        type: String,
        choices: {
            dudes: Constants.FUMBLE_DUNGEON_DUDES,
            none: Constants.FUMBLE_NONE
        }
    });


    // Point Buy
    game.settings.registerMenu(Constants.MODULE_ID, Constants.POINT_BUY_SETTINGS, {
        name: "Point Buy Calculator",
        label: "Point Buy Settings",
        hint: "Configure point buy settings for player characters",
        icon: "fas fa-cogs",
        type: PointBuySettingsConfig,
        restricted: true
    });

    game.settings.register(Constants.MODULE_ID, Constants.POINT_BUY_SETTINGS, {
        name: "Point Buy Configuration",
        scope: "world",
        config: false,
        type: PointBuySettings,
        default: {
            enabled: false,
            pool: 35,
            costs: PointBuySettingsConfig.defaultCosts
        }
        //, onChange: () => game.dnd5e.bastion.initializeUI()
    });
}
