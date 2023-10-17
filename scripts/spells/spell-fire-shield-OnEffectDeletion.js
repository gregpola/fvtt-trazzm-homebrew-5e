Hooks.off("updateActor", game.FireShieldHookClientSpecificId);
const effectSecondary = token.actor.effects.find(eff=>eff.getFlag('core','statusId').includes("Fire Shield"));
await effectSecondary?.delete();