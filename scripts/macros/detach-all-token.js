let token = canvas.tokens.controlled[0];
if (token) {
    let attachers = tokenAttacher.getAllAttachedElementsOfToken(token);
    for (let attacher of attachers['Token']) {
        let tok = canvas.tokens.get(attacher);
        if (tok) {
            await tokenAttacher.detachElementFromToken(tok, token);
            await tokenAttacher.detachElementFromToken(token, tok);
        }
    }
}
