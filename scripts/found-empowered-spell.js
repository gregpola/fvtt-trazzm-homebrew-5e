/**
 * This macro let sorcerers reroll their damage consuming 1 sorcery point. This macro strongly depends on midi-qol module to get the rolled damage dice and the dice formula of the spell cast. It gets the last chat message of "type" spell and parses the html of that card (you can add a check to verify if the actual actor id is the same that cast that spell by comparing the data-actor-id of the chat message with the actual id)
 */
 

console.log("EMPOWER SPELL MACRO",args)

if(args[0] !== 'on') return
console.log(actor)
if(!args[4]){
   ui.notifications.error("No target selected")
   return
}

let target = canvas.tokens.get(args[4])
let player = args[2]

if(!player){
   ui.notifications.error("No player selected")
   return
} else {
  //check for residual sorcery points
  if(player.data.resources.primary.value < 1) {
   ui.notifications.info("You have no sorcery points left")
return
  }
}

let chaMod = player.data.abilities.cha.mod
console.log(target, chaMod)

/* parse the spell card to get the damage dice and the dice formula
** - damage dice are needed to let the player choose which ones he want to reroll and to consequently re-apply the amount of
** damage chosen to the target residual HP value
** - dice formula is needed to reroll dice with the same formula used before 
**
*/
const lastDamageRolls = $('.midi-qol-item-card[data-spell-level]').last().find('.midi-qol-damage-roll').find('.roll.die')
const diceFormula = $('.midi-qol-item-card[data-spell-level]').last().find('.midi-qol-damage-roll').find('.dice-formula')
console.log(lastDamageRolls, diceFormula)
let inputs = `<form><div class="form-group">`
lastDamageRolls.each(function(index,obj) {
console.log($(obj))
  inputs += `<input class="empower-dice-selection" type="checkbox" name="emp_dice_selection" value="`+$(obj).html()+`">`+$(obj).html()+`<br>`
})

inputs  += `</div></form>`

var limit = chaMod;
// set a limit to the number of dice the sorcerer can change based on his/her charisma modifier
$('input.empower-dice-selection').on('change', function(evt) {
   if($(this).siblings(':checked').length >= limit) {
       this.checked = false;
   }
});


new Dialog({
  title: `Select Dice to Reroll`,
  content: inputs ,
  buttons: {
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: `Apply`,
      callback: async (html) => {
        let result = $('input.empower-dice-selection')
        console.log("DICE TO REROLL",result )
        let selected = []
        let healthToReturn = 0
        let numberOfDiceToRoll = 0        
        result.each(function(index, obj) {
          console.log($(obj).is(':checked'))
          if($(obj).is(':checked')){
             selected.push($(obj))
             healthToReturn += parseInt($(obj).val())
             numberOfDiceToRoll++
          }
        })
        // calculate hp points based on the player choice
        let newHealth = healthToReturn + target.actor.data.data.attributes.hp.value
        if(newHealth > target.actor.data.data.attributes.hp.max) {
           newHealth = target.actor.data.data.attributes.hp.max
        }
        let array = $(diceFormula).html().split("d")
        let die = array[1]
        console.log(array)
        if(!die){
          ui.notifications.error("Spell's dice formula not found")
        }
        // apply hp to the target
        await target.actor.update({"data.attributes.hp.value": newHealth})
        let message = await new Roll(`${numberOfDiceToRoll}d${die}`).roll().toMessage({ flavor: `${player.name} empowers the spell!`, speaker})
        console.log(message._roll._total)

        // check for the new rolled value to apply the new damage amount and then consume 1 sorcery point 
        if(message && message._roll && message._roll._total) {
           let damage = message._roll._total
           let health = target.actor.data.data.attributes.hp.value
           let subtractedHealth = health - damage < 0 ? 0 : health - damage
//           target.actor.data.data.attributes.hp.value = subtractedHealth
           await target.actor.update({"data.attributes.hp.value": subtractedHealth})
           await actor.update({"data.resources.primary.value": actor.data.data.resources.primary.value -1})
           //actor.data.data.resources.primary.value = actor.data.data.resources.primary.value -1
        }


      }
    },
    no: {
      icon: "<i class='fas fa-times'></i>",
      label: `Cancel`
    },
  },
  default: "yes"
}).render(true);