/*
	You summon a spirit that assumes the form of an unusually intelligent, strong, and loyal steed, creating a
	long-lasting bond with it. Appearing in an unoccupied space within range, the steed takes on a form that you choose,
	such as a warhorse, a pony, a camel, an elk, or a mastiff. (Your DM might allow other animals to be summoned as
	steeds.) The steed has the statistics of the chosen form, though it is a celestial, fey, or fiend (your choice)
	instead of its normal type. Additionally, if your steed has an Intelligence of 5 or less, its Intelligence becomes
	6, and it gains the ability to understand one language of your choice that you speak.

	Your steed serves you as a mount, both in combat and out, and you have an instinctive bond with it that allows you
	to fight as a seamless unit. While mounted on your steed, you can make any spell you cast that targets only you also
	target your steed.

	When the steed drops to 0 hit points, it disappears, leaving behind no physical form. You can also dismiss your
	steed at any time as an action, causing it to disappear. In either case, casting this spell again summons the same
	steed, restored to its hit point maximum.

	While your steed is within 1 mile of you, you can communicate with it telepathically.

	You can't have more than one steed bonded by this spell at a time. As an action, you can release the steed from its
	bond at any time, causing it to disappear.
 */
const version = "11.1";
const optionName = "Find Steed";
const summonFlag = "find-steed";

const _steedOptions = [
	{name: 'War Horse', id: 'kwzPYBMWjkPZ1bKB', image: 'modules/fvtt-trazzm-homebrew-5e/assets/monsters/warhorse.webp', stats: 'AC: 11, HP: 3d10+3, ATK: +6, DMG: 2d6+4, Walk: 60'},
	{name: 'Pony', id: '3e7WCwz3bzUYoRaL', image: 'modules/fvtt-trazzm-homebrew-5e/assets/monsters/pony.webp', stats: 'AC: 10, HP: 2d8+2, ATK: +4, DMG: 2d4+2, Walk: 40'},
	{name: 'Camel', id: 'oa6dc9L7d5qdFWy8', image: 'modules/fvtt-trazzm-homebrew-5e/assets/monsters/camel.webp', stats: 'AC: 9, HP: 2d10+4, ATK: +5, DMG: 1d4, Walk: 50'},
	{name: 'Elk', id:'4jly1SUPxjlAHMVZ', image: 'modules/fvtt-trazzm-homebrew-5e/assets/monsters/elk.jpg', stats: 'AC: 10, HP: 2d10+2, ATK: +5, DMG: 2d4+3, Walk: 50'},
	{name: 'Mastiff', id: 'jyxVnnRM36vIdZCc', image: 'modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-token-Mastiff.webp', stats: 'AC: 12, HP: 1d8+1, ATK: +3, DMG: 1d6+1, Walk: 40'},
	{name: 'Giant Badger', id: 'h4j6uhKL3f1HjCY9', image: 'modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-Giant-Badger.webp', stats: 'AC: 10, HP: 2d8+4, ATK: +3, DMG: 2d4+1, Walk: 30'},
	{name: 'Giant Lizard', id: 'zXjWd7B0zXnZyNHO', image: 'modules/fvtt-trazzm-homebrew-5e/assets/monsters/giant-lizard.webp', stats: 'AC: 12, HP: 3d10+3, ATK: +4, DMG: 1d8+2, Walk: 30'}
];

try {
	if (args[0].macroPass === "postActiveEffects") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module");

		const menuOptions = {};
		menuOptions["buttons"] = [
			{ label: "OK", value: true },
			{ label: "Cancel", value: false }
		];

		menuOptions["inputs"] = [
			{
				'label': 'Type for Steed:',
				'type': 'select',
				'options': [
					{
						'html': 'Celestial',
						'value': 'celestial'
					},
					{
						'html': 'Fey',
						'value': 'fey'
					},
					{
						'html': 'Fiend',
						'value': 'fiend'
					}
				]
			}
		];

		// add the steed options
		_steedOptions.forEach(item => {
			menuOptions["inputs"].push({ type: "radio",
				label: `<img src='${item.image}' width='30' height='30' style='border: 5px; vertical-align: middle;'><label>${item.name}</label><br/><label>${item.stats}</label>`,
				value: item.id,
				options: "group1" });
		});

		let choice = await warpgate.menu(menuOptions,
			{ title: `${optionName}: which steed do you want?`, options: { height: "100%", width: "100%" } });

		let targetButton = choice.buttons;
		if (targetButton) {
			const selectedIndex = choice.inputs.indexOf(true);

			if (selectedIndex >= 0) {
				const selectedSteed = _steedOptions[selectedIndex - 1];
				const steedId = `Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures.${selectedSteed.id}`;
				const steedType = choice.inputs[0];

				if (steedId) {
					let entity = await fromUuid(steedId);
					if (!entity) {
						ui.notifications.error(`${optionName} - unable to find the steed`);
					} else {
						// build the update data to match summoned traits
						const summonName = `${entity.name} (${actor.name})`;

						let updates = {
							token: {
								"name": summonName,
								"disposition": token.document.disposition,
								"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
								"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
								"bar1": {attribute: "attributes.hp"},
								"actorLink": false,
								"flags": {"fvtt-trazzm-homebrew-5e": {"Find Steed": {"ActorId": actor.id}}}
							},
							"name": summonName,
							"system.details": {
								"type.value": steedType
							}
						};

						// Add the summon to the scene
						let summonActor = game.actors.getName(summonName);
						if (!summonActor) {
							// import the actor
							let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), entity.id, updates);
							if (!document) {
								ui.notifications.error(`${optionName} - unable to import the steed from the compendium`);
								return;
							}
							await warpgate.wait(500);
							summonActor = game.actors.getName(summonName);
						}

						// Spawn the result
						const maxRange = item.system.range.value ? item.system.range.value : 30;
						let position = await HomebrewMacros.warpgateCrosshairs(token, maxRange, item, summonActor.prototypeToken);
						if (position) {
							let options = {collision: true};
							let spawned = await warpgate.spawnAt(position, summonName, updates, {controllingActor: actor}, options);
							if (!spawned || !spawned[0]) {
								ui.notifications.error(`${optionName} - unable to spawn the steed`);
								return;
							}

							let spawnId = spawned[0];
							let summonedToken = canvas.tokens.get(spawnId);
							await anime(token, summonedToken);

							await actor.setFlag("fvtt-trazzm-homebrew-5e", summonFlag, summonName);

						} else {
							ui.notifications.error(`${optionName} - invalid summon location`);
						}
					}
				}
			}
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, target) {
	new Sequence()
		.effect()
		.file("jb2a.misty_step.01.grey")
		.atLocation(target)
		.scaleToObject(1)
		.play();
}