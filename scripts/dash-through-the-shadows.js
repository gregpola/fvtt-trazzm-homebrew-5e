const version = "0.1.0";
const optionName = "Dash through the Shadows";

try {
	if (args[0].macroPass === "preItemRoll") {
		let pcToken = token;
		let pcActor = token.actor.data.data;
		const maxRange = args[0].item.data.range.value ?? 60;
        let snap = pcToken.data.width/2 === 0 ? 1 : -1;
        let {x, y} = await MidiMacros.warpgateCrosshairs(pcToken, maxRange, optionName, pcToken.data.img, pcToken.data, snap);
        let pos = canvas.grid.getSnappedPosition(x-5, y-5, 1);
        await pcToken.document.update(pos, {animate : false});
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
