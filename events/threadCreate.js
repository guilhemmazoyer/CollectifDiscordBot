import config from "../config.js";

const BILLBOARD_TICKET_ID = config.channels.billboardTicket;
const CHANNEL_ADMIN_ID = config.channels.administration;

export const name = "threadCreate";

export async function execute(thread) {
  try {
    // Vérifie que le thread vient du bon forum
    if (thread.parentId !== BILLBOARD_TICKET_ID) return;

    // Récupère le message de départ du thread (le post original)
    const starterMessage = await thread.fetchStarterMessage();
    if (!starterMessage) {
      console.warn(`⚠️ Impossible de récupérer le message initial pour ${thread.name}`);
      return;
    }

    const content = starterMessage.content || "";
    const author = starterMessage.author;
    const guild = thread.guild;

    // Motifs obligatoires : "La tâche :", "Le temps :", "La contrepartie :", "Le livrable :"
    const patterns = [
      { key: "La tâche", regex: /\b(t[âa]che)\s*:\s*.+/i },
      { key: "Le temps", regex: /\b(temps)\s*:\s*.+/i },
      { key: "La contrepartie", regex: /\b(contrepartie)\s*:\s*.+/i },
      { key: "Le livrable", regex: /\b(livrable)\s*:\s*.+/i },
    ];

    const missing = patterns
      .filter(p => !p.regex.test(content))
      .map(p => p.key);

    if (missing.length === 0) {
      console.log(`✅ Ticket "${thread.name}" validé (toutes les infos sont présentes).`);
      return;
    }

    // Si des infos manquent → envoi d’un message dans le salon de modération
    const modChannel = guild.channels.cache.get(CHANNEL_ADMIN_ID);
    if (!modChannel) {
      console.error("❌ Salon de modération introuvable !");
      return;
    }

    const link = `https://discord.com/channels/${guild.id}/${thread.id}`;
    const missingList = missing.join(", ");

    await modChannel.send({
        content: `⚠️ **Ticket incomplet détecté !** *Check manuel nécessaire*  
        Créateur : ${author}  
        Lien : ${link}  
        Champs manquants détecté : ${missingList}`,
    });

    console.log(`🚫 Ticket "${thread.name}" incomplet (${missingList}).`);
  } catch (error) {
    console.error("❌ Erreur lors du traitement du threadCreate :", error);
  }
}