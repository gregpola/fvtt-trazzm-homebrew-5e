const actor = game.actors.getName("name of the actor");
const points = actor.data.data.resources.primary;
const effect = actor.effects.find(i => i.data.label === "Revelation in Flesh - See Invisible");
if(!effect.data.disabled) return effect.update({disabled: true});
else if(points.value < 1) return ui.notifications.warn("You do not have enough sorcery points.");
else{
  await actor.update({"data.resources.primary.value": points.value - 1});
  await effect.update({disabled: false});
}