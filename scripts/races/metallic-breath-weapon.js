/*
	At 5th level, you gain a second breath weapon. When you take the Attack action on your turn, you can replace one of
	your attacks with an exhalation in a 15-foot cone.

	The save DC for this breath is 8 + your Constitution modifier + your proficiency bonus.

	Whenever you use this trait, choose one:

		Enervating Breath: Each creature in the cone must succeed on a Constitution saving throw or become incapacitated until the start of your next turn.
		Repulsion Breath: Each creature in the cone must succeed on a Strength saving throw or be pushed 20 feet away from you and be knocked prone.

	Once you use your Metallic Breath Weapon, you can’t do so again until you finish a long rest.
 */
const version = "11.0";
const optionName = "Metallic Breath Weapon";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const pb = actor.system.attributes.prof ?? 2;
		const conMod = actor.system.abilities.con.mod;
		const saveDC = 8 + pb + conMod;

		const targets = Array.from(workflow.targets);

		// ask which type of breath
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Which type of breath?</p>`,
				buttons: {
					one: {
						label: "<p>Enervating Breath</p>",
						callback: () => resolve(1)
					},
					two: {
						label: "<p>Repulsion Breath</p>",
						callback: () => { resolve(2) }
					}
				},
				default: "two"
			}).render(true);
		});

		let breathOption = await dialog;
		if (breathOption === 1) {
			const enervationEffectData = {
				label: "Enervating Breath",
				icon: "modules/fvtt-trazzm-homebrew-5e/assets/skills/force_breath.jpg",
				origin: workflow.item.uuid,
				changes: [
					{
						key: 'macro.CE',
						mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
						value: "Incapacitated",
						priority: 20
					}
				],
				flags: {
					dae: {
						selfTarget: false,
						stackable: "none",
						durationExpression: "",
						macroRepeat: "none",
						specialDuration: ["turnStartSource"],
						transfer: false
					}
				},
				disabled: false
			};

			// roll the saving throws
			await game.MonksTokenBar.requestRoll(targets, {
				request:[{"type": "save", "key": "con"}],
				dc:saveDC, showdc:true, silent:true, fastForward:false,
				flavor:`${optionName} - Enervating Breath`,
				rollMode:'roll',
				callback: async (result) => {
					console.log(result);
					for (let tr of result.tokenresults) {
						if (!tr.passed) {
							// mark incapacitated
							await MidiQOL.socket().executeAsGM("createEffects",
								{ actorUuid: tr.actor.uuid, effects: [enervationEffectData] });
						}
					}
				}
			});

		}
		else if (breathOption === 2) {
			// roll the saving throws
			await game.MonksTokenBar.requestRoll(targets, {
				request:[{"type": "save", "key": "con"}],
				dc:saveDC, showdc:true, silent:true, fastForward:false,
				flavor:`${optionName} - Enervating Breath`,
				rollMode:'roll',
				callback: async (result) => {
					console.log(result);
					for (let tr of result.tokenresults) {
						if (!tr.passed) {
							let targetToken = canvas.tokens.get(tr.id);
							if (targetToken) {
								//push and knock prone
								await HomebrewMacros.pushTarget(token, targetToken, 4);
								await game.dfreds?.effectInterface.addEffect({ effectName: 'Prone', uuid: tr.actor.uuid });
							}
							else {
								console.error("targetToken not found");
							}
						}
					}
				}
			});
		}
	}
	
} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
