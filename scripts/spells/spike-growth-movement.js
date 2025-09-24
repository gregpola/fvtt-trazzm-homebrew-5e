/*
	The ground in a 20-foot radius centered on a point within range twists and sprouts hard spikes and thorns. The area
	becomes difficult terrain for the Duration. When a creature moves into or within the area, it takes 2d4 piercing
	damage for every 5 feet it travels.

	The transformation of the ground is camouflaged to look natural. Any creature that can’t see the area at the time
	the spell is cast must make a Wisdom (Perception) check against your spell save DC to recognize the terrain as
	hazardous before entering it.

	The ground in a 20-foot-radius Sphere centered on a point within range sprouts hard spikes and thorns. The area
	becomes Difficult Terrain for the duration. When a creature moves into or within the area, it takes 2d4 Piercing
	damage for every 5 feet it travels.

	The transformation of the ground is camouflaged to look natural. Any creature that can’t see the area when the spell
	is cast must take a Search action and succeed on a Wisdom (Perception) or Wisdom (Survival) check against your spell
	save DC to recognize the terrain as hazardous before entering it.
*/
const version = "13.5.0";
const optionName = "Spike Growth";

// Move within
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log("Spike Growth -- " + event.user.name);
if (!event.data.teleport) {
    const distanceMoved = event.data.movement.passed.distance;
	const squaresMoved = distanceMoved / 5;

	if (squaresMoved > 0) {
		const originActor = await fromUuid(region.flags['region-attacher'].actorUuid);
		const originToken = await MidiQOL.tokenForActor(originActor);

        let targetToken = event.data.token;
        if (targetToken) {
            const sourceItem = await fromUuid(region.flags['region-attacher'].itemUuid);
            if (sourceItem) {
                // synthetic activity use
                const activity = sourceItem.system.activities.find(a => a.identifier === 'movement-damage');
                if (activity) {
                    let targetUuids = [targetToken.uuid];

                    const options = {
                        midiOptions: {
                            targetUuids: targetUuids,
                            noOnUseMacro: true,
                            configureDialog: false,
                            showFullCard: false,
                            ignoreUserTargets: true,
                            checkGMStatus: true,
                            autoRollAttack: true,
                            autoRollDamage: "always",
                            fastForwardAttack: true,
                            fastForwardDamage: true,
                            workflowData: true
                        }
                    };

                    await MidiQOL.completeActivityUse(activity.uuid, options, {}, {});
                    await new Sequence().effect().file("jb2a.swirling_leaves.loop.01.green").atLocation(targetToken).scaleToObject(1.5).play();
                }
                else {
                    ui.notifications.error(`${optionName}: ${version} - missing Movement Damage activity`);
                }

            }
            else {
                ui.notifications.error(`${optionName}: ${version} - missing source item`);
            }
        }
	}
}
