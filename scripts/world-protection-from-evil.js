Hooks.on("midi-qol.preAttackRoll", function (workflow) {
  let targetActor = workflow.targets.first().actor;
  let effect = typeof targetActor.data.effects.find(i=> i.data.label === "Protection from Good and Evil" || i.data.label === "Protection from Evil and Good") !== undefined;
  let attackerType = ["aberration", "celestial", "elemental", "fey", "fiend", "undead"].includes(workflow.actor.data.data.details?.type?.value);
  if(!(effect && attackerType)) return {};
  workflow.disadvantage = true;
});
