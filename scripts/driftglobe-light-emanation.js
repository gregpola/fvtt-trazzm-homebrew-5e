const version = "10.0.0";
const optionName = "Driftglobe Light Emanation";
const lightingFlagName = "driftglobe-light";

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	let actorToken = canvas.tokens.get(lastArg.tokenId);
	
	if (args[0] === "on") {
		// get and stash the current data
		var tokenLighting = actorToken.document.light;
		DAE.setFlag(actor, lightingFlagName, {
			name : optionName,
			lightDim: tokenLighting.dim,
			lightBright: tokenLighting.bright,
			lightAngle: tokenLighting.angle,
			lightAlpha: tokenLighting.alpha,
			lightColor: tokenLighting.color,
			lightAnimationIntensity: tokenLighting.animation.intensity,
			lightAnimationSpeed: tokenLighting.animation.speed,
			lightAnimationType: tokenLighting.animation.type
		});

		// set the token lighting
		actorToken.document.update({
			"light.dim": 40, 
			"light.bright": 20, 
			"light.angle": 360, 
			"light.alpha": 0.25,
			"light.color": "#ffffff",			
			"light.animation": {
				"type": "pulse",
				"speed": 3,
				"intensity": 1
			}
		});
		
	}
	else if (args[0] === "off") {
		// reset the token lighting
		let flag = DAE.getFlag(actor, lightingFlagName);
		if (flag) {
			actorToken.document.update({
				"light.dim": flag.lightDim, 
				"light.bright": flag.lightBright, 
				"light.angle": flag.lightAngle, 
				"light.alpha": flag.lightAlpha,
				"light.color": flag.lightColor,			
				"light.animation": {
					"type": flag.lightAnimationType,
					"speed": flag.lightAnimationSpeed,
					"intensity": flag.lightAnimationIntensity
				}			
			});
			DAE.unsetFlag(actor, lightingFlagName);
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
