// TODO add doTurnEndOptions, especially for handling legendary actions

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
        width: 500
    }).render(true);
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
class TurnStartDialog extends Application {

    static DEFAULT_ID = 'trazzms-homebrew-turn-start-dialog';
    static _lastPosition = new Map();

    constructor(data, options) {
        options.height = "auto";
        options.resizable = true;
        super(options);
        this.data = data;
        mergeObject(this.position, TurnStartDialog._lastPosition.get(this.options.id) ?? {});
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/fvtt-trazzm-homebrew-5e/templates/dialog.html",
            classes: ["dialog"],
            width: 500,
            jQuery: true,
            close: close
        }, { overwrite: true });
    }

    get title() {
        return this.data.title || "Turn Start";
    }

    async getData(options) {
        // TODO make the content conditional i.e. if (this.data.prone) {
        this.data.content = "<p>You are currently prone, would you like to stand up?<br>" +
            "<sub>(standing up costs an amount of movement equal to half your speed)</sub></p>" +
            "<div style='height: 25px;'/>";

        this.data.buttons = {
            standUp: { label: "Stand Up", callback: async (html) => {
                const actor = await fromUuid(this.data.actorUuid);
                const effectIDs = actor.getRollData().effects.filter(e => e.name.toLowerCase() === 'prone' ).map(e=>e.id);
                await MidiQOL.socket().executeAsGM('removeEffects', {'actorUuid': actor.uuid, 'effects': effectIDs});
            }},
            close: { label: "Close", callback: (html) => {
                TurnStartDialog.storePosition(html);
            }}
        };
        this.data.default = "close";

        return {
            content: this.data.content,
            buttons: this.data.buttons
        };
    }

    static storePosition(html) {
        const id = html.id;
        const position = html.position;
        TurnStartDialog._lastPosition.set(id, {top: position.top, left: position.left});
    }

    activateListeners(html) {
        html.find(".dialog-button").click(this._onClickButton.bind(this));
        $(document).on('keydown.chooseDefault', this._onKeyDown.bind(this));
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

    async submit(button) {
        try {
            if (button.callback) {
                await button.callback(this, button);
                // await this.getData({}); Render will do a get data, doing it twice breaks the button data?
                //this.render(true);
            }
            this.close();
        }
        catch (err) {
            ui.notifications?.error("fvtt-trazzm-homebrew-5e | Turn start dialog error see console for details ");
            console.error("fvtt-trazzm-homebrew-5e | ", err);
        }
    }

    async close() {
        if (this.data.close)
            this.data.close();
        $(document).off('keydown.chooseDefault');
        return super.close({force: true});
    }
}

export async function doLegendaryAction(legendaryData = []) {
    await legendaryActionDialog(legendaryData);
}

export async function legendaryActionDialog(legendaryData = []) {
    new LegendaryActionDialog({
        title: 'Legendary Action Reminder',
        legendaryData: legendaryData
    }, {
        width: 500
    }).render(true);
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
class LegendaryActionDialog extends Application {

    static DEFAULT_ID = 'trazzms-homebrew-legendary-action-dialog';
    static _lastPosition = new Map();

    constructor(data, options) {
        options.height = "auto";
        options.resizable = true;
        super(options);
        this.data = data;
        mergeObject(this.position, LegendaryActionDialog._lastPosition.get(this.options.id) ?? {});
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/fvtt-trazzm-homebrew-5e/templates/dialog.html",
            classes: ["dialog"],
            width: 500,
            jQuery: true,
            close: close
        }, { overwrite: true });
    }

    get title() {
        return this.data.title || "Legendary Action";
    }

    async getData(options) {
        // build the content
        let content = `
		  <form>
			<div class="flexcol">
		`;
        for (let actorData of this.data.legendaryData) {
            content += '<div class="flexcol">';
            content += `<div className="flexrow" style="margin-bottom: 10px;"><img src=${actorData.combatant.token.texture.src} width="50" height="50" /><label style="margin-left: 15px;">${actorData.combatant.name} [${actorData.actionPoints} legendary action points remaining]</label></div>`;
            for (let actorAction of actorData.actions) {
                content += `<div className="flexrow" style="margin-bottom: 5px;margin-left: 25px;"><img src=${actorAction.img} width="25" height="25" /><label style="margin-left: 15px;">${actorAction.name} [${actorAction.system.activation.cost} points]</label></div>`
            }
            content += '</div>';
        }
        content += '</div></form>';

        this.data.content = `
			<div class="form-group">
			  <p><label>All of the following actors have Legendary Actions they can take this turn:</label></p>
			  <br />
				${content}
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
            close: { label: "OK", callback: (html) => {
                    LegendaryActionDialog.storePosition(html);
                }}
        };
        this.data.default = "close";

        return {
            content: this.data.content,
            buttons: this.data.buttons
        };
    }

    static storePosition(html) {
        const id = html.id;
        const position = html.position;
        LegendaryActionDialog._lastPosition.set(id, {top: position.top, left: position.left});
    }

    activateListeners(html) {
        html.find(".dialog-button").click(this._onClickButton.bind(this));
        $(document).on('keydown.chooseDefault', this._onKeyDown.bind(this));
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

    async submit(button) {
        try {
            if (button.callback) {
                await button.callback(this, button);
            }
            this.close();
        }
        catch (err) {
            ui.notifications?.error("fvtt-trazzm-homebrew-5e | Legendary Action dialog error see console for details ");
            console.error("fvtt-trazzm-homebrew-5e | ", err);
        }
    }

    async close() {
        if (this.data.close)
            this.data.close();
        $(document).off('keydown.chooseDefault');
        return super.close({force: true});
    }
}
