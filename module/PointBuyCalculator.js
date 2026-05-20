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
                required: true, positive: true, integer: true, min: 0, initial: 35, step: 1, label: "Points Pool"
            }),
            costs: new SchemaField({
                eight: new NumberField({ required: true, integer: true, min: 0, initial: 0, step: 1, label: "8" }),
                nine: new NumberField({ required: true, integer: true, min: 0, initial: 1, step: 1, label: "9" }),
                ten: new NumberField({ required: true, integer: true, min: 0, initial: 1, step: 1, label: "10" }),
                eleven: new NumberField({ required: true, integer: true, min: 0, initial: 1, step: 1, label: "11" }),
                twelve: new NumberField({ required: true, integer: true, min: 0, initial: 1, step: 1, label: "12" }),
                thirteen: new NumberField({ required: true, integer: true, min: 0, initial: 1, step: 1, label: "13" }),
                fourteen: new NumberField({ required: true, integer: true, min: 0, initial: 2, step: 1, label: "14" }),
                fifteen: new NumberField({ required: true, integer: true, min: 0, initial: 2, step: 1, label: "15" }),
                sixteen: new NumberField({ required: true, integer: true, min: -1, initial: 3, step: 1, label: "16" }),
                seventeen: new NumberField({ required: true, integer: true, min: -1, initial: 3, step: 1, label: "17" }),
                eighteen: new NumberField({ required: true, integer: true, min: -1, initial: 4, step: 1, label: "18" })
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
            width: 400
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

// This should only be used on a brand new character
export class PointBuyCalculator extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheet) {
    static DEFAULT_OPTIONS = {
        classes: ["standard-form", "pb-calculator"],
        window: {
            icon: "fa-solid fa-calculator"
        },
        actions: {
            reset: this.#onReset
        },
        form: {
            closeOnSubmit: true
        }
    };

    /** @override */
    static PARTS = {
        header: {
            template: modulePath("templates/pb-header.hbs")
        },
        body: {
            template: modulePath("templates/pb-body.hbs")
        },
        footer: {
            template: "templates/generic/form-footer.hbs"
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        Object.assign(context, {
            actor: this.document
        });

        return context;
    }

    /**
     * Tracks the ability score for each ability
     * @type {Record<string, number>}
     */
    scores = this._resetScores();
    changes = this._resetChanges();
    pointBuySettings = game.settings.get(Constants.MODULE_ID, Constants.POINT_BUY_SETTINGS);
    maxScore = this._calculateMaxScore();
    scoreCosts = this._buildCosts();

    /**
     * Resets the scores object
     * @this PointBuyCalculator
     * @param {PointerEvent} _event - The originating click event
     * @param {HTMLElement} _target - The capturing HTML element which defines the [data-action]
     */
    static async #onReset(_event, _target) {
        this.scores = this._resetScores();
        this.changes = this._resetChanges();
        await this.render();
    }

    _resetScores() {
        return Object.keys(CONFIG.DND5E.abilities).reduce((attribute, key) => {
            attribute[key] = 8;
            return attribute;
        }, {});
    }

    _resetChanges() {
        return Object.keys(CONFIG.DND5E.abilities).reduce((attribute, key) => {
            attribute[key] = 0;
            return attribute;
        }, {});
    }

    _calculateMaxScore() {
        const costKeys = Object.keys(this.pointBuySettings.costs);
        const costValues = Object.values(this.pointBuySettings.costs);
        let maxScore = 8;

        for (let i = 0; i < costKeys.length; i++) {
            if (costValues[i] > 0) {
                var costKeyValue = 8 + i;
                maxScore = Math.max(maxScore, costKeyValue);
            }
        }

        return maxScore
    }

    _buildCosts() {
        const costKeys = Object.keys(this.pointBuySettings.costs);
        const costValues = Object.values(this.pointBuySettings.costs);

        let result = {
        };

        for (let i = 0; i < costKeys.length; i++) {
            if (costValues[i] > -1) {
                var costKeyValue = 8 + i;
                var abilityCost = costValues[i];

                if (i > 0) {
                    abilityCost += result[costKeyValue - 1];
                }
                result[costKeyValue] = abilityCost;
            }
        }

        return result;
    }

    _calcNextCost(value) {
        const costKeys = Object.keys(this.pointBuySettings.costs);
        const costValues = Object.values(this.pointBuySettings.costs);
        let result = 1;

        for (let i = 0; i < costKeys.length; i++) {
            var costKeyValue = 8 + i;
            if (costKeyValue === value) {
                result = costValues[i + 1];
                break;
            }
        }

        return result;
    }

    /** @override */
    async _preparePartContext(partId, context, options) {
        await super._preparePartContext(partId, context, options);

        switch (partId) {
            case "header":
                context.points = {
                    current: this.pointBuySettings.pool - Object.keys(this.changes).reduce((total, key) => {
                        total += this.scoreCosts[this.scores[key] + this.changes[key]];
                        return total;
                    }, 0),
                    max: this.pointBuySettings.pool
                };
                break;

            case "body":
                context.abilities = Object.keys(CONFIG.DND5E.abilities).reduce((abilities, key) => {
                    abilities[key] = {
                        label: CONFIG.DND5E.abilities[key].label,
                        base: this.scores[key],
                        min: 8,
                        max: this.maxScore,
                        total: this.scores[key] + this.changes[key],
                        nextCost: this._calcNextCost(this.scores[key] + this.changes[key])
                    };

                    // set the modifier
                    abilities[key].modifier = Math.floor((abilities[key].total - 10) / 2);

                    // set the max based on current value and points remaining
                    if (abilities[key].nextCost > context.points.current) {
                        abilities[key].max = abilities[key].total;
                    }

                    return abilities;

                }, {});
                break;

            case "footer":
                context.buttons = [
                    {type: "submit", icon: "fa-solid fa-save", label: "TrazzmHomebrew.PBCalculator.SubmitCalculation"},
                    {type: "button", icon: "fa-solid fa-rotate-left", label: "TrazzmHomebrew.PBCalculator.Reset", action: "reset"}
                ];
                break;
        }

        return context;
    }

    async _onChangeForm(_formConfig, _event) {
        const fd = new FormDataExtended(this.element);

        this.scores = Object.keys(CONFIG.DND5E.abilities).reduce((attribute, key) => {
            attribute[key] = foundry.utils.getProperty(fd.object, `system.abilities.${key}.value`);
            return attribute;
        }, {});

        if (this.rendered) await this.render();
    }

    _processFormData(event, form, formData) {
        for (const key of Object.keys(CONFIG.DND5E.abilities)) {
            formData.object[`system.abilities.${key}.value`] = this.scores[key];
        }

        return super._processFormData(event, form, formData);
    }

}
