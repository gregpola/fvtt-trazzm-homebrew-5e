/*
    As a Magic action, you present your Holy Symbol and expend a use of your Channel Divinity to evoke healing energy
    that can restore a number of Hit Points equal to five times your Cleric level. Choose Bloodied creatures within 30
    feet of yourself (which can include you), and divide those Hit Points among them. This feature can restore a
    creature to no more than half its Hit Point maximum.
 */
const optionName = "Preserve Life";
const version = "12.4.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const clericLevel = actor.classes.cleric?.system.levels ?? 0;
        const totalHealing = clericLevel * 5;

        if (totalHealing > 0 && workflow.targets.size > 0) {
            // filter targets by bloodied condition before asking heal amounts
            let rows = "";
            for (let targetToken of workflow.targets) {
                if (targetToken.actor.statuses.has("bloodied")) {
                    let half = Math.ceil(targetToken.actor.system.attributes.hp.max / 2);
                    let eligible = ((half > targetToken.actor.system.attributes.hp.value) ? (half - targetToken.actor.system.attributes.hp.value) : 0);
                    let recipientMax = Math.min(totalHealing, eligible);

                    let row = `<div class="flexrow" style="margin-bottom: 5px;"><label style="margin-right: 10px;">${targetToken.name}</label>`
                        + `<input name="target" id="${targetToken.id}" type="number" min="0" max="${recipientMax}" step="1" value="0"/>`
                        + `<label style="margin-left: 10px;">(max: ${recipientMax})</label>`
                        + `</div>`;
                    rows += row;
                }
            }

            if (rows.length > 0) {
                // build the dialog content
                let content = `
                  <form>
                    <div class="flexcol">
                        <div class="flexrow" style="margin-bottom: 10px;"><label>Distribute the ${totalHealing} healing available:</label></div>
                        <div id="targetRows" class="flexcol"style="margin-bottom: 10px;">
                            ${rows}
                        </div>
                    </div>
                  </form>`;

                let targetData = await foundry.applications.api.DialogV2.prompt({
                    window: {title: `${optionName}`},
                    content: content,
                    ok: {
                        label: "Heal",
                        callback: (event, button, dialog) => {
                            let spent = 0;
                            let resultData = [];

                            for (let healTarget of button.form.elements.target) {
                                let targetMax = Number(healTarget.max);
                                let targetHeal = Math.min(healTarget.valueAsNumber, targetMax);
                                if (targetHeal > 0) {
                                    spent += targetHeal;

                                    // get the target token
                                    let targetToken = canvas.tokens.get(healTarget.id);
                                    if (targetToken) {
                                        resultData.push({target: targetToken, healing: targetHeal});
                                    }
                                }
                            }

                            if (spent > totalHealing) {
                                ui.notifications.error(`${optionName}: too much healing distributed`);
                                return undefined;
                            }

                            return resultData;
                        }
                    }
                });

                if (targetData) {
                    for (let td of targetData) {
                        let healAmount = td.healing;
                        let damageRoll = await new CONFIG.Dice.DamageRoll(`${healAmount}`, {}, {type: "healing", properties: ["mgc"]}).evaluate();
                        await new MidiQOL.DamageOnlyWorkflow(actor, token, null, null, [td.target], damageRoll, {
                            flavor: optionName,
                            itemCardId: args[0].itemCardId,
                            itemData: macroItem.toObject()
                        });
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
