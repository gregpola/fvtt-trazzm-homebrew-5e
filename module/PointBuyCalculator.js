import Constants from './t5e-constants.js';
const modulePath = (path) => `modules/${Constants.MODULE_ID}/${path}`;
const {HandlebarsApplicationMixin, ApplicationV2} = foundry.applications.api;

/**
 * Base application from which all system applications should be based.
 */
class Application5e extends HandlebarsApplicationMixin(ApplicationV2) {}

const { BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

/**
 * A data model that represents the Point Buy configuration options.
 * @extends {foundry.abstract.DataModel<PointBuySettingsData>}
 * @mixes PointBuySettingsData
 */
export class PointBuySettings extends foundry.abstract.DataModel {
    /** @override */
    static defineSchema() {
        return {
            enabled: new BooleanField({
                required: true, label: "Point Buy Enabled", hint: "Turn on to allow using point buy for player character ability scores"
            }),
            pool: new NumberField({
                required: true, positive: true, integer: true, min: 0, initial: 35, label: "Points Pool"
            }),
            costs: new SchemaField({
                eight: new NumberField({ integer: true, min: 0, initial: 0, label: "8" }),
                nine: new NumberField({ integer: true, min: 0, initial: 1, label: "9" }),
                ten: new NumberField({ integer: true, min: 0, initial: 1, label: "10" }),
                eleven: new NumberField({ integer: true, min: 0, initial: 1, label: "11" }),
                twelve: new NumberField({ integer: true, min: 0, initial: 1, label: "12" }),
                thirteen: new NumberField({ integer: true, min: 0, initial: 1, label: "13" }),
                fourteen: new NumberField({ integer: true, min: 0, initial: 2, label: "14" }),
                fifteen: new NumberField({ integer: true, min: 0, initial: 2, label: "15" }),
                sixteen: new NumberField({ integer: true, min: -1, initial: 3, label: "16" }),
                seventeen: new NumberField({ integer: true, min: -1, initial: 3, label: "17" }),
                eighteen: new NumberField({ integer: true, min: -1, initial: 4, label: "18" })
            })
        };
    }
}

/**
 * Base application for configuring system settings.
 */
export class PointBuySettingsConfig extends Application5e {
    /** @override */
    static DEFAULT_OPTIONS = {
        id: Constants.MODULE_ID + Constants.POINT_BUY_SETTINGS,
        tag: "form",
        classes: ["standard-form", "pointCostMenu"],
        position: {
            width: 500
        },
        window: {
            icon: "fa-solid fa-calculator",
            title: "Point Buy Settings"
        },
        actions: {
            resetDefaults: this.#resetDefaults
        },
        form: {
            closeOnSubmit: true,
            handler: this.#onCommitChanges
        }
    };

    /* -------------------------------------------- */

    /** @override */
    static PARTS = {
        body: {
            template: modulePath("templates/pb-settings.hbs")
        },
        footer: {
            template: "templates/generic/form-footer.hbs"
        }
    };

    static get defaultCosts() {
        return {
            eight: 0,
            nine: 1,
            ten: 1,
            eleven: 1,
            twelve: 1,
            thirteen: 1,
            fourteen: 2,
            fifteen: 2,
            sixteen: 3,
            seventeen: 3,
            eighteen: 4
        }
    }

    /* -------------------------------------------- */
    /*  Rendering                                   */
    /* -------------------------------------------- */

    /** @inheritDoc */
    async _preparePartContext(partId, context, options) {
        context = await super._preparePartContext(partId, context, options);
        context.fields = PointBuySettings.schema.fields;
        context.source = game.settings.get(Constants.MODULE_ID, Constants.POINT_BUY_SETTINGS);
        context.buttons = [{ type: "submit", icon: "fas fa-save", label: "Save Changes" }];
        return context;
    }

    /* -------------------------------------------- */

    /**
     * Create the field data for a specific setting.
     * @param {string} name  Setting key within the dnd5e namespace.
     * @returns {object}
     */
    createSettingField(name) {
        const setting = game.settings.settings.get(`${Constants.MODULE_ID}.${name}`);
        if ( !setting ) throw new Error(`Setting \`${Constants.MODULE_ID}.${name}\` not registered.`);
        const isDataField = setting.type instanceof DataField;
        const Field = { [Boolean]: BooleanField, [Number]: NumberField, [String]: StringField }[setting.type];
        if ( !isDataField && !Field ) {
            throw new Error("Automatic field generation only available for Boolean, Number, or String types");
        }
        const data = {
            name,
            field: isDataField ? setting.type : new Field({ required: true, blank: false }),
            hint: setting.hint,
            label: setting.name,
            value: game.settings.get(Constants.MODULE_ID, name)
        };
        if ( (setting.type === Boolean) || (setting.type instanceof BooleanField$h) ) data.input = createCheckboxInput;
        if ( setting.choices ) data.options = Object.entries(setting.choices)
            .map(([value, label]) => ({ value, label: label }));
        return data;
    }

    /* -------------------------------------------- */
    /*  Event Listeners and Handlers                */
    /* -------------------------------------------- */

    /**
     * @this PointCostMenu
     * @param {PointerEvent} event  The originating click event
     * @param {HTMLElement} target  The capturing HTML element which defines the [data-action]
     */
    static async #resetDefaults(event, target) {
        this.render({ reset: true })
    }

    /**
     * Commit settings changes.
     * This method processes the submitted form data, updates the settings, and determines if a reload is required.
     * @this {BaseSettingsConfig}
     * @param {SubmitEvent} event          The submission event.
     * @param {HTMLFormElement} form       The submitted form element.
     * @param {FormDataExtended} formData  The submitted form data.
     * @returns {Promise<void>}            Resolves once the settings are updated, or prompts for a reload if required.
     */
    static async #onCommitChanges(event, form, formData) {
        let requiresClientReload = false;
        let requiresWorldReload = false;
        for ( const [key, value] of Object.entries(foundry.utils.expandObject(formData.object)) ) {
            const setting = game.settings.settings.get(`${Constants.MODULE_ID}.${key}`);
            const current = game.settings.get(Constants.MODULE_ID, key, { document: true });
            const prior = current?._source?.value ?? current;
            const updated = await game.settings.set(Constants.MODULE_ID, key, value, { document: true });
            if ( prior === (updated?._source?.value ?? updated) ) continue;
            requiresClientReload ||= (setting.scope !== "world") && setting.requiresReload;
            requiresWorldReload ||= (setting.scope === "world") && setting.requiresReload;
        }
        if ( requiresClientReload || requiresWorldReload ) {
            return foundry.applications.settings.SettingsConfig.reloadConfirm({ world: requiresWorldReload });
        }
    }
}
