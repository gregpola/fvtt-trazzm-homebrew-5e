if (macroActivity && macroActivity.targets) {
    let targetToken = macroActivity.targets.first();
    if (targetToken) {
        await new Portal()
            .color("#ff0000")
            .texture("icons/svg/target.svg")
            .origin(targetToken)
            .range(5)
            .teleport();
    }
}
