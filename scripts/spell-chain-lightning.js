/*
	You create a bolt of lightning that arcs toward a target of your choice that you can see within range. Three bolts
	then leap from that target to as many as three other targets, each of which must be within 30 feet of the first
	target. A target can be a creature or an object and can be targeted by only one of the bolts.

	A target must make a Dexterity saving throw. The target takes 10d8 lightning damage on a failed save, or half as
	much damage on a successful one.

	At Higher Levels. When you cast this spell using a spell slot of 7th level or higher, one additional bolt leaps from
	the first target to another target for each slot level above 6th.
*/
const version = "10.0";
const optionName = "Chain Lightning";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const wf = scope.workflow;
		const saveDC = wf.item.system.save.dc;

		let maxTargets = workflow.castData.castLevel - 3;
		let targetToken = workflow.targets.first();
		let nearbyTokens = await MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.FRIENDLY, targetToken, 30, {canSee: true});
		if (nearbyTokens.length < 1) {
			console.error(`${optionName} - no potential targets found nearby`);
			return;
		}

		// ask for the additional targets
		let addedTargets = [];
		let addedTargetUuids = [];
		let choices = [];

		if (nearbyTokens.length > maxTargets) {
			//targetList and the_content is going to populate the pop-up dialog that lets you select the secondary targets
			let rows = "";
			for (let t of nearbyTokens) {
				let row = `<div><input type="checkbox" style="margin-right:10px;"/><label>${t.actor.name}</label></div>`;
				rows += row;
				choices.push(t); // choices.push(t.object);
			}

			let content = `
				<form>
					<div class="flexcol">
						<div class="flexrow" style="margin-bottom: 10px;"><label>Your Chain Lightning can arc to <b>${maxTargets}</b> targets:</label></div>
						<div id="targetRows" class="flexcol"style="margin-bottom: 10px;">
							${rows}
						</div>
					</div>
				</form>`;

			let dialog = new Promise((resolve, reject) => {
				new Dialog({
					title: optionName,
					content,
					buttons: {
						Ok: {
							label: `Ok`,
							callback: async (html) => {
								var grid = document.getElementById("targetRows");
								var checkBoxes = grid.getElementsByTagName("INPUT");

								for (var i = 0; i < checkBoxes.length; i++) {
									if (addedTargets.length === maxTargets)
										break;

									if (checkBoxes[i].checked) {
										addedTargets.push(choices[i]);
										addedTargetUuids.push(choices[i].document.uuid);
									}
								}

								resolve(true);
							}
						}
					}
				}).render(true);
			});
			await dialog;
		}
		else {
			for (let i of nearbyTokens) {
				addedTargets.push(i);
				addedTargetUuids.push(i.document.uuid);
			}
		}

		// add animation
		new Sequence().effect().atLocation(wf.token).stretchTo(targetToken).file('jb2a.chain_lightning.secondary.blue').play();

		// apply the arcing to other targets
		if (addedTargets.length > 0) {
			for (let i of addedTargets) {
				new Sequence().effect().atLocation(targetToken).stretchTo(i).file('jb2a.chain_lightning.secondary.blue').play();
			}

			let featureData = await getLightningArcItem(wf.damageRoll.total, saveDC);
			let feature = new CONFIG.Item.documentClass(featureData, {'parent': wf.actor});
			let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions(addedTargetUuids);
			await MidiQOL.completeItemUse(feature, config, options);
			await featureData.delete();
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function getLightningArcItem(damage, saveDC) {
	return await Item.create({
		name: "Chain Lightning Arc",
		type: "feat",
		img: "icons/magic/lightning/bolts-forked-large-blue.webp",
		system: {
			actionType: "save",
			damage: {
				parts: [[damage, 'lightning']]
			},
			target: {
				value: null,
				width: null,
				units: "",
				type: ""
			},
			save: {
				ability: "dex",
				dc: saveDC,
				scaling: "flat"
			},
			duration: {units: "inst", value: undefined}
		},
		effects: [],
		flags: {
			"midi-qol": {
				effectActivation: false
			},
			"midiProperties": {
				"nodam": false,
				"fulldam": false,
				"halfdam": false,
				"autoFailFriendly": false,
				"autoSaveFriendly": false,
				"rollOther": false,
				"critOther": false,
				"offHandWeapon": false,
				"magicdam": true,
				"magiceffect": false,
				"concentration": false,
				"toggleEffect": false,
				"ignoreTotalCover": false
			},
			"autoanimations": {
				"macro": {
					"enable": false
				}
			}
		}
	});
}