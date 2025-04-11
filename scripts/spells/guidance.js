/*
    You touch a willing creature and choose a skill. Until the spell ends, the creature adds 1d4 to any ability check using the chosen skill.
*/
const version = "12.4.0";
const optionName = "Guidance";

try {
    if (args[0].macroPass === "postActiveEffects") {
        if (!workflow.hitTargets.size) return {};

        // ask which skill to buff
        let skillOptions = '';
        for (let [key, {label}] of Object.entries(CONFIG.DND5E.skills)) {
            skillOptions += `<option value="${key}">${label}</option>`;
        }

        const content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>Select the skill to buff:</label></div>
                <div class="form-fields">
                    <select id="skillSelect">${skillOptions}</select>
                </div>
			</div>
		  </form>`;

        let skillChoice = await foundry.applications.api.DialogV2.prompt({
            content: content,
            rejectClose: false,
            ok: {
                callback: (event, button, dialog) => {
                    return button.form.elements.skillSelect.value;
                }
            },
            window: {
                title: `${optionName}`,
            },
            position: {
                width: 400
            }
        });

        if (skillChoice) {
            for (let targetToken of workflow.targets) {
                await applyBuff(targetToken, skillChoice);
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyBuff(targetToken, skill) {
    let effectData = {
        name: `${optionName} ${skill}`,
        icon: item.img,
        origin: item.uuid,
        changes: [
            {
                key: `system.skills.${skill}.bonuses.check`,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: '1d4',
                priority: 20
            }
        ],
        duration: {
            seconds: 60
        }
    };

    let newEffect = await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetToken.actor.uuid, effects: [effectData]});
    let existingConcentration = MidiQOL.getConcentrationEffect(actor, item);
    if (existingConcentration) {
        await MidiQOL.socket().executeAsGM('addDependent', {concentrationEffectUuid: existingConcentration.uuid, dependentUuid: newEffect[0].uuid});
    }
}
