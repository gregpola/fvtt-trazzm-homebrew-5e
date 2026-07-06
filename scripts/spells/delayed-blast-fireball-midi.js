// Delayed Blast Fireball — DAE macro + preTargeting + postActiveEffects macro
// DAE macroRepeat (endEveryTurn): "on" (applied), "each" (end of turn), "off" (removed)
// preTargeting: args[0].macroPass = "preTargeting" — auto-target from placed template
// postActiveEffects: args[0].macroPass = "postActiveEffects" — cleanup after manual trigger

function findBeadTemplates(itemUuid) {
    return canvas.scene.templates.filter(t => {
        const origin = t.flags?.dnd5e?.origin ?? "";
        return origin.startsWith(itemUuid);
    });
}

if (args[0] === "on") {
    await actor.setFlag("midi-qol", "delayedBlastFireball", 0);
    const theItem = actor.items.find(i => i.system?.identifier === "delayed-blast-fireball");
    if (theItem) {
        const hookId = Hooks.on("preDeleteMeasuredTemplate", async (template, options, userId) => {
            const origin = template.flags?.dnd5e?.origin ?? "";
            if (!origin.startsWith(theItem.uuid)) return;
            const accumulated = actor.getFlag("midi-qol", "delayedBlastFireball");
            if (accumulated === undefined) return;
            // Capture template center before selectTargetsFromTemplates may clean up the placeable
            const center = template.object?.center ?? { x: template.x, y: template.y };
            const coverOrigin = { x: center.x, y: center.y, elevation: template.elevation };
            // Select targets from template before it's deleted
            MidiQOL.selectTargetsFromTemplates([template]);
            const targetUuids = Array.from(game.user.targets).map(t => t.document.uuid);
            await actor.unsetFlag("midi-qol", "delayedBlastFireball");
            if (targetUuids.length === 0) return;
            const activity = theItem.system.activities.find(a => a.identifier === "trigger-explosion");
            if (activity) {
                await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids, workflowOptions: { coverOrigin, templateUuid: template.uuid }, proceedChecks: { callMacros: false, checkReaction: false, checkBonusAction: false } } });
            }
        });
        globalThis._midiDBFHooks = globalThis._midiDBFHooks || {};
        globalThis._midiDBFHooks[actor.uuid] = hookId;
    }
} else if (args[0] === "each") {
    const current = actor.getFlag("midi-qol", "delayedBlastFireball") ?? 0;
    await actor.setFlag("midi-qol", "delayedBlastFireball", current + 1);
    ChatMessage.create({
        content: `<strong>Delayed Blast Fireball</strong>: The bead's energy intensifies. Total damage: ${12 + current + 1}d6 fire.`,
        speaker: ChatMessage.getSpeaker({actor}),
        whisper: game.users.filter(u => actor.testUserPermission(u, "OWNER")).map(u => u.id)
    });
} else if (args[0] === "off") {
    // Clean up: deregister hook and clear flag
    const hookId = globalThis._midiDBFHooks?.[actor.uuid];
    if (hookId !== undefined) {
        Hooks.off("preDeleteMeasuredTemplate", hookId);
        delete globalThis._midiDBFHooks[actor.uuid];
    }
    if (actor.getFlag("midi-qol", "delayedBlastFireball") !== undefined) {
        await actor.unsetFlag("midi-qol", "delayedBlastFireball");
    }
} else if (args[0]?.macroPass === "preTargeting") {
    const wf = args[0].workflow;
    const act = wf.activity;
    if (act?.identifier === "trigger-explosion" || act?.name === "Trigger Explosion") {
        const templates = findBeadTemplates(wf.item.uuid);
        if (templates.length > 0) {
            MidiQOL.selectTargetsFromTemplates(templates);
        } else {
            ui.notifications.warn("Delayed Blast Fireball: No bead template found on the scene.");
        }
    }
} else if (args[0]?.macroPass === "postActiveEffects") {
    // After manual Trigger Explosion, clean up the flag so hook won't re-trigger
    const act = args[0].workflow?.activity;
    if (act?.identifier === "trigger-explosion" || act?.name === "Trigger Explosion") {
        if (actor.getFlag("midi-qol", "delayedBlastFireball") !== undefined) {
            await actor.unsetFlag("midi-qol", "delayedBlastFireball");
        }
    }
}