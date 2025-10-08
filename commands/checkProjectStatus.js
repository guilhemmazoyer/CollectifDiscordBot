import { SlashCommandBuilder } from "discord.js";
import config from "../config.js";

const CATEGORY_CREATOR_ID = config.categories.creatorProjects; // Catégorie des projets
const ADMIN_ROLE_ID = config.roles.admin; // Rôle admin autorisé

export const data = new SlashCommandBuilder()
  .setName("check-project-status")
  .setDescription("📊 Vérifie l'activité des salons de projets dans la catégorie créateurs.");

export async function execute(interaction) {
  try {
    // Vérifie que l'utilisateur a le rôle admin
    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
      return await interaction.reply({
        content: "🚫 Vous n'avez pas la permission d'utiliser cette commande.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });
    const guild = interaction.guild;
    const category = guild.channels.cache.get(CATEGORY_CREATOR_ID);

    if (!category || category.type !== 4) { // 4 = Category
      return await interaction.editReply("❌ Catégorie de projets introuvable ou invalide.");
    }

    const now = Date.now();
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    const statusLines = [];

    for (const channel of category.children.cache.values()) {
      if (channel.type !== 0) continue; // 0 = salon textuel

      // Récupère le dernier message du salon
      const messages = await channel.messages.fetch({ limit: 1 }).catch(() => null);
      let lastMsgInfo = "Aucun message";
      let statusEmoji = "🟢";

      if (messages && messages.size > 0) {
        const lastMessage = messages.first();
        const days = Math.floor((now - lastMessage.createdTimestamp) / (1000 * 60 * 60 * 24));

        if (days > 30) {
          statusEmoji = "🔴";
          lastMsgInfo = `inactif (${days} j)`;
        } else {
          statusEmoji = "🟢";
          lastMsgInfo = `actif (${days} j)`;
        }
      }

      // Une ligne par salon
      statusLines.push(`${statusEmoji} ${channel} — ${lastMsgInfo}`);
    }

    if (statusLines.length === 0) {
      return await interaction.editReply("⚠️ Aucun salon de projet trouvé dans la catégorie.");
    }

    // Envoie le rapport sous forme de texte condensé
    const report = `📊 **État des projets :**\n\n${statusLines.join("\n")}`;
    await interaction.editReply(report);

    console.log(`📈 Rapport de ${interaction.user.tag} - ${statusLines.length} projets analysés.`);
  } catch (error) {
    console.error("❌ Erreur dans /check-project-status :", error);
    await interaction.editReply("⚠️ Une erreur est survenue lors de l'analyse des projets.");
  }
}
