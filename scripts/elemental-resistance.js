const version = "10.0.0";
const optionName = "Elemental Resistance";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const lastArg = args[args.length - 1];
		let tactor;
		let itemName = lastArg.itemData.name;
		let itemD = lastArg.item;
		
		if (lastArg.tokenUuid) tactor = (await fromUuid(lastArg.tokenUuid)).actor;
		else tactor = game.actors.get(lastArg.actorId);

		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: 'Choose a damage resistance type',
				content: `
				<form class="flexcol">
				  <div class="form-group">
					<select id="element">
					  <option value="acid">Acid</option>
					  <option value="cold">Cold</option>
					  <option value="fire">Fire</option>
					  <option value="lightning">Lightning</option>
					</select>
				  </div>
				</form>
				`,
				//select element type
				buttons: {
					yes: {
						icon: '<i class="fas fa-bolt"></i>',
						label: 'Select',
						callback: async (html) => {
							let element = html.find('#element').val();
							if (element) {
								let effect =  tactor.effects.find(i => i.label === itemName);
								if (effect) {
									effect.delete();
								}
								
								let effectDataResistance = [{
									label: itemD.name,
									icon: itemD.img,
									changes: [
										{ key: `system.traits.dr.value`, mode: 2, value: `${element}`, priority: 20 }
									],
									origin: lastArg.uuid,
									disabled: false,
								}];
								await tactor.createEmbeddedDocuments("ActiveEffect", effectDataResistance);
							}
							resolve();
						},
					},
				}
			}).render(true);
		});
		await dialog;
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
