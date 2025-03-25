/*
    At the start of your first turn of each combat, your walking speed increases by 10 feet, which lasts until the end
    of that turn. If you take the Attack action on that turn, you can make one additional weapon attack as part of that
    action. If that attack hits, the target takes an extra 1d8 damage of the weapon’s damage type.
*/
const version = "11.0";
const optionName = "Dread Ambusher - Extra Attack";

let validWeapons = actor.items.filter(item => {
    return (["mwak", "rwak"].includes(item.system.actionType) && item.system.equipped === true);
});

if (!validWeapons.length) {
    console.error(`${optionName} - has no weapon equipped`);
    return;
}

// Give the player the option of attacking
let optionData = validWeapons.map(item => `<option value="${item.uuid}">${item.name}</option>`).join("");
let dialogContent = `
            <div style='display: flex; align-items: center; justify-content: space-between;'>
                <div style='flex: 1;'>
                    <p>Choose your Weapon: <select id='item-select'>${optionData}</select></p>
                </div>
                <div style='border-left: 1px solid #ccc; padding-left: 10px; text-align: center;'>
                    <p><b>Time remaining</b></p>
                    <p><span id='countdown' style='font-size: 16px; color: red;'>30</span> seconds</p>
                </div>
            </div>`;

// Assign player actor for socket, default to GM if no player active for the actor
let browserUser = MidiQOL.playerForActor(actor);
if (!browserUser?.active) {
    console.info(`${optionName} - unable to locate the actor player, sending to GM`);
    browserUser = game.users?.activeGM;
}

let selectedItemUuid = undefined;
let dialog = new Promise((resolve, reject) => {
    new Dialog({
        // localize this text
        title: `${optionName}`,
        content: `${dialogContent}`,
        buttons: {
            ok: {
                icon: '<i class="fas fa-check"></i>',
                label: "OK",
                callback: async (html) => {
                    selectedItemUuid = html.find("#item-select").val();
                    resolve(true);
                }
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel",
                callback: () => {resolve(false)}
            }
        },
        default: "ok"
    }).render(true)
});

let useFeature = await dialog;
if (useFeature) {
    if (!selectedItemUuid) {
        console.log("No weapon selected");
        return;
    }

    // add damage bonus effect
    const effectData = {
        "name": `${optionName} (force damage)`,
        "icon": "icons/magic/light/swords-light-glowing-white.webp",
        "changes":[
            { "key": "system.bonuses.mwak.damage", "mode": CONST.ACTIVE_EFFECT_MODES.ADD, "value": `1d8[force]`, "priority": "20" },
            { "key": "system.bonuses.rwak.damage", "mode": CONST.ACTIVE_EFFECT_MODES.ADD, "value": "1d8[force]", "priority": "21" }
        ],
        "flags": {
            "dae": { "specialDuration": [ "1Attack" ] }
        }
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });


    let chosenWeapon = await fromUuid(selectedItemUuid);
    chosenWeapon.prepareData();
    chosenWeapon.prepareFinalAttributes();

    const target = workflow.targets.first();
    const options = {
        showFullCard: false,
        createWorkflow: true,
        versatile: false,
        configureDialog: false,
        targetUuids: [`${target.document.uuid}`],
        workflowOptions: {
            autoRollDamage: 'onHit',
            autoFastDamage: true
        }
    };

    await MidiQOL.completeItemUse(chosenWeapon, {}, options);
}

