/*
	You teleport yourself from your current location to any other spot within range. You arrive at exactly the spot
	desired. It can be a place you can see, one you can visualize, or one you can describe by stating distance and
	direction, such as "200 feet straight downward" or "upward to the northwest at a 45- degree angle, 300 feet."

	You can bring along objects as long as their weight doesn't exceed what you can carry. You can also bring one
	willing creature of your size or smaller who is carrying gear up to its carrying capacity. The creature must be
	within 5 feet of you when you cast this spell.
 */
const version = "12.3.1";
const optionName = "Dimension Door";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const maxRange = item.system.range.value ?? 500;
		
		// ask if they want to bring an ally along
		// find nearby allies
		let companion = null;
		const friendlyTargets = MidiQOL.findNearby(1, token, 5);
		let friend_content = ``;
		for (let friend of friendlyTargets) {
			if (HomebrewHelpers.isSameSizeOrSmaller(token, friend)) {
				friend_content += `<option value=${friend.id}>${friend.name}</option>`;
			}
		}

		if (friend_content.length > 0) {
			let content = `
				<div class="form-group">
				  <label><p>Who would you like to take with you?</p></label>
				  <select name="friends">
					${friend_content}
				  </select>
				  <br />
				</div>`;
				
			let dialog = new Promise((resolve, reject) => {
				new Dialog({
					title: `${optionName}`,
					content,
					buttons:
					{
						pick: {
							label: `Go`,
							callback: async (html) => {
								let friendId = html.find('[name=friends]')[0].value;
								const token = await canvas.tokens.get(friendId);
								resolve(token);
							}
						},
						none: {
							label: `Nobody`,
							callback: () => { resolve(null) }
						}
					}
				}).render(true);
			});

			companion = await dialog;				
		}

		// get the companion offset from the caster
		let xdiff = 0;
		let ydiff = 0;
		if (companion) {
			xdiff = companion.center.x - token.center.x;
			ydiff = companion.center.y - token.center.y;
		}

		// transport the caster
		let position = await HomebrewMacros.teleportToken(token, maxRange);

		// transport the companion
		if (companion && position) {
			let compPosition = foundry.utils.duplicate(position);
			compPosition.x += xdiff;
			compPosition.y += ydiff;
			await HomebrewMacros.teleportToken(companion, 5, compPosition);
		}
		else {
			ui.notifications.error(`${optionName} - invalid teleport location`);
			return false;
		}
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
