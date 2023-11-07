/*
	Each object in a 20-foot cube within range is outlined in blue, green, or violet light (your choice). Any creature in
	the area when the spell is cast is also outlined in light if it fails a Dexterity saving throw. For the duration,
	objects and affected creatures shed dim light in a 10-foot radius.

	Any attack roll against an affected creature or object has advantage if the attacker can see it, and the affected
	creature or object can’t benefit from being invisible.
*/
const version = "11.0";
const optionName = "Faerie Fire";

try {
	let target = canvas.tokens.get(lastArgValue.tokenId)

	if (args[0] === "on") {
		new Dialog({
			title: `Choose the color of Faerie Fire outline`,
			buttons: {
				one: {
					label: "Blue",
					callback: async () => {
						let color = target.data.lightColor ? target.data.lightColor : "";
						let dimLight = target.data.dimLight ? target.data.dimLight : "0"
						await DAE.setFlag(target, 'FaerieFire', {
							color: color,
							alpha: target.data.lightAlpha,
							dimLight: dimLight
						});
						target.update({ "lightColor": "#5ab9e2", "lightAlpha": 0.64, "dimLight": "10", "lightAnimation.intensity" : 3 })
					}
				},
				two: {
					label: "Green",
					callback: async () => {
						let color = target.data.lightColor ? target.data.lightColor : "";
						let dimLight = target.data.dimLight ? target.data.dimLight : "0"
						await DAE.setFlag(target, 'FaerieFire', {
							color: color,
							alpha: target.data.lightAlpha,
							dimLight: dimLight
						});
						target.update({ "lightColor": "#55d553", "lightAlpha": 0.64, "dimLight": "10","lightAnimation.intensity" : 3  })
					}
				},
				three: {
					label: "Purple",
					callback: async () => {
						let color = target.data.lightColor ? target.data.lightColor : "";
						let dimLight = target.data.dimLight ? target.data.dimLight : "0"
						await DAE.setFlag(target, 'FaerieFire', {
							color: color,
							alpha: target.data.lightAlpha,
							dimLight: dimLight
						});
						target.update({ "lightColor": "#844ec6", "lightAlpha": 0.64, "dimLight": "10","lightAnimation.intensity" : 3  })
					}
				}
			}
		}).render(true);
	}

	if (args[0] === "off") {
		let { color, alpha, dimLight } = await DAE.getFlag(target, "FaerieFire")
		target.update({ "lightColor": color, "lightAlpha": alpha, "dimLight": dimLight })
		DAE.unsetFlag(actor, "FaerieFire")
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
