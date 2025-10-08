import { CronJob } from "cron";
import config from "../config.js";

const CATEGORY_CREATOR_ID = config.categories.creatorProjects;
const CHANNEL_ADMIN_ID = config.channels.administration;

export function startAbandonedProjectCheck(client) {
  // ────────────────
  // 🕐 Tâche planifiée : tous les jours à 10h (heure du serveur)
  // ────────────────
  const job = new CronJob("0 10 * * *", async () => {
    try {
      const guild = client.guilds.cache.first();
      if (!guild) return console.error("❌ Impossible de trouver le serveur principal.");

      const category = guild.channels.cache.get(CATEGORY_CREATOR_ID);
      if (!category || category.type !== 4) { // 4 = GuildCategory
        console.error("❌ Catégorie introuvable ou type incorrect.");
        return;
      }

      const modChannel = guild.channels.cache.get(CHANNEL_ADMIN_ID);
      if (!modChannel) {
        console.error("❌ Salon de modération introuvable.");
        return;
      }

      console.log("🔎 Vérification quotidienne des projets abandonnés...");

      const now = Date.now();
      const oneMonth = 30 * 24 * 60 * 60 * 1000;
      let inactiveCount = 0;

      // Parcourt tous les salons textuels de la catégorie
      for (const channel of category.children.cache.values()) {
        if (channel.type !== 0) continue; // 0 = GuildText

        // Récupère le dernier message
        const messages = await channel.messages.fetch({ limit: 1 }).catch(() => null);
        if (!messages || messages.size === 0) continue;

        const lastMessage = messages.first();
        const lastTimestamp = lastMessage.createdTimestamp;

        // Vérifie l'ancienneté
        if (now - lastTimestamp > oneMonth) {
          inactiveCount++;
          const days = Math.floor((now - lastTimestamp) / (1000 * 60 * 60 * 24));

          await modChannel.send({
            content: `⚠️ **Projet inactif détecté !**  
Salon : ${channel}  
Dernier message : <t:${Math.floor(lastTimestamp / 1000)}:R> (${days} jours)  
Lien : https://discord.com/channels/${guild.id}/${channel.id}`,
          });
        }
      }

      console.log(`✅ Vérification terminée : ${inactiveCount} salon(s) inactif(s) signalé(s).`);
    } catch (error) {
      console.error("❌ Erreur lors du check des projets abandonnés :", error);
    }
  });

  job.start();
  console.log("🕐 Tâche planifiée : vérification journalière des projets abandonnés activée.");
}
