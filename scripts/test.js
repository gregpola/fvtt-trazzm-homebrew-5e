flags.automated-conditions-5e.aura.save.disadvantage  OVERRIDE  radius=60; enemies; fire; radiant

flags.automated-conditions-5e.aura.save.disadvantage


radius=30; allies; ['mwak', 'rwak'].includes(activity.actionType); bonus=1d4[radiant];


turn=start, label=Stormlash Aura, damageRoll=1d4, damageType=lightning, saveDC=@attributes.spell.dc, saveAbility=dex, saveDamage=halfdamage
