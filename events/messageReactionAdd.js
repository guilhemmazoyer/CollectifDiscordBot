import config, { pronounRoles, skillRoles } from "../config.js";

// Validation de la charte
const ROLE_MEMBER_ID = config.roles.member;
const MESSAGE_CHART_ID = config.messages.chart;

// Validation d’un créateur par un admin
const ROLE_ADMIN_ID = config.roles.admin;
const BILLBOARD_AFFILIATION_ID = config.channels.billboardAffiliation;
const ROLE_CREATOR_ID = config.roles.creator;
const CATEGORY_CREATOR_ID = config.categories.creatorProjects;

// Validation de ticket - Validation mutuelle (double réaction)
const BILLBOARD_TICKET_ID = config.channels.billboardTicket;
const CHANNEL_ADMIN_ID = config.channels.administration;

// Choix du pronom
const MESSAGE_PRONOM_ID = config.messages.pronom;

// Choix des compétences
const MESSAGE_SKILL_ID = config.messages.skill;


// 🎯 Fonction principale
export const name = "messageReactionAdd";

export async function execute(reaction, user) {
  try {
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;

    const guild = reaction.message.guild;
    if (!guild) return;

    // Cas 1 : Validation de la charte
    if (reaction.message.id === MESSAGE_CHART_ID) {
      return await handleCharteReaction(guild, reaction, user);
    }

    // Cas 2 : Validation d’un créateur par un admin
    // Le message est dans le billboard des demandes d'affiliation
    if (reaction.message.channel.parentId === BILLBOARD_AFFILIATION_ID) {
      return await handleCreatorValidation(guild, reaction, user);
    }

    // Cas 3 : Validation mutuelle (collab)
    if (reaction.message.channel.parentId === BILLBOARD_TICKET_ID) {
      return await handleCollabValidation(guild, reaction, user);
    }

    // Cas 4 : Choix de pronom
    if (reaction.message.id === MESSAGE_PRONOM_ID) {
      return await handlePronomReaction(guild, reaction, user);
    }

    // Cas 5 : Choix des compétences
    if (reaction.message.id === MESSAGE_SKILL_ID) {
      return await handleSkillReaction(guild, reaction, user);
    }

  } catch (error) {
    console.error("❌ Erreur dans le gestionnaire principal messageReactionAdd :", error);
  }
}



// FONCTION 1 - Validation de la charte
async function handleCharteReaction(guild, reaction, user) {
  try {
    // Si le mauvais emoji est utilisé ça ne fait rien
    if(!reaction.emoji.name === config.emojis.validate) return;
    
    const member = await guild.members.fetch(user.id);
    await member.roles.add(ROLE_MEMBER_ID);
    console.log(`Rôle membre ajouté à ${user.tag}`);

    await user.send(`👋 Bonjour ${user.username} !  
Tu viens d'obtenir le rôle **Membre** sur le serveur **${guild.name}**.  
Bienvenue et amuse-toi bien ! 🎉`);
    console.log(`✉️ Message privé pour la charte envoyé à ${user.tag}`);

  } catch (error) {
    console.error(`❌ Erreur lors de la validation de la charte pour ${user.tag} :`, error);
  }
}


// FONCTION 2 - Validation créateur par admin
async function handleCreatorValidation(guild, reaction, user) {
  try {
    const member = await guild.members.fetch(user.id);

    if(!member.roles.cache.has(ROLE_ADMIN_ID)) return; // Doit être un admin
    
    const thread = reaction.message.channel;
    const starterMessage = await thread.fetchStarterMessage();
    if (!starterMessage || starterMessage.id !== reaction.message.id) return;

    const ticketAuthor = await guild.members.fetch(starterMessage.author.id);
    await ticketAuthor.roles.add(ROLE_CREATOR_ID);
    console.log(`${ticketAuthor.user.tag} a reçu le rôle id : ${ROLE_CREATOR_ID}.`);

    // Verrouille et archive le thread
    await thread.setLocked(true, `Ticket validé par ${user.tag}`);
    setTimeout(async () => {
      try {
        await thread.setArchived(true, "Ticket fermé");
        console.log(`📦 Thread "${thread.name}" archivé avec succès.`);
      } catch (e) {
        console.error("⚠️ Erreur d'archivage différé :", e);
      }
    }, 3000);

    // Crée un salon textuel (hérite des permissions)
    const channelName = thread.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .substring(0, 90);
    const newChannel = await guild.channels.create({
      name: channelName,
      type: 0,
      parent: CATEGORY_CREATOR_ID,
      reason: `Salon créé pour ${ticketAuthor.user.tag}`,
    });
    console.log(`🆕 Salon créé : #${newChannel.name}`);

    await thread.send(
      `✅ Ticket validé par ${user.username}. ${ticketAuthor} a reçu le rôle <@&${ROLE_CREATOR_ID}> !\n🗂️ Salon créé : ${newChannel}`
    );
  } catch (error) {
    console.error("❌ Erreur lors de la validation créateur par admin :", error);
  }
}


// FONCTION 3 - Manage des tickets - Validation d'aide
async function handleCollabValidation(guild, reaction, user) {
  try {
    const thread = reaction.message.channel;
    const starterMessage = await thread.fetchStarterMessage();
    if (!starterMessage) return;

    const threadAuthor = starterMessage.author;
    const content = reaction.message.content || "";

    // Vérifie si c’est bien un message de récapitulatif souple :
    // les mots-clés "tâche", "temps", "contrepartie", "livrable" (insensibles à la casse)
    // peuvent être précédés ou non d’un déterminant
    const requiredPatterns = [
      /\b(t[âa]che)\s*:\s*.+/i,
      /\b(temps)\s*:\s*.+/i,
      /\b(contrepartie)\s*:\s*.+/i,
      /\b(livrable)\s*:\s*.+/i,
    ];
    const isRecap = requiredPatterns.every(p => p.test(content));
    if (!isRecap) return;

    // Vérifie les réactions
    const users = await reaction.users.fetch();
    const validUsers = users.filter(u => !u.bot);
    const hasCreator = validUsers.has(threadAuthor.id);
    const enoughReactions = validUsers.size >= 2;

    if (!hasCreator || !enoughReactions) return;

    const reactors = [...validUsers.values()]; // transforme la collection en tableau
    const reactor1 = reactors[0];
    const reactor2 = reactors[1];

    // Validation OK
    await thread.setLocked(true, "Ticket validé (double approbation)");
    setTimeout(async () => {
      try {
        await thread.setArchived(true, "Ticket fermé");
      } catch {}
    }, 3000);

    const link = `https://discord.com/channels/${guild.id}/${thread.id}`;
    const modChannel = guild.channels.cache.get(CHANNEL_ADMIN_ID);
    const recapMessage =
      `✅ **Ticket validé :** ${thread.name}\n👤 **Créateur :** ${threadAuthor}\n👤 **Personnes impliquées :** ${reactor1} & ${reactor2}\n💬 **Récap :**\n${content}\n🔗 ${link}`;

    if (modChannel) await modChannel.send(recapMessage);

    // Envoi des DMs
    const others = validUsers.filter(u => u.id !== threadAuthor.id);
    const partner = others.first();
    if (!partner) return;

    const dmText =
      `✅ Le ticket **${thread.name}** a été accepté  !\n👤 **Personnes impliquées :** ${reactor1} & ${reactor2}\n\n${content}\n\n🔗 ${link}`;

    try {
      await threadAuthor.send(dmText);
      await partner.send(dmText);
    } catch (e) {
      console.error("⚠️ Erreur d'envoi de DM :", e);
    }

    console.log(`🤝 Ticket "${thread.name}" validé par ${threadAuthor.tag} et ${partner.tag}`);
  } catch (error) {
    console.error("❌ Erreur dans handleCollabValidation :", error);
  }
}


// FONCTION 4 - Ajout des roles pour les pronoms
async function handlePronomReaction(guild, reaction, user) {
  try {
    const member = await guild.members.fetch(user.id);
    const emoji = reaction.emoji.name;

    const roleId = pronounRoles[reaction.emoji.name];
    if (!roleId) return;

    await member.roles.add(roleId);
    console.log(`🏷️ Rôle de pronom ajouté (${emoji}) à ${user.tag}`);

  } catch (error) {
    console.error("❌ Erreur dans handlePronomValidation :", error);
  }
}


// FONCTION 5 - Ajout des roles pour les compétences
async function handleSkillReaction(guild, reaction, user) {
  try {
    const member = await guild.members.fetch(user.id);
    const emoji = reaction.emoji.name;

    const roleId = skillRoles[reaction.emoji.name];
    if (!roleId) return;

    await member.roles.add(roleId);
    console.log(`🏷️ Rôle de compétence ajouté (${emoji}) à ${user.tag}`);

  } catch (error) {
    console.error("❌ Erreur dans handleSkillValidation :", error);
  }
}