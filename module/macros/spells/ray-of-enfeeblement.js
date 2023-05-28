/*

 */
const optionName = "Ray of Enfeeblement";
const version = "10.0";

export async function rayOfEnfeeblement({speaker, actor, token, character, item, args}) {
    if (this.isFumble || this.item.type != 'weapon') return;
    if (this.item.system.properties?.fin) {
        let str = this.actor.system.abilities.str.value;
        let dex = this.actor.system.abilities.dex.value;
        if (str < dex) return;
    }

    // half all the applied damages
    this.damageList.forEach(function (item, index) {
        item.totalDamage = Math.floor(item.totalDamage / 2);
        item.appliedDamage = Math.floor(item.appliedDamage / 2);
        item.hpDamage = Math.floor(item.hpDamage / 2);
    });
}
