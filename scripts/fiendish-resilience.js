/*
	Starting at 10th level, you can choose one damage type when you finish a short or long rest. You gain resistance to that damage type until you choose a different one with this feature. Damage from magical weapons or silver weapons ignores this resistance.
*/
const version = "10.0.0";
const optionName = "Fiendish Resilience";
const damageTypes = ["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"];

try {
	if (args[0].macroPass === "postActiveEffects") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

		// ask which damage type to gain resistance to
		let resistanceOptions = ``;
		damageTypes.forEach (function(value) {
			resistanceOptions += `<option value=${value}>${value}</option>`;			
		});
		
		let content = `
			<div class="form-group">
			  <p><label>What damage type do you want resistance to?</label></p>
			  <div style="margin: 10px;">
				  <select name="titem">
					${resistanceOptions}
				  </select>
			  </div>
			</div>`;
		
		let d = await new Promise((resolve) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content,
				buttons: {
					OK: {
						label: "OK", 
						callback: async (html) => {
							let resistType = html.find('[name=titem]')[0].value;
							resolve(resistType);
						}
					},
					Cancel:
					{
						label: `Cancel`,
						callback: async (html) => {
							resolve(null);
						}
					}
				}
			}).render(true);
		});

		let selectedType = await d;
		if (selectedType) {
			const effectData = {
				changes:[{
					key: 'system.traits.dr.value',
					mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
					value: `${selectedType}`
				}],
				label: `${optionName} (${selectedType})`,
				icon: "icons/magic/defensive/armor-stone-skin.webp",
				flags: {dae: { specialDuration: []} }
			};
			
			await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: actor.uuid, effects: [effectData]}); 
		}
	}

} catch (err) {
    console.error(`${optionName}: v${version}`, err);
}
