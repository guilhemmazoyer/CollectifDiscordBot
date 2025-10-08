import config from "../config.js";

const EMOJI = config.emojis.validate;

const ROLE_MEMBER_ID = config.roles.member;
const MESSAGE_CHART_ID = config.messages.chart;

export const name = "messageReactionRemove";

export async function execute(reaction, user) {
  if (reaction.partial) await reaction.fetch();

  if (reaction.message.id !== MESSAGE_CHART_ID) return;
  if (reaction.emoji.name !== EMOJI) return;
  if (user.bot) return;

  const guild = reaction.message.guild;
  const member = await guild.members.fetch(user.id);

  // 1 --- Gestion de l'état membre à visiteur
  await member.roles.remove(ROLE_MEMBER_ID).catch(console.error);
  console.log(`Rôle membre retiré à ${user.tag}`);
}