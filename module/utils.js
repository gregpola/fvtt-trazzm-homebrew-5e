// TODO add doTurnEndOptions, especially for handling legendary actions
var ApplicationV2 = foundry.applications.api.ApplicationV2;
const {HandlebarsApplicationMixin} = foundry.applications.api;
let legendaryReminderDialog = null;

export async function doTurnStartOptions(actorUuid, options = {}) {
    const name = options.combatant.name;
    if (name && (name.trim().length > 0)) {
        await turnStartDialog(actorUuid, options);
    }
}

export async function turnStartDialog(actorUuid, options = {}) {
    const dialog = new TurnStartDialog({
        title: options.combatant.name + ' ' + 'Turn Start',
        actorUuid: actorUuid,
        actor: options.combatant.actor,
        hp: options.hp,
        prone: options.prone,
        dead: options.dead,
        unconscious: options.unconscious,
        incapacitated: options.incapacitated,
        paralyzed: options.paralyzed,
        petrified: options.petrified,
        stunned: options.stunned
    }, {
    });
    dialog.render(true);
}

export async function doUpdateTemplate(templateUuid, updates = {}) {
    let template = await fromUuid(templateUuid);
    if (template) {
        await template.update(updates);
    }
}

export async function drawAmbientLight(lightTemplate) {
    await canvas.scene.createEmbeddedDocuments("AmbientLight", [lightTemplate]);
}

export async function removeAmbientLight(name, actor) {
    const ambientLights = canvas.lighting.placeables.filter((w) => w.document.flags?.spellEffects?.[name]?.ActorId === actor.uuid);
    const lightArray = ambientLights.map((w) => w.id);

    if (lightArray.length > 0) {
        await canvas.scene.deleteEmbeddedDocuments("AmbientLight", lightArray);
    }
}

export async function drawWalls(wallData) {
    await canvas.scene.createEmbeddedDocuments("Wall", wallData);
}

export async function removeWalls(name, actor) {
    const walls = canvas.scene.walls.filter(w => w.flags?.spellEffects?.[name]?.ActorId === actor.uuid);
    if (walls) {
        let wallArray = walls.map(function (w) {
            return w._id;
        })

        if (wallArray.length > 0) {
            await canvas.scene.deleteEmbeddedDocuments("Wall", wallArray);
        }
    }
}

/**
 * A dialog to show options at the start of a combatants turn.
 *
 * The data associated with dialog is:
 *      content     - the dialog data content
 *      buttons     - the dialog buttons
 *      combatant   - the combatant whose turn it is
 *      prone       - flag indicating the combatant is prone
 *      hp          - the combatants current hp's
 *
 */
class TurnStartDialog extends HandlebarsApplicationMixin(ApplicationV2) {
    callback;
    data;
    hookId;

    constructor(data, options = {}) {
        options.height = "auto";
        options.resizable = true;
        super(options);
        this.data = data;
        return this;
    }

    static PARTS = {
        dialog: {
            id: "trazzm-homebrew-turn-start-dialog",
            classes: ["dialog"],
            template: "modules/fvtt-trazzm-homebrew-5e/templates/dialog.hbs"
        }
    };

    static DEFAULT_OPTIONS = {
        window: {
            resizable: true
        },
        position: {
            width: 500,
            height: "auto"
        },
        resizable: true,
        actions: {
            cancel: this.#onCancel
        }
    };

    get title() {
        return this.data.title || "Turn Start";
    }

    async _onRender(context, options) {
        await super._onRender(context, options);
        for (const button of Array.from(this.element.querySelectorAll(".dialog-button"))) {
            button.addEventListener("click", this._onClickButton.bind(this));
        }

        $(document).on('keydown.chooseDefault', this._onKeyDown.bind(this));
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        this.data.content = "<p>You are currently prone, would you like to stand up?<br>" +
            "<sub>(standing up costs an amount of movement equal to half your speed)</sub></p>" +
            "<div style='height: 25px;'/>";

        this.data.buttons = {
            standUp: {
                label: "Stand Up", callback: async (html) => {
                    const actor = await fromUuid(this.data.actorUuid);
                    const effectIDs = actor.getRollData().effects.filter(e => e.name.toLowerCase() === 'prone').map(e => e.id);
                    await MidiQOL.socket().executeAsGM('removeEffects', {
                        'actorUuid': actor.uuid,
                        'effects': effectIDs
                    });

                    await actor.toggleStatusEffect('prone', {active: false});
                }
            },
            close: {
                label: "Close", callback: (html) => {
                    this.close();
                }
            }
        };
        this.data.default = "close";

        return {
            ...context,
            content: this.data.content,
            buttons: this.data.buttons
        };
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

    static #onCancel() {
        this.close();
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

export async function doLegendaryAction(legendaryData = []) {
    await legendaryActionDialog(legendaryData);
}

export async function legendaryActionDialog(legendaryData = []) {
    if (legendaryReminderDialog) {
        legendaryReminderDialog.close();
    }

    legendaryReminderDialog = new LegendaryActionDialog({
        title: 'Legendary Action Reminder',
        legendaryData: legendaryData
    }, {
    });
    legendaryReminderDialog.render(true);
}

/**
 * A dialog to show Legendary Action options after the end of a turn
 *
 * The data associated with dialog is:
 *      content      - the dialog data content
 *      buttons      - the dialog buttons
 *      combatant    - the combatant whose turn it is
 *      actionPoints - how many remaining legendary action points
 *      actions      - the eligible legendary actions this turn
 *
 */
class LegendaryActionDialog extends HandlebarsApplicationMixin(ApplicationV2) {
    callback;
    data;
    hookId;

    constructor(data, options = {}) {
        options.height = "auto";
        options.resizable = true;
        super(options);
        this.data = data;
        return this;
    }

    get title() {
        return this.data.title || "Legendary Action";
    }

    static PARTS = {
        dialog: {
            id: "trazzm-homebrew-legendary-action-dialog",
            classes: ["dialog"],
            template: "modules/fvtt-trazzm-homebrew-5e/templates/dialog.hbs"
        }
    };

    static DEFAULT_OPTIONS = {
        window: {
            resizable: true
        },
        position: {
            width: 600,
            height: "auto"
            //top: 200
        },
        resizable: true,
        actions: {
            cancel: this.#onCancel
        }
    };

    async _onRender(context, options) {
        await super._onRender(context, options);
        for (const button of Array.from(this.element.querySelectorAll(".dialog-button"))) {
            button.addEventListener("click", this._onClickButton.bind(this));
        }

        $(document).on('keydown.chooseDefault', this._onKeyDown.bind(this));
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        // build the content
        let content = '';
        for (let actorData of this.data.legendaryData) {
            let actionsData = '';
            for (let actorAction of actorData.actions) {
                // for now this only handles a single activity per item
                let activity = actorAction.system.activities.find(k => {
                    return (k?.consumption?.targets[0]?.target === 'resources.legact.value' || k?.activation.type === 'legendary') &&
                        actorData.actionPoints >= k.activation?.value;
                });
                actionsData += `<option value="${activity}">${actorAction.name} [${activity.activation?.value}]</option>`;
            }

            content += `<tr>
                <td style="width: 15%"><img src="${actorData.combatant.token.texture.src}" width="50" height="50"></td>
                <td style="width: 35%">${actorData.combatant.name}</td>
                <td style="width: 15%">[${actorData.actionPoints} AP]</td>
                <td style="width: 35%"><select id="${actorData.combatant}">${actionsData}</select></td>
            </tr>`;
        }

        this.data.content = `
			<div class="form-group">
			  <p>Each of the following actors have Legendary Actions they can take this turn:</p>
			  <br />
			    <table style="width:100%"><tbody>${content}</tbody></table>
			  <br />
			</div>`;

        this.data.buttons = {
            // use: {
            //     label: "Use",
            //     callback: async (html) => {
            //         const selector = document.querySelector("[name=action-choice]");
            //         const selectedIndex = selector.selectedIndex;
            //         const selectedAction = html.data.actions[selectedIndex];
            //         console.log(selectedAction);
            //     }},
            close: {
                label: "OK", callback: (html) => {
                    this.close();
                }
            }
        };
        this.data.default = "close";


        return {
            ...context,
            content: this.data.content,
            buttons: this.data.buttons
        };
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

    static #onCancel() {
        this.close();
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
