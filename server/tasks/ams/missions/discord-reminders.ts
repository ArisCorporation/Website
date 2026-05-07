import { defineTask } from "nitropack/runtime";
import { sendPendingMissionReminderDms } from "../../../utils/ams-discord-mission-reminders";

export default defineTask({
  meta: {
    name: "ams:missions:discord-reminders",
    description: "Versendet Discord-DM-Erinnerungen an Missions-Teilnehmer kurz vor Missionsstart.",
  },
  async run() {
    const config = useRuntimeConfig();
    const environment = String(config.public.ENVIRONMENT || "DEVELOPMENT").toUpperCase();

    if (environment !== "PRODUCTION") {
      return {
        result: {
          skipped: true,
          reason: "non-production-environment",
        },
      };
    }

    return {
      result: await sendPendingMissionReminderDms({
        botToken: config.discordBotToken,
        siteUrl: config.public.SITE_URL,
      }),
    };
  },
});
