flags.automated-conditions-5e.aura.save.disadvantage  OVERRIDE  radius=60; enemies; fire; radiant

flags.automated-conditions-5e.aura.save.disadvantage


radius=30; allies; ['mwak', 'rwak'].includes(activity.actionType); bonus=1d4[radiant];


turn=start, label=Stormlash Aura, damageRoll=1d4, damageType=lightning, saveDC=@attributes.spell.dc, saveAbility=dex, saveDamage=halfdamage


/*
Homing Strikes. If you make an attack roll with your Psychic Blade and miss the target, you can roll one Psionic Energy
Die and add the number rolled to the attack roll. If this causes the attack to hit, the die is expended.
 */

