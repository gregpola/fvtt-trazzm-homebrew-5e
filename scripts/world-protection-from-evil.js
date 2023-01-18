const version = "10.0.1";

Hooks.on("midi-qol.preAttackRoll", function (workflow) {
  let targetActor = workflow.targets.first().actor;
  let effect = targetActor.effects.find(i=> i.label === "Protection from Good and Evil" || i.label === "Protection from Evil and Good");
  if (effect !== undefined) {
	let attackerType = ["aberration", "celestial", "elemental", "fey", "fiend", "undead"].includes(workflow.actor.system.details?.type?.value);
	if(attackerType) {
		workflow.disadvantage = true;
	}
  }
});
