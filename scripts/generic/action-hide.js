/*
    When you take the Hide action, you make a Dexterity (Stealth) check in an attempt to hide, following the rules for
    hiding. If you succeed, you gain certain benefits, as described in the "Unseen Attackers and Targets" section later
    in this chapter.
 */
const version = "12.3.0";
const optionName = "Hide Action";

try {
    await actor.rollSkill("ste");
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

