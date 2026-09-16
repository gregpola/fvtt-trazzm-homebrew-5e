import * as queryUtils from './t5e-queryUtils.mjs';

const {HandlebarsApplicationMixin, ApplicationV2} = foundry.applications.api;
class Application5e extends HandlebarsApplicationMixin(ApplicationV2) {}
const { BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;
const INPUTS_TEMPLATE = 'modules/fvtt-trazzm-homebrew-5e/templates/dialog-fields.hbs';
const STANDARD_FACES = new Set([4, 6, 8, 10, 12, 20]);

Hooks.once('setup', () => {
    foundry.applications.handlebars.loadTemplates([INPUTS_TEMPLATE]);
});

export class DialogUtils {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering DialogUtils");
        //DialogUtils.hooks();
    }

    static bringToFront(app) {
        if (!app.element) return;
        app.position.zIndex = ++foundry.applications.api.ApplicationV2._maxZ;
        app.element.style.zIndex = String(app.position.zIndex);
        ui.activeWindow = app;
    }

    static centerWindow(app, {width = 0, height = 0} = {}) {
        if (!app.element) return;
        const win = app.element.ownerDocument.defaultView ?? window;
        const w = app.element.offsetWidth || width;
        const h = app.element.offsetHeight || height;
        app.setPosition({left: (win.innerWidth - w) / 2, top: (win.innerHeight - h) / 2});
    }

    static enableWindowDrag(app, handleSelector, {ignore = 'button, a, input, select, textarea, [data-action]'} = {}) {
        const handle = app.element?.querySelector(handleSelector);
        if (!handle || handle.dataset.dragWired === '1') return;
        handle.dataset.dragWired = '1';
        const drag = new foundry.applications.ux.Draggable.implementation(app, app.element, handle, false);
        const orig = drag._onDragMouseDown.bind(drag);
        drag._onDragMouseDown = event => {
            if (event.target.closest(ignore)) return;
            orig(event);
        };
    }

    static async selectHitDie(actor, content, {max = 1, userId = game.user.id, recover = false} = {}) {
        let documents = actor.items.filter(i => {
            if (i.type !== 'class') return false;
            return recover ? i.system.hd.spent > 0 : (i.system.levels - i.system.hd.spent) > 0;
        });
        if (!documents.length) return false;

        documents = documents.sort((a, b) => a.name.localeCompare(b.name, 'en', {sensitivity: 'base'}));
        let inputFields = documents.map(i => ({
            label: _loc('TrazzmHomebrew.Dialog.SelectHitDice.HitDieLabel', {
                className: i.name,
                remaining: recover ? i.system.hd.spent : (i.system.levels - i.system.hd.spent),
                max: i.system.levels,
                denomination: i.system.hd.denomination
            }),
            name: i.id,
            options: {
                image: i.img,
                minAmount: 0,
                maxAmount: Math.min(recover ? i.system.hd.spent : (i.system.levels - i.system.hd.spent), max)
            }
        }));

        let inputs = [[max === 1 ? 'checkbox' : 'selectAmount', inputFields, {displayAsRows: true, totalMax: max}]];
        let result = await DialogUtils.runDialog(userId, _loc("TrazzmHomebrew.Dialog.SelectHitDice.Title"), content, inputs, 'okCancel', {id: 'select-hit-dice-dialog', width: 400});
        if (!result?.buttons) return false;
        delete result.buttons;
        return Object.entries(result).map(([key, value]) => ({
            document: documents.find(d => d.id === key),
            amount: Number(value)
        }));
    }

    static async runDialog(userId, title, content, inputs, buttons, config) {
        if (userId === game.user.id) return await DialogApp.dialog(title, content, inputs, buttons, config);
        return await queryUtils.query('dialog', game.users.get(userId), {title, content, inputs, buttons, config}, 300000);
    }
}

export default class DialogApp extends Application5e {
    #context;
    #resolveResults;
    #resultsPromise;

    #expandedSections = new Map();
    #queuedOpenSections = new Set();

    constructor(options) {
        const [title, content, inputs, buttons, config] = options;

        const init = config?.id ? {id: config.id} : {};
        if (config?.width != null || config?.height != null) {
            init.position = {};
            if (config.width != null) init.position.width = config.width;
            if (config.height != null) init.position.height = config.height;
        }
        super(init);

        this._armResults();
        if (!options?.length) return;
        this.windowTitle = title;
        this.content = content;
        this.inputs = inputs;
        this.buttons = buttons;
        return this;
    }

    static async dialog(...options) {
        return new Promise((resolve) => {
            const dialog = new DialogApp(options);
            dialog.addEventListener('close', () => resolve(null), {once: true});
            // Inherit detached-window context from the currently active app (so dialogs spawned
            // from a detached popup open in that popup, not the main client).
            const windowId = ui.activeWindow?.window?.windowId;
            const renderOptions = windowId ? {force: true, window: {windowId}} : {force: true};
            dialog.render(renderOptions);
            dialog.submit = result => {
                resolve(result);
                dialog.close();
            };
        });
    }

    static PARTS = {
        dialog: {
            classes: ["dialog"],
            template: "modules/fvtt-trazzm-homebrew-5e/templates/dialog-app.hbs",
            scrollable: ['.scrollable'],
            resizable: true,
            draggable: true,
        }
    };

    static DEFAULT_OPTIONS = {
        id: "t5e-dialog-app-{id}",
        classes: ["t5e", "t5e-dialog"],
        tag: "form",
        form: {handler: DialogApp.#formHandler, submitOnChange: !1, closeOnSubmit: !1},
        actions: {
            confirm: DialogApp.#onConfirm,
            cancel: DialogApp.#onCancel
        },
        window: {
            icon: "fa-solid fa-bed",
            frame: false,
            positioned: true,
            resizable: true,
            draggable: true,
            contentClasses: ["standard-form"]
        },
        resizable: true
    };
    //position: {width: "auto", height: "auto"},

    _setContents({content, inputs, buttons} = {}) {
        this.content = content;
        this.inputs = inputs;
        this.buttons = buttons;
        this.#context = null;
        this.#expandedSections.clear();
        this.#queuedOpenSections.clear();
        this._armResults();
    }

    _armResults() {
        this.#resultsPromise = new Promise(r => this.#resolveResults = r);
    }

    async _awaitResults() {
        return await this.#resultsPromise;
    }

    async _onRender(context, options) {
        await super._onRender(context, options);
        DialogUtils.enableWindowDrag(this, '.t5e-dialog-header');

        for (const button of Array.from(this.element.querySelectorAll(".dialog-button"))) {
            button.addEventListener("click", this._onClickButton.bind(this));
        }
        $(document).on('keydown.chooseDefault', this._onKeyDown.bind(this));

        const counter = this.element?.querySelector('.t5e-dialog-body .t5e-budget-counter');
        const header = this.element?.querySelector('.t5e-dialog-header');

        if (counter && header) header.insertBefore(counter, header.querySelector('.t5e-app-header-button'));
        if (options.isFirstRender) {
            this.bringToFront();
            DialogUtils.centerWindow(this, {width: 500, height: 400});
            this.element.addEventListener('t5e-resize', () => {
                this.setPosition({width: 'auto', height: 'auto'});
            });
        }

        for (const elem of this.element.querySelectorAll('.label-image[data-token-id]')) {
            const id = elem.dataset.tokenId;
            elem.addEventListener('click', async () => {
                const token = canvas.tokens.get(id);
                if (token) await canvas.ping(token.center);
            });
            elem.addEventListener('mouseover', () => {
                const token = canvas.tokens.get(id);
                if (!token) return;
                token.hover = true;
                token.refresh();
            });
            elem.addEventListener('mouseout', () => {
                const token = canvas.tokens.get(id);
                if (!token) return;
                token.hover = false;
                token.refresh();
            });
        }
        for (const id of this.#queuedOpenSections) {
            const collapsible = this.element.querySelector('#' + id);
            if (!collapsible) continue;
            this.#openCollapsible(collapsible);
        }
        this.#queuedOpenSections.clear();
        this.element.querySelectorAll('[data-reference-tooltip]').forEach(el => this.#applyTooltip(el));
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        if (!this.#context) this.#formatInputs();
        return {...context, ...this.#context, title: this.windowTitle};
    }

    static #onCancel() {
        this.close();
    }

    static async #onConfirm(e, t) {
        await this.mergeResults(t.name);
    }

    static async #formHandler(event, form, formData) {
        const results = foundry.utils.expandObject(formData.object);
        this.#context?.inputs?.forEach(inp => inp.options?.forEach(o => {
            if (o.locked && o.isChecked && !(o.name in results)) results[o.name] = true;
        }));
        this.#resolveResults(results);
    }

    async mergeResults(name) {
        if (name === 'false') {
            this.submit({buttons: false});
            return false;
        }
        const results = await this._awaitResults();
        results.buttons = (name === 'true') ? true : name;
        this.submit(results);
    }

    static #toggleCollapsed(_event, target) {
        const collapsible = target.closest('.t5e-form-group');
        if (!collapsible) return;
        collapsible.classList.toggle('collapsed');
        this.#expandedSections.set(
            target.closest('[data-collapsible-id]')?.dataset.collapsibleId,
            !collapsible.classList.contains('collapsed')
        );
    }

    // dnd5e fills the tooltip on hover via this placeholder.
    #applyTooltip(element) {
        if ('tooltip' in element.dataset) return;
        const uuid = element.dataset.referenceTooltip;
        element.dataset.tooltip = `<section class="loading" data-uuid="${uuid}"><i class="fas fa-spinner fa-spin-pulse"></i></section>`;
        if (element.dataset.attribution) element.dataset.tooltipClass = 'property-attribution';
    }

    #queueOpenCollapsible(target) {
        const id = target.closest('[data-collapsible-id]')?.dataset.collapsibleId;
        if (!id) return;
        this.#queuedOpenSections.add(id);
    }

    #openCollapsible(target) {
        const collapsible = target.closest('.t5e-form-group');
        if (!collapsible) return;
        collapsible.classList.remove('collapsed');
        this.#expandedSections.set(collapsible.dataset.collapsibleId, true);
    }

    static #ID_REGEX = new RegExp(`${DialogApp.GROUP_ID}(\\d+)${DialogApp.INPUT_ID}(\\d+)`);
    static #makeID(groupIndex, inputIndex, {parentIndex = '', header = false} = {}) {
        if (parentIndex) parentIndex += DialogApp.SUBINPUT_SEPARATOR;
        const group = header ? DialogApp.HEADER_ID : DialogApp.GROUP_ID;
        return parentIndex + group + groupIndex + DialogApp.INPUT_ID + inputIndex;
    }

    // Convert each declarative input tuple into template-ready entry.
    #formatInputs() {
        const context = {content: this.content, inputs: [], subheaders: [], buttons: []};
        const {inputs, subheaders} = this.#buildInputs(this.inputs) ?? {};
        if (inputs) context.inputs = inputs;
        context.buttons.push(DialogApp.#makeButton('Confirm', 'true'), DialogApp.#makeButton('Cancel', 'false'));
        context.inputTemplate = INPUTS_TEMPLATE;
        this.#context = context;
    }

    #buildInputs(inputs, parentIndex = '') {
        if (!inputs?.length) return;
        const built = [], subheaders = [];
        for (let i = 0; i < inputs.length; i++) {
            const [inputType, inputFields, inputOptions] = inputs[i];
            const index = inputOptions?.header ? subheaders.length : built.length;
            const entry = this.#buildInput(inputType, inputFields, inputOptions, index, parentIndex);
            if (entry) {
                if (entry.header) subheaders.push(entry);
                else built.push(entry);
            }
        }
        return {inputs: built, subheaders};
    }

    #buildInput(type, ...args) {
        switch (type) {
            case 'text': return this.#buildText(...args);
            case 'dice': return this.#buildDice(...args);
            case 'radio': return this.#buildRadio(...args);
            case 'button': return this.#buildButton(...args);
            case 'number': return this.#buildNumber(...args);
            case 'slider': return this.#buildSlider(...args);
            case 'formula': return this.#buildFormula(...args);
            //case 'request': return this.#buildRequest(...args);
            case 'checkbox': return this.#buildCheckbox(...args);
            case 'combobox': return this.#buildCombobox(...args);
            case 'filePicker': return this.#buildFilePicker(...args);
            case 'selectMany': return this.#buildSelectMany(...args);
            case 'selectOption': return this.#buildSelectOption(...args);
            case 'selectAmount': return this.#buildSelectAmount(...args);
            case 'comboboxMulti': return this.#buildComboboxMulti(...args);
        }
    }

    static #makeButton(label, name) {
        return {type: 'submit', action: 'confirm', label, name};
    }

    static #makeRange(firstNum, lastNum) {
        const arr = [];
        for (let i = firstNum; i <= lastNum; i++) arr.push(i);
        return arr;
    }

    #buildSlider(fields, opts, index, parentIndex) {
        return {
            isSlider: true,
            options: fields.map((f, i) => ({
                name: f.name,
                label: f.label,
                hints: f.hints?.map(h => ({
                    label: h.label,
                    icon: h.icon,
                    tooltip: h.tooltip,
                    id: h.id
                })),
                value: f.value,
                min: f.options?.min,
                max: f.options?.max,
                step: f.options?.step,
                image: f.options?.image,
                tooltip: f.options?.tooltip,
                reference: f.options?.reference,
                invertColor: f.options?.invertColor,
                onchange: f.options?.onchange,
                id: DialogApp.#makeID(index, i, {parentIndex, header: opts?.header}),
                subinputs: this.#buildInputs(f.options?.subinputs, DialogApp.#makeID(index, i, {parentIndex, header: opts?.header}))?.inputs
            })),
            hasSubinputs: fields.some(f => f.options?.subinputs?.length),
            header: opts?.header,
            legend: opts?.legend
        };
    }

    #buildDice(fields, opts, _index, _parentIndex) {
        const groups = new Map();
        for (const f of fields) {
            const key = f.typeLabel ?? '';
            if (!groups.has(key)) groups.set(key, {label: key, icon: f.typeIcon, total: 0, dice: []});
            const g = groups.get(key);
            g.total += f.result;
            g.dice.push({
                name: f.name,
                faces: f.faces,
                result: f.result,
                isStandard: STANDARD_FACES.has(f.faces),
                isMin: f.result === 1,
                isMax: f.result === f.faces
            });
        }
        const grandTotal = fields.reduce((acc, f) => acc + f.result, 0);
        return {
            isDice: true,
            totalMax: opts?.totalMax ?? 99,
            showCounter: opts?.totalMax != null,
            currentNum: 0,
            grandTotal,
            groups: Array.from(groups.values()),
            options: fields.map((f, i) => ({name: f.name, isChecked: false})),
            legend: opts?.legend
        };
    }

    #buildFormula(fields, opts, index, parentIndex) {
        const groups = fields.map((f, i) => {
            const dice = [];
            for(let j = 0; j < f.terms.length; j++) {
                const t = f.terms[j];
                if (t instanceof foundry.dice.terms.OperatorTerm) continue;
                const add = j === 0 || f.terms[j - 1]?.operator === '+';
                if (t.faces) {
                    const source = t.options.source || t.denomination;
                    const results = t.results?.filter(r => r.active) ?? [];
                    const dieClass = STANDARD_FACES.has(t.faces) ? 'd' + t.faces : 't5e-die-generic';
                    for (let k = 0; k < t.number; k++) {
                        const value = results[k]?.result;
                        dice.push({
                            tooltip: value === undefined ? source : `${source} - ${value}`,
                            dieClass,
                            value,
                            add
                        });
                    }
                } else dice.push({
                    tooltip: t.options.source || t.formula,
                    dieClass: 't5e-die-generic',
                    value: t.formula,
                    add
                });
            }
            const type = f.options?.type;
            const cfg = CONFIG.DND5E.damageTypes[type] ?? CONFIG.DND5E.healingTypes[type];
            return {
                id: DialogApp.#makeID(index, i, {parentIndex, header: opts?.header}),
                crit: f.options?.isCritical,
                formula: f._formula,
                total: opts?.total,
                outcome: opts?.outcome,
                muted: opts?.muted,
                label: cfg?.label,
                icon: cfg?.icon,
                dice
            };
        });
        return {
            isFormula: true,
            groups,
            header: opts?.header,
            legend: opts?.legend,
            parseNewFormula: rolls => this.#buildFormula(rolls, opts, index, parentIndex)
        };
    }

    #buildButton(fields, opts, index, parentIndex) {
        return {
            isButton: true,
            displayAsRows: opts?.displayAsRows ?? false,
            options: fields.map((f, i) => ({
                label: f.label,
                name: f.name,
                image: f.options?.image,
                invertColor: f.options?.invertColor,
                tooltip: f.options?.tooltip,
                reference: f.options?.reference,
                id: DialogApp.#makeID(index, i, {parentIndex, header: opts?.header})
            })),
            header: opts?.header,
            legend: opts?.legend
        };
    }

    #buildCheckbox(fields, opts, index, parentIndex) {
        // Single checkbox with no totalMax / image → helper route (BooleanField).
        if (fields.length === 1 && opts?.totalMax == null && !fields[0].options?.image) {
            const f = fields[0];
            return {
                useHelper: true,
                options: [{
                    field: new BooleanField({label: f.label}),
                    name: f.name,
                    value: f.options?.isChecked ?? false,
                    onchange: f.options?.onchange,
                    id: DialogApp.#makeID(index, 0, {parentIndex})
                }]
            };
        }
        const options = fields.map((f, i) => ({
            label: f.label,
            name: f.name,
            isChecked: f.options?.isChecked ?? false,
            image: f.options?.image,
            tooltip: f.options?.tooltip,
            reference: f.options?.reference,
            invertColor: f.options?.invertColor,
            hints: f.hints?.map(h => ({
                label: h.label,
                icon: h.icon,
                tooltip: h.tooltip,
                id: h.id
            })),
            subinputs: this.#buildInputs(f.options?.subinputs, DialogApp.#makeID(index, i, {parentIndex, header: opts?.header}))?.inputs,
            locked: f.options?.locked ?? false,
            onchange: f.options?.onchange,
            tags: f.options?.tags?.map(t => ({
                tooltip: t.tooltip,
                label: t.label,
                image: t.image,
                icon: t.icon,
                id: t.id
            })),
            id: DialogApp.#makeID(index, i, {parentIndex, header: opts?.header})
        }));
        return {
            isCheckbox: true,
            options,
            totalMax: opts?.totalMax ?? 99,
            showCounter: opts?.totalMax != null,
            currentNum: options.filter(i => i.isChecked).length,
            hasSubinputs: options.some(i => i.subinputs?.length),
            header: opts?.header,
            legend: opts?.legend
        };
    }

    #buildRadio(fields, opts, index, parentIndex) {
        return {
            isRadio: true,
            options: fields.map((f, i) => ({
                label: f.label,
                hints: f.hints?.map(h => ({
                    label: h.label,
                    icon: h.icon,
                    tooltip: h.tooltip,
                    id: h.id
                })),
                name: f.name,
                isChecked: f.options?.isChecked ?? false,
                image: f.options?.image,
                tooltip: f.options?.tooltip,
                reference: f.options?.reference,
                invertColor: f.options?.invertColor,
                subinputs: this.#buildInputs(f.options?.subinputs, DialogApp.#makeID(index, i, {parentIndex, header: opts?.header}))?.inputs,
                onchange: f.options?.onchange,
                tags: f.options?.tags?.map(t => ({
                    tooltip: t.tooltip,
                    label: t.label,
                    image: t.image,
                    icon: t.icon,
                    id: t.id
                })),
                id: DialogApp.#makeID(index, i, {parentIndex, header: opts?.header})
            })),
            hasSubinputs: fields.some(f => f.options?.subinputs?.length),
            radioName: opts?.radioName ?? 'radio',
            header: opts?.header,
            legend: opts?.legend
        };
    }

    #buildSelectAmount(fields, opts, index, parentIndex) {
        const options = fields.map((f, i) => {
            const min = f.options?.minAmount ?? 0;
            const max = f.options?.maxAmount ?? 10;
            const id = DialogApp.#makeID(index, i, {parentIndex, header: opts?.header});
            return {
                id,
                label: f.label,
                hints: f.hints?.map(h => ({
                    label: h.label,
                    icon: h.icon,
                    tooltip: h.tooltip,
                    id: h.id
                })),
                name: f.name,
                minAmount: min,
                maxAmount: max,
                currentAmount: f.options?.currentAmount ?? 0,
                weight: f.options?.weight ?? 1,
                options: DialogApp.#makeRange(min, max),
                image: f.options?.image,
                tooltip: f.options?.tooltip,
                reference: f.options?.reference,
                invertColor: f.options?.invertColor,
                subinputs: this.#buildInputs(f.options?.subinputs, id)?.inputs,
                tags: f.options?.tags?.map(t => ({
                    tooltip: t.tooltip,
                    label: t.label,
                    image: t.image,
                    icon: t.icon,
                    id: t.id
                })),
                onchange: f.options?.onchange
            };
        });
        return this.#currentMaxAmounts({
            hasSubinputs: options.some(o => o.subinputs?.length),
            isSelectAmount: true,
            totalMax: opts?.totalMax,
            options,
            header: opts?.header,
            legend: opts?.legend
        });
    }

    #buildSelectMany(fields, opts, index, parentIndex) {
        return {
            useHelper: true,
            options: fields.map((f, i) => {
                const choices = (f.options?.options ?? []).reduce((acc, i) => {
                    acc[i.value] = i.label;
                    return acc;
                }, {});
                return {
                    field: new SetField(new StringField({choices}), {label: f.label, hint: f.hint}),
                    name: f.name,
                    value: f.options?.value ?? [],
                    id: DialogApp.#makeID(index, i, {parentIndex, header: opts?.header}),
                    onchange: f.options?.onchange
                };
            }),
            header: opts?.header,
            legend: opts?.legend
        };
    }

    #buildSelectOption(fields, opts, index, parentIndex) {
        return {
            useHelper: true,
            options: fields.map((f, idx) => {
                const choices = (f.options?.options ?? []).reduce((acc, i) => {
                    if (typeof i === 'string') acc[i] = i;
                    else acc[i.value] = i.label;
                    return acc;
                }, {});
                return {
                    field: new StringField({label: f.label, hint: f.hint, choices, required: true, blank: false}),
                    name: f.name,
                    value: f.options?.currentValue ?? '',
                    onchange: f.options?.onchange,
                    id: DialogApp.#makeID(index, idx, {parentIndex, header: opts?.header})
                };
            }),
            header: opts?.header,
            legend: opts?.legend
        };
    }

    #buildCombobox(fields, opts, index, parentIndex) {
        return {
            isCombobox: true,
            options: fields.map((f, i) => ({
                label: f.label,
                hints: f.hints?.map(h => ({
                    label: h.label,
                    icon: h.icon,
                    tooltip: h.tooltip,
                    id: h.id
                })),
                name: f.name,
                tooltip: f.options?.tooltip,
                reference: f.options?.reference,
                value: f.options?.value ?? '',
                placeholder: f.options?.placeholder ?? '',
                options: (f.options?.options ?? []).map(o => ({
                    value: o.value,
                    label: o.label,
                    image: o.image ?? '',
                    tag: o.tag ?? ''
                })),
                subinputs: this.#buildInputs(f.options?.subinputs, DialogApp.#makeID(index, i, {parentIndex, header: opts?.header}))?.inputs,
                id: DialogApp.#makeID(index, i, {parentIndex, header: opts?.header}),
                onchange: f.options?.onchange
            })),
            hasSubinputs: fields.some(f => f.options?.subinputs?.length),
            header: opts?.header,
            legend: opts?.legend
        };
    }

    #buildComboboxMulti(fields, opts, index, parentIndex) {
        return {
            isComboboxMulti: true,
            options: fields.map((f, i) => ({
                label: f.label,
                hints: f.hints?.map(h => ({
                    label: h.label,
                    icon: h.icon,
                    tooltip: h.tooltip,
                    id: h.id
                })),
                name: f.name,
                tooltip: f.options?.tooltip,
                reference: f.options?.reference,
                placeholder: f.options?.placeholder ?? '',
                amounts: !!f.options?.amounts,
                maxTotal: f.options?.maxTotal ?? null,
                options: (f.options?.options ?? []).map(o => ({
                    value: o.value,
                    label: o.label,
                    image: o.image ?? '',
                    tag: o.tag ?? '',
                    weight: o.weight ?? 1,
                    max: o.max ?? null,
                    selected: o.selected,
                    amount: o.amount
                })),
                subinputs: this.#buildInputs(f.options?.subinputs, DialogApp.#makeID(index, i, {parentIndex, header: opts?.header}))?.inputs,
                id: DialogApp.#makeID(index, i, {parentIndex, header: opts?.header}),
                onchange: f.options?.onchange
            })),
            hasSubinputs: fields.some(f => f.options?.subinputs?.length),
            header: opts?.header,
            legend: opts?.legend
        };
    }

    #buildText(fields, opts, _index, _parentIndex) {
        return {
            useHelper: true,
            options: fields.map(f => ({
                field: new StringField({label: f.label, hint: f.hint}),
                name: f.name,
                value: f.options?.currentValue ?? '',
                onchange: f.options?.onchange
            })),
            header: opts?.header,
            legend: opts?.legend
        };
    }

    #buildNumber(fields, opts, _index, _parentIndex) {
        return {
            useHelper: true,
            options: fields.map(f => ({
                field: new NumberField({label: f.label, hint: f.hint}),
                name: f.name,
                value: f.options?.currentValue ?? 0,
                onchange: f.options?.onchange
            })),
            header: opts?.header,
            legend: opts?.legend
        };
    }

    #buildFilePicker(fields, opts, _index, _parentIndex) {
        return {
            useHelper: true,
            options: fields.map(f => {
                const type = (f.options?.type ?? 'image').toUpperCase();
                const categories = type === 'ANY' ? CONST.MEDIA_FILE_CATEGORIES
                    : type === 'IMAGEVIDEO' ? ['IMAGE', 'VIDEO']
                        : type in CONST.FILE_CATEGORIES ? [type] : ['IMAGE'];
                return {
                    field: new FilePathField({label: f.label, categories, hint: f.hint}),
                    name: f.name,
                    value: f.options?.currentValue ?? '',
                    onchange: f.options?.onchange
                };
            }),
            header: opts?.header,
            legend: opts?.legend
        };
    }

    // Cap each option's max so combined weighted amounts stay under totalMax.
    #currentMaxAmounts(input) {
        const clone = foundry.utils.deepClone(input);
        let max = clone.totalMax;
        clone.options.forEach(o => max -= o.currentAmount * o.weight);
        for (const i of clone.options) {
            i.currentMaxAmount = Math.floor((max + (i.currentAmount * i.weight)) / i.weight);
        }
        clone.currentSpent = (clone.totalMax ?? 0) - max;
        clone.atMax = clone.totalMax != null && clone.currentSpent >= clone.totalMax;
        return clone;
    }

    #getContextByID(id) {
        const groups = id?.split(DialogApp.SUBINPUT_SEPARATOR);
        if (!groups?.length) return;
        let ctx = this.#context;
        let group, input;
        for (let i = 0; i < groups.length; i++) {
            const idx = groups[i].match(DialogApp.#ID_REGEX);
            if (!idx) return;
            group = parseInt(idx[1]);
            input = parseInt(idx[2]);
            if (groups.length > 1 && i !== groups.length - 1)
                ctx = {inputs: ctx.inputs[group].options[input].subinputs};
        }
        return {
            fullContext: this.#context,
            thisContext: ctx,
            groupIndex: group,
            inputIndex: input,
            group: ctx.inputs[group],
            input: ctx.inputs[group].options[input],
            getInputById: (id) => this.#getContextByID(id).input
        };
    }

    async _onChangeForm(formConfig, event) {
        super._onChangeForm(formConfig, event);
        const targetInput = event.target;
        const dicePicker = targetInput.closest?.('.t5e-dice-picker');
        if (dicePicker && targetInput.type === 'checkbox') {
            const totalMax = Number(dicePicker.dataset.totalMax);
            if (!totalMax) return;
            const checked = dicePicker.querySelectorAll('input[type=checkbox]:checked').length;
            if (checked > totalMax) {
                targetInput.checked = false;
                return;
            }
            const counter = this.element?.querySelector('.t5e-budget-counter');
            if (counter) {
                counter.textContent = `${checked}/${totalMax}`;
                counter.classList.toggle('at-max', checked >= totalMax);
            }
            return;
        }
        const ctx = this.#getContextByID(targetInput.id);
        if (!ctx) return;
        let changed = false;
        switch (targetInput.type || targetInput.localName) {
            case 'checkbox':
                ctx.input.isChecked = targetInput.checked;
                ctx.group.currentNum = ctx.group.options.reduce((acc, c) => acc += c.isChecked, 0);
                if (ctx.group.showCounter) changed = true;
                break;
            case 'select-one':
                if (ctx.group.isSelectAmount) {
                    ctx.input.currentAmount = Number(targetInput.value);
                    if (ctx.input?.weight) ctx.fullContext.inputs[ctx.groupIndex] = this.#currentMaxAmounts(ctx.group);
                    changed = true;
                } else ctx.input.value = targetInput.value;
                break;
            case 'radio':
                ctx.group.options.forEach(o => o.isChecked = false);
                ctx.input.isChecked = targetInput.checked;
                changed = true;
                break;
            case 'range-picker':
                ctx.input.value = targetInput.value;
                break;
            case 't5e-combobox':
                ctx.input.value = targetInput.value;
                break;
            case 't5e-multi-combobox': {
                const selected = targetInput.selected;
                for (const option of ctx.input.options) {
                    option.selected = selected.has(option.value);
                    option.amount = selected.get(option.value);
                }
                break;
            }
        }
        if (ctx.input.onchange) changed ||= ctx.input.onchange(ctx);
        if (ctx.group.hasSubinputs && ctx.input.isChecked) {
            if (!changed) this.#openCollapsible(targetInput);
            else this.#queueOpenCollapsible(targetInput);
        }

        if (changed) this.render(true);
    }

    bringToFront() {
        DialogUtils.bringToFront(this);
    }

    async submit(button) {
        try {
            if (button.callback) {
                this.data.completed = true;
                await button.callback(this, button);
                this.close();
            }
        } catch (err) {
            this.data.completed = false;
            this.close();
        }
    }

    close(options = {}) {
        Hooks.off("targetToken", this.hookId);
        this.doCallback(false);
        return super.close(options);
    }

    doCallback(value = false) {
        try {
            if (this.callback)
                this.callback(value);
        } catch (err) {
            console.error(err);
        }
    }

    _onClickButton(event) {
        const oneUse = true;
        const id = event.currentTarget.dataset.button;
        const button = this.data.buttons[id];
        this.submit(button);
    }

    _onKeyDown(event) {
        // Close dialog
        if (event.key === "Escape" || event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            this.close();
        }
    }
}
