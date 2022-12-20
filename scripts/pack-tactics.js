if (args[0].macroPass === "preAttackRoll") {
    if(!token || args[0].targets.length < 1) return;
    const target = args[0].targets[0].object;
    const creatures = MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.HOSTILE,target,5);
    const validCreatures = arrayRemove(creatures, token);
    const workflow = await MidiQOL.Workflow.getWorkflow(args[0].uuid);
    if(validCreatures.length === 0 || validCreatures.filter(t=>t.actor.effects.find(i=>i.label === "Incapacitated")).length === validCreatures.length) return;
    else setProperty(workflow, 'advantage', true);
}

function arrayRemove(arr, value) {
    return arr.filter(function(ele){
        return ele != value;
    });
}
