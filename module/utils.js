export function playerFor(target) {
    //@ts-expect-error
    return playerForActor(target.document?.actor ?? target.actor ?? undefined); // just here for syntax checker
}
export function playerForActor(actor) {
    if (!actor)
        return undefined;
    let user;
    //@ts-ignore DOCUMENT_PERMISSION_LEVELS.OWNER v10
    const OWNERSHIP_LEVELS = CONST.DOCUMENT_PERMISSION_LEVELS;
    //@ts-ignore ownership v10
    const ownwership = actor.ownership;
    // find an active user whose character is the actor
    if (actor.hasPlayerOwner)
        user = game.users?.find(u => u.character?.id === actor?.id && u.active);
    if (!user) // no controller - find the first owner who is active
        user = game.users?.players.find(p => p.active && ownwership[p.id ?? ""] === OWNERSHIP_LEVELS.OWNER);
    if (!user) // find a non-active owner
        user = game.users?.players.find(p => p.character?.id === actor?.id);
    if (!user) // no controlled - find an owner that is not active
        user = game.users?.players.find(p => ownwership[p.id ?? ""] === OWNERSHIP_LEVELS.OWNER);
    if (!user && ownwership.default === OWNERSHIP_LEVELS.OWNER) {
        // does anyone have default owner permission who is active
        user = game.users?.players.find(p => p.active && ownwership[p.id] === OWNERSHIP_LEVELS.INHERIT);
    }
    // if all else fails it's an active gm.
    if (!user)
        user = game.users?.find(p => p.isGM && p.active);
    return user;
}

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
                await game.dfreds?.effectInterface?.removeEffect({effectName: 'Prone', uuid: this.data.actorUuid});
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
