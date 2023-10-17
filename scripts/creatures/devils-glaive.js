/*
	Melee Weapon Attack: +5 to hit, reach 10 ft., one target. Hit: 8 (1d10 + 3) slashing damage. If the target is a creature other than an undead or a construct, it must succeed on a DC 12 Constitution saving throw or lose 5 (1d10) hit points at the start of each of its turns due to an infernal wound. Each time the devil hits the wounded target with this attack, the damage dealt by the wound increases by 5 (1d10). Any creature can take an action to stanch the wound with a successful DC 12 Wisdom (Medicine) check. The wound also closes if the target receives magical healing.
 */
const optionName = "Devil's Glaive";
const version = "10.0.11";

try {
    const lastArg = args[args.length - 1];

    if (args[0] === "on") {
        let target = canvas.tokens.get(args[3]);
        let flag = DAE.getFlag(target, "infernal-wounds") || {
            hookId: 0,
            woundCount: 0,
			effectId: lastArg.efData._id
        };
        console.error("fetching flag ", target.id, flag);
        flag.woundCount = flag.woundCount + 1;
        if (!flag.hookId) {
            console.error("hookId not set");
            flag.hookId = Hooks.on("deleteActiveEffect", (actor, effectId) => {
                console.error("Resetting wound count");
                if (effectId === lastArg.effectId)
                    DAE.unsetFlag(tactor, "infernal-wounds");
            })
        }
        DAE.setFlag(target, "infernal-wounds", flag);

    } else if (args[0] === "each") {
        let tactor;
        let ttoken = canvas.tokens.get(lastArg.tokenId);
        if (ttoken)
            tactor = ttoken.actor;
        else
            tactor = game.actors.get(lastArg.actorId);
		
        let damageItem = Item.createOwned(game.items.getName("Infernal Wound"), tactor);
        let saveTargets = game.user.targets;
        game.user.targets = new Set([ttoken]);
        let hookId = Hooks.once("midi-qol.RollComplete", (workflow) => {
            if (workflow.saves.has(ttoken)) {
                tactor.deleteEmbeddedEntity("ActiveEffect", lastArg.efData._id);
            }
        });
		
		try {
			damageItem.roll();
			let flag = DAE.getFlag(ttoken, "infernal-wounds") || {
				hookId: 0,
				woundCount: 1,
				effectId: lastArg.efData._id
			};
		} finally {
			game.user.targets = saveTargets;
		}
		
    } else if (args[0] === "off") {
    }
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
