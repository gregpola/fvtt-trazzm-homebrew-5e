const version = "10.0.0";
const optionName = "Misty Step";

try {
	if (args[0].macroPass === "preItemRoll") {
		let pcToken = token;
		const maxRange = args[0].item.range.value ?? 30;
        let snap = pcToken.width/2 === 0 ? 1 : -1
        let {x, y} = await MidiMacros.warpgateCrosshairs(pcToken, maxRange, optionName, pcToken.data.img, pcToken.data, snap)
        let pos = canvas.grid.getSnappedPosition(x-5, y-5, 1)
        await pcToken.document.update(pos, {animate : true})
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
