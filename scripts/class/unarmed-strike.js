if (args[0] === "on") {
    const attackerToken = MidiQOL.tokenForActor(macroItem.actor);

    if (lastArgValue.efData.name.toLowerCase() === 'pushed') {
        await HomebrewMacros.pushTarget(attackerToken, token, 1);
    }
    else {
        await token.actor.toggleStatusEffect('prone', {active: true});
    }
}
