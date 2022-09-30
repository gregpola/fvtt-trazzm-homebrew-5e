const version = "0.1.0";
const optionName = "Fey Step (Spring)";

try {
	if (args[0].macroPass === "postActiveEffects") {
		let target = args[0].targets[0];
		let ttoken = canvas.tokens.get(target.object.id);

		const maxRange = 30;
        let snap = ttoken.data.width/2 === 0 ? 1 : -1
        let {x, y} = await MidiMacros.warpgateCrosshairs(ttoken, maxRange, optionName, ttoken.data.img, ttoken.data, snap)
        let pos = canvas.grid.getSnappedPosition(x-5, y-5, 1)
        await target.update(pos, {animate : false})

	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}