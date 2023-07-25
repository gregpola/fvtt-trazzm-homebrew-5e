/*
	You gain the service of a familiar, a spirit that takes an animal form you choose: bat, cat, crab, frog (toad), hawk, lizard, octopus, owl, poisonous snake, fish (quipper), rat, raven, sea horse, spider, or weasel. Appearing in an unoccupied space within range, the familiar has the statistics of the chosen form, though it is a celestial, fey, or fiend (your choice) instead of a beast.
*/
const version = "10.1";
const optionName = "Find Familiar";
const summonFlag = "find-familiar";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0] === "on") {
		const sourceItem = await fromUuid(lastArg.origin);
		
		const folderName = `Familiars (${actor.name})`;
		const theFolder = game.folders.getName(folderName);

		if (!theFolder) {
			return ui.notifications.error(`${optionName} - unable to locate the folder: ${folderName}`);
		}
		
		if (!theFolder.content) {
			return ui.notifications.error(`${optionName} - the familiars folder is empty`);
		}

		const options = theFolder.content.reduce((acc, target) => {
			return acc + `<option value="${target.uuid}">${target.name}</option>`;
		}, "");
		
		// if the user already has a familiar, dismiss the old one
		const lastSummon = actor.getFlag("midi-qol", summonFlag);
		if (lastSummon) {
			await dismissFamiliar(lastSummon);
		}
		
		// ask which familiar to summon
		const {uuid, name} = await Dialog.prompt({
		  rejectClose: false,
		  label: "Spawn",
		  title: optionName,
		  content: `
		  <p style='text-align:center'><em>Which familiar?</em></p>
		  <form>
			<div class="form-group">
			  <label>Familiar:</label>
			  <div class="form-fields">
				<select autofocus>${options}</select>
			  </div>
			</div>
			<div class="form-group">
			  <label>Optional Name:</label>
			  <div class="form-fields">
				<input type="text">
			  </div>
			</div>
		  </form>`,
		  callback: (html) => {
			const u = html[0].querySelector("select").value;
			const n = html[0].querySelector("input").value;
			return {uuid: u, name: n};
		  }
		}) ?? {};
		
		if(uuid) {
			const a = await fromUuid(uuid);
			const tokenData = await a.getTokenDocument();
			
			const updates = {token: {}, actor: {name: `${actor.name}'s Familiar`}};			
			if(name) {
				updates.token.name = name;
			}
			
			let position = await HomebrewMacros.warpgateCrosshairs(actorToken, 10, sourceItem, tokenData);
			if (position) {
				// check for token collision
				const newCenter = canvas.grid.getSnappedPosition(position.x - tokenData.width / 2, position.y - tokenData.height / 2, 1);
				if (HomebrewMacros.checkPosition(tokenData, newCenter.x, newCenter.y)) {
					ui.notifications.error(`${optionName} - can't summon on top of another token`);
					return false;
				}

				const result = await warpgate.spawnAt(position, tokenData, updates, { controllingActor: actor }, {});
				if (!result || !result[0]) {
					return ui.notifications.error(`${optionName} - unable to summon`);
				}

				let summonedToken = canvas.tokens.get(result[0]);
				if (summonedToken) {
					await anime(summonedToken);
					await actor.setFlag("midi-qol", summonFlag, summonedToken.id);
				}
				
			}
			else {
				return ui.notifications.error(`${optionName} - invalid summon location`);
			}
		}
	}
	else if (args[0] === "off") {
		// delete the familiar
		const lastSummon = actor.getFlag("midi-qol", summonFlag);
		if (lastSummon) {
			await dismissFamiliar(lastSummon);
		}

	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function dismissFamiliar(familiarId) {
	await actor.unsetFlag("midi-qol", summonFlag);
	await warpgate.dismiss(familiarId, game.canvas.scene.id);
}

async function anime(target) {
    new Sequence()
        .effect()
        .file("jb2a.explosion.03.bluewhite")       
        .atLocation(target)
		.center()
		.scaleToObject(2.0)
		.belowTokens()
		.play();
}
