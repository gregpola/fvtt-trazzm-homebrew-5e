/*
	When a creature misses you with a melee attack roll, you can take a Reaction and expend one Superiority Die to make
	a melee attack roll with a weapon or an Unarmed Strike against the creature. If you hit, add the Superiority Die to
	the attack's damage.
*/
const optionName = "Riposte";
const version = "13.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "riposte-data";

try {
    if (args[0].macroPass === "preItemRoll") {
        const attackingActor = workflow.workflowOptions.item?.actor;

        if (attackingActor) {
            const attackerToken = MidiQOL.tokenForActor(attackingActor);
            const tokenDistance = MidiQOL.computeDistance(token, attackerToken);

            // fetch the attack options from the character
            let possibleWeapons = actor.items.filter(i => i.type === 'weapon' && (i.system.equipped || i.system.type.value === 'natural') && Math.max(Number(i.system.range.value), i.system.range.reach) >= tokenDistance);
            if (possibleWeapons && possibleWeapons.length > 0) {
                let selectedWeaponId;

                // ask which weapon to use
                if (possibleWeapons.length === 1) {
                    selectedWeaponId = possibleWeapons[0].id;
                }
                else {
                    let itemList = await possibleWeapons.reduce((list, item) => list += `<option value="${item.id}">${item.name}</option>`, ``);

                    selectedWeaponId = await foundry.applications.api.DialogV2.prompt({
                        content: `<p>Which weapon do you want to attack with?</p><form><div class="form-group"><select id="dropItem">${itemList}</select></div></form>`,
                        rejectClose: false,
                        ok: {
                            callback: (event, button, dialog) => {
                                return button.form.elements.dropItem.value;
                            }
                        },
                        window: {
                            title: `${optionName}`,
                        },
                        position: {
                            width: 400
                        }
                    });
                }

                if (selectedWeaponId) {
                    await actor.setFlag(_flagGroup, _flagName, {
                        targetUuid: attackingActor.uuid,
                        weaponId: selectedWeaponId
                    });
                }

            }
            else {
                ui.notifications.error(`${optionName}: ${version} - no available weapon to perform the attack`);
                return false;
            }
        }
    }
    else if (args[0].macroPass === "postActiveEffects") {
        let flag = actor.getFlag(_flagGroup, _flagName);
        if (flag) {
            const weapon = actor.items.find(i => i.id === flag.weaponId);
            if (weapon) {
                let activity = weapon.system.activities.getName("Attack");
                if (activity) {
                    const options = {
                        midiOptions: {
                            targetUuids: [flag.targetUuid],
                            isTriggered: true,
                            noOnUseMacro: false,
                            configureDialog: false,
                            showFullCard: true,
                            ignoreUserTargets: true,
                            checkGMStatus: false,
                            autoRollAttack: true,
                            autoRollDamage: "always",
                            fastForwardAttack: true,
                            fastForwardDamage: true,
                            workflowData: true
                        }
                    };

                    await MidiQOL.completeActivityUse(activity.uuid, options, {}, {});
                }
            }

            await actor.unsetFlag(_flagGroup, _flagName);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
    return false;
}
