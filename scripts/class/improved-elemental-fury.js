/*
    Potent Spellcasting. When you cast a Druid cantrip with a range of 10 feet or greater, the spell's range increases by 300 feet.
 */

+((item.itemType==="spell" && item.sourceClass==="druid" && item.level===0 && item.range.value > 10) ? 300 - item.range.value : 0)
