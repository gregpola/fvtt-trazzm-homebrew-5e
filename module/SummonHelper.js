const successChanceText = "% chance of success";

export class SummonHelper {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering SummonHelper");
        SummonHelper.hooks();
    }

    static hooks() {
        Hooks.on("dnd5e.preSummon", (activity, profile, options) => {
            // return false to stop summon

            // check for summon failure chance
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////

            if (profile) {
                const chanceIndex = profile.name.toLowerCase().indexOf(successChanceText);
                if (chanceIndex > 0) {
                    let leadingText = profile.name.substring(0, chanceIndex).trimEnd();
                    let percentText = leadingText.substring(leadingText.lastIndexOf(" ") + 1);
                    if (isNaN(percentText)) {
                        ui.notifications.error("Success chance for summons is not a number!");
                        return false;
                    }

                    const successChance = Number(percentText);
                    let chanceRoll = Math.floor(Math.random() * 100);
                    logger.info("preSummon success roll = %d", chanceRoll);
                    if (chanceRoll >= successChance) {
                        ChatMessage.create({
                            speaker: ChatMessage.getSpeaker({actor: activity.actor}),
                            content: 'Failed their attempt to summon'
                        });
                        activity.actor.setFlag("fvtt-trazzm-homebrew-5e", "summon-failed", true);

                        return false;
                    }
                }
            }

            return true;
        });
    }
}
