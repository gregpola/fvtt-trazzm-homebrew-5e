class HomebrewMacros {

    /**
     *
     * @param {Token} actorToken Source of the crosshairs
     * @param {Number} maxRange the maximum allowed range
     * @param {Item} item the item for which the function is called
     * @param {Token} targetToken the token that is being moved
     * @returns
     */
    static async warpgateCrosshairs(actorToken, maxRange, item, targetToken) {
        const tokenCenter = actorToken.center;
        let cachedDistance = 0;

        let texture = targetToken.texture.src;
        if (!texture)
            texture = targetToken.document.texture.src;

        const checkDistance = async(crosshairs) => {
            while (crosshairs.inFlight) {
                //wait for initial render
                await warpgate.wait(100);
                const ray = new Ray( tokenCenter, crosshairs );
                const distance = canvas.grid.measureDistances([{ray}], {gridSpaces:true})[0]

                //only update if the distance has changed
                if (cachedDistance !== distance) {
                    cachedDistance = distance;
                    if(distance > maxRange) {
                        crosshairs.icon = 'icons/svg/hazard.svg';
                    } else {
                        crosshairs.icon = texture;
                    }

                    crosshairs.draw();
                    crosshairs.label = `${distance} ft`;
                }
            }
        };

        const callbacks = {
            show: checkDistance
        };

        const config = {
            drawIcon: true,
            interval: targetToken.width % 2 === 0 ? 1 : -1,
            size: targetToken.width / canvas.grid.size
        };

        if (typeof item !== 'undefined') {
            config.drawIcon = true;
            config.icon = item.img;
            config.label = item.name;
        }

        const position = await warpgate.crosshairs.show(config, callbacks);

        if (position.cancelled) return false;
        if (cachedDistance > maxRange) {
            ui.notifications.error(`${name} has a maximum range of ${maxRange} ft.`)
            return false;
        }
        return position;
    }

    static checkPosition(newX, newY) {
        const hasToken = canvas.tokens.placeables.some(t => {
            const detectX = newX.between(t.document.x, t.document.x + canvas.grid.size * (t.document.width-1));
            const detectY = newY.between(t.document.y, t.document.y + canvas.grid.size * (t.document.height-1));
            return detectX && detectY;
        });
        return hasToken;
    }

}