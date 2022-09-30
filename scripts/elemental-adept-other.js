const version = "0.1.0";
const elemType = "Cold";
try {
	const itemD = await fromUuid(args[0].itemUuid);
	if (itemD.labels.damageTypes.includes(elemType) || Array.from(args[0].targets)[0].actor.data.data.traits.dr.value.includes("cold"))
		console.log("hasCold");
	if(!itemD.labels.damageTypes.includes(elemType) && !Array.from(args[0].targets)[0].actor.data.data.traits.dr.value.includes("cold")) {
		console.log('no Cold');
		return;
	}
	if(args[0].macroPass === "preDamageRoll") {
		const effectUpdate = {
			changes:[{
				key: 'ATL.light.dim',
				mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
				value: "40"
			}],
			label: 'Elemental Adept ${}',
			icon: "icons/svg/aura.svg",
			transfer: false,
			flags: {dae: { specialDuration: ['isHit']} }
		}
		await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].targetUuids[0], effects: [effectUpdate] });
	}
	
} catch (err) {
    console.error(`Elemental Adept ${elemType} ${version}`, err);
}
