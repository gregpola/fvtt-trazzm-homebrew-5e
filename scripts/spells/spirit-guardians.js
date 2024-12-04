const version = "12.3.0"
const optionName = "Spirit Guardians";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const lastAppliedTimeFlag = "last-applied-time-flag";

try {
    const lastArg = args[args.length -1];

    if (args[0].macroPass === "preItemRoll") {
        // ask for damage type
        let options = [];
        options.push({
            type: "radio",
            label: "Necrotic",
            value: 'necrotic'
        });
        options.push({
            type: "radio",
            label: "Radiant",
            value: 'radiant',
            default: true
        });

        const menuOptions = {};
        menuOptions["buttons"] = [
            { label: "Ok", value: true },
            { label: "Cancel", value: false }
        ];
        menuOptions["inputs"] = options;

        let choice = await HomebrewHelpers.menu(menuOptions,
            { title: `Pick the damage type:`, options: { height: "100%", width: "150px" } });

        if (!choice.buttons) {
            return false;
        }

        const selectedIndex = choice.inputs.indexOf(true);
        let damageType = options[selectedIndex].value;

        // update the effect damage type
        let copy_item = duplicate(item.toObject());
        let effect = copy_item.effects.find(eff =>eff.name === optionName);
        if (effect) {
            let changed = false;
            for (let ch of effect.changes) {
                if (ch.key === "flags.midi-qol.OverTime") {
                    if (ch.value.search(damageType) < 0) {
                        let oldType = damageType === 'radiant' ? 'necrotic' : 'radiant';
                        let newValue = ch.value.replace(oldType, damageType);
                        ch.value = newValue;
                        changed = true;
                    }
                }
            }

            if (changed) {
                await actor.updateEmbeddedDocuments("Item", [copy_item]);
            }
        }
    }
    // token entering aura
    else if (args[0] === "on" && args[1] !== lastArg.tokenId && lastArg.tokenId === game.combat?.current.tokenId) {
        if (HomebrewHelpers.isAvailableThisTurn(actor, lastAppliedTimeFlag)) {
            const isDead = HomebrewHelpers.findEffect(actor, "Dead");
            if (!isDead) {
                HomebrewHelpers.setUsedThisTurn(actor, lastAppliedTimeFlag);
                let activeEffect = actor.effects.find(e => e.id === lastArg.effectId);
                if (activeEffect) {
                    await MidiQOL.doOverTimeEffect(actor, activeEffect);
                }
            }
        }
    }
    else if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.targets.first();
        if (targetToken && HomebrewHelpers.isAvailableThisTurn(targetToken.actor, lastAppliedTimeFlag)) {
            HomebrewHelpers.setUsedThisTurn(actor, lastAppliedTimeFlag);
        }
    }
} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
