for (let token of canvas.scene.tokens) {
    await token.update({
        displayBars: 30,
        displayName: 30
    });
}
