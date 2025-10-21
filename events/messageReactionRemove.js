import config, { pronounRoles, skillRoles } from "../config.js";

const ROLE_MEMBER_ID = config.roles.member;
const MESSAGE_CHART_ID = config.messages.chart; // Charte
const MESSAGE_PRONOM_ID = config.messages.pronom; // Choix du pronom
const MESSAGE_SKILL_ID = config.messages.skill; // Choix des compétences

export const name = "messageReactionRemove";

export async function execute(reaction, user) {
  if (reaction.partial) await reaction.fetch();
  if (reaction.message.partial) await reaction.message.fetch();
  if (user.bot) return;

  const guild = reaction.message.guild;
  if (!guild) return;

  const member = await guild.members.fetch(user.id).catch(() => null);
  if (!member) return;

  // --- Gestion de l'état membre à visiteur
  if (reaction.message.id === MESSAGE_CHART_ID) {
    if(reaction.emoji.name !== config.emojis.validate) return;
    await member.roles.remove(ROLE_MEMBER_ID).catch(console.error);
    console.log(`Rôle membre retiré à ${user.tag}`);
    return;
  }

  // --- Gestion des rôles de pronom
  if (reaction.message.id === MESSAGE_PRONOM_ID) {
    const emoji = reaction.emoji.name;
    const roleId = pronounRoles[reaction.emoji.name];
    if (!roleId) {
      console.log("Aucun rôle trouvé pour cet emoji :", emoji);
      return;
    }

    await member.roles.remove(roleId).catch(console.error);
    console.log(`🏷️ Rôle de pronom retiré (${emoji}) à ${user.tag}`);
  }

  // --- Gestion des rôles de compétence
  if (reaction.message.id === MESSAGE_SKILL_ID) {
    const emoji = reaction.emoji.name;
    const roleId = skillRoles[reaction.emoji.name];
    if (!roleId) {
      console.log("Aucun rôle trouvé pour cet emoji :", emoji);
      return;
    }

    await member.roles.remove(roleId).catch(console.error);
    console.log(`🏷️ Rôle de compétence retiré (${emoji}) à ${user.tag}`);
  }
}