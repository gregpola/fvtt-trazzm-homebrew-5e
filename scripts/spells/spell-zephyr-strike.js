const version = "10.0.0";
const optionName = "Zephyr Strike";

const lastArg = args[args.length - 1];
let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
let actorToken = canvas.tokens.get(lastArg.tokenId);
let active = actor.effects.find(e => e.label === "Zephyr Strike Advantage Active");
let used = actor.effects.find(e => e.label === "Zephyr Strike").getFlag('world','zephyrStrikeUsed');

try {
	if (args[0].macroPass === "preAttackRoll") {
        if (lastArg.itemData.type === "weapon" && !used) {
            let dialog = new Promise((resolve, reject) => {
                new Dialog({
                    title: "Use Zephyr Strike?",
                    content: "Do you want to use Zephyr Strike Advantage and Extra Dice?",
                    buttons: {
                        one: {
                            icon: '<i class="fas fa-check"></i>',
                            label: "Yes",
                            callback: () => resolve(true)
                        },
                        two: {
                            icon: '<i class="fas fa-times"></i>',
                            label: "No",
                            callback: () => {resolve(false)}
                        }
                    },
                    default: "two"
                }).render(true);
            });
            let result = await dialog;
            if(result === false) return;

            const zephyrStrikeAdvantage = {
                changes: [
                {
                    key: "flags.midi-qol.advantage.attack.mwak",
                    mode: 0,
                    value: 1,
                    priority: 0
                },
                {
                    key: "flags.midi-qol.advantage.attack.rwak",
                    mode: 0,
                    value: 1,
                    priority: 0
                }
                ],
                origin: lastArg.actorUuid,
                disabled: false,
                icon: lastArg.item.img,
                label: "Zephyr Strike Advantage Active",
            };
            setProperty(zephyrStrikeAdvantage, "flags.dae.specialDuration", ["1Attack"]);
            await lastArg.actor.createEmbeddedDocuments("ActiveEffect", [zephyrStrikeAdvantage]);

            const zephyrStrikeSpeed = {
                changes: [
                {
                    key: "system.attributes.movement.walk",
                    mode: 2,
                    value: 30,
                    priority: 20
                }
                ],
                origin: lastArg.actorUuid,
                disabled: false,
                icon: lastArg.item.img,
                label: "Zephyr Strike Speed Buff Active",
            };
            setProperty(zephyrStrikeSpeed, "flags.dae.specialDuration", ["turnStartSource"]);
            await lastArg.actor.createEmbeddedDocuments("ActiveEffect", [zephyrStrikeSpeed]);
		}
	}
    else if (args[0].macroPass === "postAttackRoll" && active && !lastArg.hitTargets.length){
        active.delete();
    }
	else if (args[0].macroPass === "DamageBonus") {
        if (active && lastArg.hitTargets.length > 0) {
            // Use same roll options as the one from the damageRoll
            const dmgOptions = lastArg.damageRoll?.options ? duplicate(lastArg.damageRoll.options) : {};
            dmgOptions.critical = lastArg.isCritical;
            delete dmgOptions.configured;
            delete dmgOptions.flavor;
            delete dmgOptions.criticalBonusDice;
            // Construct a DamageRoll to compute critical damage using the appropriate defined method and use the resulting formula
            const damageBonusResult = new CONFIG.Dice.DamageRoll("1d8[force]", lastArg.rollData, dmgOptions);
            return {damageRoll: damageBonusResult.formula, flavor: "Zephyr Strike Damage"};
        }
	}

	return;
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
