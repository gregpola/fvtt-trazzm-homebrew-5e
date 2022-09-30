/* Font of Magic

- Convert points to spell slots.
- Convert spell slots to points.

- Slots to points: 1-1.
- Points to slots:
	2 points => 1st-level
	3 points => 2nd-level
	5 points => 3rd-level
	6 points => 4th-level
	7 points => 5th-level
*/
const version = "0.1.0";
try {
	if (args[0] === "on") {
		if (!args[1].tokenId) {
			console.error("Font of Magic - no token");
			return {};
		}
		
		// data init
		const actor = canvas.tokens.get(args[1].tokenId).actor;
		const item = actor.items.get(args[1].origin.substring(args[1].origin.lastIndexOf(".")+1));
		
		// data validation
		if (!actor) {
			console.error("Font of Magic - no actor");
			return {};
		}
		if (!item) {
			console.error("Font of Magic - no item");
			return {};
		}
		if (!actor.data.data.resources.primary) {
			console.error("Font of Magic - no resource found");
			return {};
		}

		const points = actor.data.data.resources.primary.value;
		const pointsMax = actor.data.data.resources.primary.max;
		const spells = duplicate(actor.data.data.spells);
		if (!spells) {
			console.error("Font of Magic - no spells");
			return {};
		}

		const is_missing_points = points < pointsMax;
		const is_missing_slots = Object.entries(spells).filter(([key, {value, max}]) => {
			let spell_level = Number(key.at(-1));
			if(spell_level > 5) return false;
			if(spell_level < 1) return false;
			return (max > 0 && value < max);
		});

		const has_available_spell_slots = Object.values(spells).filter(({value, max}) => {
			return (value > 0 && max > 0);
		}).length > 0;
		const has_available_sorcery_points = points >= 2; // needs at least 2.

		const can_convert_slot_to_points = has_available_spell_slots && is_missing_points;
		const can_convert_points_to_slot = has_available_sorcery_points && is_missing_slots;
		if(!can_convert_points_to_slot && !can_convert_slot_to_points){
			return ui.notifications.warn("You have no options available.");
		}

		// set up available buttons.
		const buttons = {};
		if(can_convert_slot_to_points) buttons["slot_to_point"] = {
			icon: `<i class="fas fa-arrow-left"></i> <br>`,
			label: "Convert a spell slot to sorcery points",
			callback: async () => {await slot_to_points()}
		}
		if(can_convert_points_to_slot) buttons["point_to_slot"] = {
			icon: `<i class="fas fa-arrow-right"></i> <br>`,
			label: "Convert sorcery points to a spell slot",
			callback: async () => {await points_to_slot()}
		}
		new Dialog({title: "Font of Magic", buttons}).render(true);

		// Convert spell slot to sorcery points.
		async function slot_to_points(){

			const level = await new Promise(resolve => {
				
				// build buttons for each level where value, max > 0.
				const slot_to_points_buttons = {}
				for(let [key, {value, max}] of Object.entries(spells)){
					if(max > 0 && value > 0){
						slot_to_points_buttons[key] = {
							label: `
								<div class="flexrow">
								<span>${CONFIG.DND5E.spellLevels[key.at(-1)]} (${value}/${max})</span>
								<span>(+${key.at(-1)} points)</span>
								</div>`,
							callback: () => {resolve(key.at(-1))}
						}
					}
				}
				
				const stp_dialog = new Dialog({
					title: "Slot to Sorcery Points",
					buttons: slot_to_points_buttons,
					content: `
						Pick a spell slot level to convert one spell slot to sorcery points (<strong>${points}/${pointsMax}</strong>).
						You gain a number of sorcery points equal to the level of the spell slot.<hr>`,
					render: (html) => {
						html.css("height", "auto");
						stp_dialog.element[0].querySelector(".dialog-buttons").style.flexDirection = "column";
					},
					close: () => {resolve(0)}
				}).render(true);
			});
			
			console.log(level);
			
			if(Number(level) > 0){
				await actor.update({[`data.spells.spell${level}.value`]: getProperty(actor.data, `data.spells.spell${level}.value`) - 1});
				await actor.update({"data.resources.primary.value": Math.clamped(points + Number(level), 0, pointsMax)});
				return ui.notifications.info("Regained sorcery points!");
			}
		}

		// Convert sorcery points to spell slot.
		async function points_to_slot(){
			
			// number of points to regain an nth level spell slot.
			const conversion_map = {"1": 2, "2": 3, "3": 5, "4": 6, "5": 7}
			
			const level = await new Promise(resolve => {
				
				// build buttons for each level where max > 0, max > value, and conversion_map[level] <= points.
				const points_to_slot_buttons = {}
				for(let [key, {value, max}] of Object.entries(spells)){
					if(!!conversion_map[key.at(-1)] && max > 0 && max > value && conversion_map[key.at(-1)] <= points){
						points_to_slot_buttons[key] = {
							label: `
								<div class="flexrow">
									<span>${CONFIG.DND5E.spellLevels[key.at(-1)]} (${value}/${max})</span>
									<span>(&minus;${conversion_map[key.at(-1)]} points)</span>
								</div>`,
							callback: () => {resolve(key.at(-1))}
						}
					}
				}
				
				const pts_dialog = new Dialog({
					title: "Sorcery Points to Slot",
					buttons: points_to_slot_buttons,
					content: `Pick a spell slot level to regain from sorcery points (<strong>${points}/${pointsMax}</strong>). <hr>`,
					render: (html) => {
						html.css("height", "auto");
						pts_dialog.element[0].querySelector(".dialog-buttons").style.flexDirection = "column";
					},
					close: () => {resolve(0)}
				}).render(true);
			});
			
			if(Number(level) > 0){
				await actor.update({[`data.spells.spell${level}.value`]: getProperty(actor.data, `data.spells.spell${level}.value`) + 1});
				await actor.update({"data.resources.primary.value": Math.clamped(points - conversion_map[level], 0, pointsMax)});
				return ui.notifications.info("Regained a spell slot!");
			}
		}
	}
} catch (err)  {
    console.error(`${args[1].efData.label} - Font of Magic ${version}`, err);
}
