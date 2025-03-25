/*
    You gain the following benefits:

        * When you take the Attack action and attack with only a glaive, halberd, quarterstaff, or spear, you can use a
            bonus action to make a melee attack with the opposite end of the weapon. This attack uses the same ability
            modifier as the primary attack. The weapon’s damage die for this attack is a d4, and it deals bludgeoning damage.

        * While you are wielding a glaive, halberd, pike, quarterstaff, or spear, other creatures provoke an opportunity
            attack from you when they enter the reach you have with that weapon.
*/
const version = "11.0";
const optionName = "Polearm Master";
const eligibleWeaponTypes = ["glaive", "halberd", "pike", "quarterstaff", "spear"];

try {
    if (args[0] === "on") {
        ui.notifications.error(`${optionName}: Opportunity Attack provoked`);

    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
