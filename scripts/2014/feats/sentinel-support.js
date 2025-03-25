const version = "12.3.1";
const optionName = "Sentinel";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "sentinel-reprisal";

// On Attack Rolls effect macro
console.log("Sentinel - Reprisal Attack - On Attack Rolls");

// make sure the attacker is not the Sentinel Actor for the reprisal attack
if (origin.parent === actor) {
    console.log(`${optionName} - ignoring - sentinel actor is the attacker`);
    // TODO handle the opportunity case that sets the target movement to 0

}
else {
    // make sure the sentinel actor has their reaction available
    if (MidiQOL.hasUsedReaction(origin.parent)) {
        console.log(`${optionName} - ignoring - sentinel actor has already used their reaction`);
        return;
    }

    // Get the target and make sure they don't also have Sentinel
    let targetToken = undefined;
    let allTargets = game.user?.targets ??  new Set();
    let attackTargets = allTargets?.filter(tk => tk.actor).filter(tk => MidiQOL.isTargetable(tk)) ?? new Set();
    if (attackTargets.size > 0) {
        targetToken = attackTargets.first();
    }

    if (!targetToken) {
        console.log(`${optionName} - ignoring - no attack target`);
        return;
    }

    if (targetToken.actor.items.find(i => i.name.toLowerCase() === "sentinel")) {
        console.error(`${optionName} - target has Sentinel`);
        return;
    }

    // make sure the sentinel actor has an appropriate weapon equipped
    let validWeapons = origin.parent.items.filter(item => {
        return (item.system.actionType === "mwak" && item.system.equipped === true);
    });

    if (!validWeapons.length) {
        console.log(`${optionName} - sentinel actor has no appropriate weapon equipped`);
        return;
    }

    // use the first equipped melee weapon
    const attackingWeapon = validWeapons[0];

    // Give the Sentinel player the option of attacking
    let optionData = validWeapons.map(item => `<option value="${item.uuid}">${item.name}</option>`).join("");
    let dialogContent = `
    <div style='display: flex; align-items: center; justify-content: space-between;'>
        <div style='flex: 1;'>
            <p>${token.name} is attacking ${targetToken.name}</p>
            <p>Would you like to use your reaction to attack?</p>
        </div>
    </div>`;

    let useSentinel = await foundry.applications.api.DialogV2.confirm({
        window: {
            title: `${optionName} - ${origin.parent.name}`,
        },
        content: dialogContent,
        rejectClose: false,
        modal: true
    });

    if (useSentinel) {
        await origin.parent.setFlag(_flagGroup, flagName,
            {
                weaponUuid: attackingWeapon.uuid,
                targetUuid: token.document.uuid
            });

        // Create the item on the actor and execute the effect
        let reprisalItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', "Sentinel Reprisal Attack");
        await origin.parent.createEmbeddedDocuments("Item", [reprisalItem]);

        // Trigger the dialog for the specific player
        let browserUser = MidiQOL.playerForActor(origin.parent);
        if (!browserUser?.active) {
            console.info(`${optionName} - unable to locate the actor player, sending to GM`);
            browserUser = game.users?.activeGM;
        }

        await MidiQOL.socket().executeAsUser("completeItemUse", browserUser.id,
            { itemData: reprisalItem, actorUuid: origin.parent.uuid});

        // remove the temporary item
        let tempItems = origin.parent.items.filter(i => i.name === "Sentinel Reprisal Attack");
        if (tempItems) {
            await origin.parent.deleteEmbeddedDocuments("Item", tempItems.map(t=>t.id));
        }
    }
}
