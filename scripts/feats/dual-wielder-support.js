const version = "11.1";
const optionName = "Dual Wielder";
console.log(`${optionName} - checking AC bonus applicability`);

let getsACBonus = true;

let currentWeapons = actor.items.filter(i => (i.type === `weapon`) && i.system.equipped && i.system.actionType === "mwak");
if (currentWeapons.length < 2) {
    console.log(`${optionName} - no AC bonus, not enough weapons equipped`);
    getsACBonus = false;
}

if (currentWeapons.length > 2) {
    console.log(`${optionName} - no AC bonus, too many weapons equipped`);
    getsACBonus = false;
}

// make sure both weapons are appropriate
const firstWeapon = currentWeapons[0];
const secondWeapon = currentWeapons[0];

if (firstWeapon.system.properties.has('two') || secondWeapon.system.properties.has('two')) {
    console.log(`${optionName} - no AC bonus, weapon is two handed`);
    getsACBonus = false;
}

const acBonus = getsACBonus ? "1" : "0";
const effectData = {
    changes: [{ key: 'system.attributes.ac.bonus', value: acBonus, mode: 2 }]
}
const updatedEffect = duplicate(effect);
updatedEffect.changes = effectData.changes;
await MidiQOL.socket().executeAsGM("updateEffects", {actorUuid:actor.uuid, updates:[{"_id":effect.id, changes:updatedEffect.changes}]});
