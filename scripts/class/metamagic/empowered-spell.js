/*
	When you roll damage for a spell, you can spend 1 sorcery point to reroll a number of the damage dice up to your
	Charisma modifier (minimum of one). You must use the new rolls.

	You can use Empowered Spell even if you have already used a different Metamagic option during the casting of the spell.
*/
const version = "12.4.0";
const optionName = "Metamagic: Empowered Spell";
const cost = 1;

try {
    if (args[0].macroPass === "DamageBonus") {
        let usesLeft = HomebrewHelpers.getAvailableSorceryPoints(actor);
        if (!usesLeft || usesLeft < cost) {
            console.log(`${optionName} - not enough Sorcery Points left`);
            return {};
        }

        // collect the damage dice details
        let rerollDataSet = new Set();
        const maxRerollDice = Math.max(actor.system.abilities.cha.mod, 1);

        let rows = "";
        for (let t of workflow.damageRoll.terms) {
            if (t instanceof Die) {
                for (let r of t.results) {
                    let dieRow = `<div><input type="checkbox" name="dieResult" style="margin-left:25px; margin-right:10px;" value=${r.result}/><label>${r.result} on a d${t.faces}</label></div>`;
                    rows += dieRow;
                    let dieData = [`d${t.faces}`, r.result, false, t.options.flavor ? `${t.options.flavor}` : null];
                    rerollDataSet.add(dieData);
                }
            }
        }

        // build the dialog content
        let content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>Do you want to spend 1 sorcery point to reroll up to ${maxRerollDice} damage dice?</label></div>
				<div id="dieRows" class="flexcol" style="margin-bottom: 10px;">
					${rows}
				</div>
			</div>
		  </form>
		`;

        // Ask which dice to reroll
        let rerollData = await foundry.applications.api.DialogV2.prompt({
            content: content,
            rejectClose: false,
            ok: {
                callback: (event, button, dialog) => {
                    let result = Array.from(rerollDataSet);
                    let spent = 0;

                    var grid = document.getElementById("dieRows");
                    var checkBoxes = grid.getElementsByTagName("INPUT");
                    for (var i = 0; i < checkBoxes.length; i++) {
                        if (checkBoxes[i].checked) {
                            result[i][2] = true;
                            spent += 1;
                        }
                    }

                    if (!spent) {
                        return false;
                    }
                    else if (spent > maxRerollDice) {
                        ui.notifications.error(`${optionName} - too many dice selected to re-roll`);
                        return false;
                    }

                    return result;
                }
            },
            window: {
                title: `${optionName}`,
            },
            position: {
                width: 500
            }
        });

        if (rerollData) {
            // perform the re-rolls
            let damageRollTerms = "";
            for (let rollItem of rerollData) {
                if (rollItem[2]) {
                    let newRoll = await new Roll(rollItem[0]).evaluate();
                    await game.dice3d?.showForRoll(newRoll);
                    let damageDiff = (newRoll.total - Number(rollItem[1]));
                    let term = `${damageDiff}` + (rollItem[3] ? `[${rollItem[3]}]` : '');
                    if (damageRollTerms.length > 0)
                        damageRollTerms += " + ";
                    damageRollTerms += term;
                }
            }

            // pay the cost
            await HomebrewHelpers.reduceAvailableSorceryPoints(actor, cost)

            // return the damage diff
            return new CONFIG.Dice.DamageRoll(`${damageRollTerms}[EmpoweredSpells]`, {}, {type:workflow.defaultDamageType, properties: [...rolledItem.system.properties]});
        }
    }

} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}
