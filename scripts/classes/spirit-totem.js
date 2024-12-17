/*
	Starting at 2nd level, you can call forth nature spirits to influence the world around you. As a bonus action, you
	can magically summon an incorporeal spirit to a point you can see within 60 feet of you. The spirit creates an aura
	in a 30-foot radius around that point. It counts as neither a creature nor an object, though it has the spectral
	appearance of the creature it represents.

	As a bonus action, you can move the spirit up to 60 feet to a point you can see.

	The spirit persists for 1 minute or until you’re Incapacitated. Once you use this feature, you can’t use it again
	until you finish a short or long rest.
*/
const version = "12.3.1";
const optionName = "Spirit Totem";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "spirit-totem";
const moveId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.m80JY5qVDjS22nFZ";
const hawkId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.U4a0Fz4QuNvFviDP";
const unicornId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.mSCLTuKP2Xef1SJW";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// get the summoned spirit
		const summonEffect = HomebrewHelpers.findEffect(actor, 'Summon: Spirit Totem');
		if (summonEffect) {
			const summonFlag = summonEffect.getFlag('dnd5e', 'dependents');
			if (summonFlag) {
				const tokenId = summonFlag[0].uuid;
				const summonToken = await fromUuid(tokenId);

				if (summonToken) {
					await actor.setFlag(_flagGroup, flagName, tokenId);

					// Apply other totem effects
					if (summonToken.actor.name === 'Totem Spirit - Bear') {
						await applyBearTotemEffects(actor, summonToken);
					}
					else if (summonToken.actor.name === 'Totem Spirit - Hawk') {
						let hawkItem = await fromUuid(hawkId);
						await actor.createEmbeddedDocuments('Item',[hawkItem.toObject()]);
					}
					else if (summonToken.actor.name === 'Totem Spirit - Unicorn') {
						let unicornItem = await fromUuid(unicornId);
						await actor.createEmbeddedDocuments('Item',[unicornItem.toObject()]);
					}

					let moveItem = await fromUuid(moveId);
					await actor.createEmbeddedDocuments('Item',[moveItem.toObject()]);
				}
			}
		}
	}
	else if (args[0] === "off") {
		await actor.unsetFlag(_flagGroup, flagName);

		const moveItem = actor.items.find(i => i.name === 'Move Spirit Totem');
		if (moveItem) {
			await actor.deleteEmbeddedDocuments('Item',[moveItem.id]);
		}

		const hawkItem = actor.items.find(i => i.name === 'Spirit Totem - Hawk Advantage');
		if (hawkItem) {
			await actor.deleteEmbeddedDocuments('Item',[hawkItem.id]);
		}

		const unicornItem = actor.items.find(i => i.name === 'Spirit Totem - Unicorn Healing');
		if (unicornItem) {
			await actor.deleteEmbeddedDocuments('Item', [unicornItem.id]);
		}
	}

} catch (err) {
    console.error(`${optionName} ${version}`, err);
}

async function applyBearTotemEffects(actor, summonedToken) {
	const druidLevel = actor.classes.druid?.system.levels ?? 0; // TODO how handle NPC's
	const tempHps = 5 + druidLevel;

	// ask which tokens to give temp hp to
	const possibleTargets = MidiQOL.findNearby(null, summonedToken, 30);
	if (possibleTargets.length > 0) {
		// build the target data
		let rows = "";
		for (let t of possibleTargets) {
			let row = `<div><input type="checkbox" name="target" style="margin-right:10px;" value=${t.id}/><label>${t.name}</label></div>`;
			rows += row;
		}

		// build dialog content
		let content =
			`<form>
				<div class="flexcol">
					<div class="flexrow" style="margin-bottom: 10px;"><label>Select who gets ${tempHps} temporary hit points:</label></div>
					<div id="targetRows" class="flexcol"style="margin-bottom: 10px;">
						${rows}
					</div>
				</div>
			</form>`;

		let healTargets = await foundry.applications.api.DialogV2.prompt({
			content: content,
			rejectClose: true,
			ok: {
				callback: (event, button, dialog) => {
					let recipients = [];
					for (var i = 0; i < button.form.elements.target.length; i++) {
						if (button.form.elements.target[i].checked) {
							let target = possibleTargets[i];
							recipients.push(target);
						}
					}
					return recipients;
				}
			},
			window: {
				title: `${optionName}`
			},
			position: {
				width: 400
			}
		});

		if (healTargets.length > 0) {
			const damageRoll = await new Roll(`${tempHps}`).evaluate();
			await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "temphp", healTargets, damageRoll,
				{flavor: `${actor.name}'s Bear Spirit provided temporary hit points`, itemCardId: args[0].itemCardId});
		}
	}
}
