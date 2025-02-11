/*
    You can mystically access a reservoir of experiences of entities connected to the Astral Plane. Whenever you finish
    a long rest, you gain proficiency in one skill of your choice and with one weapon or tool of your choice, selected
    from the Player’s Handbook, as you momentarily project your consciousness into the Astral Plane. These proficiencies
    last until the end of your next long rest.
*/
const version = "12.3.0";
const optionName = "Astral Knowledge";

const tools = {
    'alchemist': 'Alchemist\'s Supplies',
    'brewer': 'Brewer\'s Supplies',
    'calligrapher': 'Calligrapher\'s Supplies',
    'carpenter': 'Carpenter\'s Tools',
    'cartographer': 'Cartographer\'s Tools',
    'cobbler': 'Cobbler\'s Tools',
    'cook': 'Cook\'s Utensils',
    'glassblower': 'Glassblower\'s Tools',
    'jeweler': 'Jeweler\'s Tools',
    'leatherworker': 'Leatherworker\'s Tools',
    'mason': 'Mason\'s Tools',
    'painter': 'Painter\'s Supplies',
    'potter': 'Potter\'s Tools',
    'smith': 'Smith\'s Tools',
    'tinker': 'Tinker\'s Tools',
    'weaver': 'Weaver\'s Tools',
    'woodcarver': 'Woodcarver\'s Tools',
    'disg': 'Disguise Kit',
    'forg': 'Forgery Kit',
    'herb': 'Herbalism Kit',
    'navg': 'Navigator\'s Tools',
    'pois': 'Poisoner\'s Kit',
    'thief': 'Thieves\' Tools'
};

const weapons = {
    battleaxe: 'Battleaxe',
    blowgun: 'Blowgun',
    club: 'Club',
    dagger: 'Dagger',
    dart: 'Dart',
    flail: 'Flail',
    glaive: 'Glaive',
    greataxe: 'Greataxe',
    greatclub: 'Greatclub',
    greatsword: 'Greatsword',
    halberd: 'Halberd',
    handaxe: 'Handaxe',
    handcrossbow: 'Hand Crossbow',
    heavycrossbow: 'Heavy Crossbow',
    javelin: 'Javelin',
    lance: 'Lance',
    lightcrossbow: 'Light Crossbow',
    lighthammer: 'Light Hammer',
    longbow: 'Longbow',
    longsword: 'Longsword',
    mace: 'Mace',
    maul: 'Maul',
    morningstar: 'Morningstar',
    net: 'Net',
    pike: 'Pike',
    quarterstaff: 'Quarterstaff',
    rapier: 'Rapier',
    scimitar: 'Scimitar',
    shortsword: 'Shortsword',
    sickle: 'Sickle',
    spear: 'Spear',
    shortbow: 'Shortbow',
    sling: 'Sling',
    trident: 'Trident',
    warpick: 'War Pick',
    warhammer: 'Warhammer',
    whip: 'Whip'
};

try {
    if (args[0].macroPass === "postActiveEffects") {
        let nonProfSkills = Object.entries(CONFIG.DND5E.skills).filter(([key, _]) => workflow.actor.system.skills[key].value < 1);

        // build the select content
        let skillRows = "";
        for (let skill of nonProfSkills) {
            let row = `<option value="${skill[0]}">${skill[1].label}</option>`;
            skillRows += row;
        }

        let weaponRows = "";
        for (let weapon of Object.entries(weapons)) {
            let row = `<option value="${weapon[0]}">${weapon[1]}</option>`;
            weaponRows += row;
        }

        let toolRows = "";
        for (let tool of Object.entries(tools)) {
            let row = `<option value="${tool[0]}">${tool[1]}</option>`;
            toolRows += row;
        }

        // build the dialog content
        let content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>Select the skill to gain proficiency in:</label></div>
				<div class="flexrow" style="margin-bottom: 10px;">
					<select id="skillChoice">${skillRows}</select>
				</div>
				<div class="flexrow" style="margin-bottom: 10px;"><label>Select the weapon to gain proficiency in:</label></div>
				<div class="flexrow" style="margin-bottom: 10px;">
					<select id="weaponChoice">${weaponRows}</select>
				</div>
				<div class="flexrow" style="margin-bottom: 10px;"><label>Select the tool to gain proficiency in:</label></div>
				<div class="flexrow" style="margin-bottom: 10px;">
					<select id="toolChoice">${toolRows}</select>
				</div>
			</div>
		  </form>`;


        let choices = await foundry.applications.api.DialogV2.prompt({
            content: content,
            rejectClose: false,
            ok: {
                callback: (event, button, dialog) => {
                    // get the proficiency data selected
                    var skillSelect = document.getElementById("skillChoice");
                    var skillSelected = skillSelect.value;
                    var weaponSelect = document.getElementById("weaponChoice");
                    var weaponSelected = weaponSelect.value;
                    var toolSelect = document.getElementById("toolChoice");
                    var toolSelected = toolSelect.value;
                    return [skillSelected, weaponSelected, toolSelected];
                }
            },
            window: {
                title: `${optionName}`,
            },
            position: {
                width: 500
            }
        });

        if (choices) {
            const skillKey = `system.skills.${choices[0]}.value`;
            const toolKey = `system.tools.${choices[2]}.prof`;

            const effectData = {
                name: `${optionName} Proficiencies`,
                icon: item.img,
                origin: item.uuid,
                transfer: false,
                disabled: false,
                flags: { dae: { specialDuration: ["longRest"] } },
                changes: [
                    {
                        key: `${skillKey}`,
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                        value: '1',
                        priority: 20
                    },
                    {
                        key: 'system.traits.weaponProf.value',
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                        value: `${choices[1]}`,
                        priority: 21
                    },
                    {
                        key: `${toolKey}`,
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: '1',
                        priority: 22
                    }
                ]
            };

            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
