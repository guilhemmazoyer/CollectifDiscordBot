export default {
  roles: {
    admin: "1425368300594008205", // role administrateur
    member: "1425110795741827196", // role de membre
    creator: "1425368331417944185", // role de créateur de projet

    il: "1430129956444442725", // role de pronom - il
    elle: "1430129995082240251", // role de pronom - elle
    iel_neutre: "1430130010785841194", // role de pronom - iel avec accords neutres
    iel_il: "1430130047334879323", // role de pronom - iel avec accords au masculin
    iel_elle: "1430130074425888818", // role de pronom - iel avec accords au féminin

    gamedesign: "1430139386963689502",
    gameart: "1430139430525472871",
    gamedev: "1430139449341382747",
    qa: "1430139464231157980",
  },
  categories: {
    creatorProjects: "1425430472145637437", // catégorie des projets
  },
  channels: {
    administration: "1425438654620373045", // salon de modération
    billboardAffiliation: "1425368036214571058", // billboard des demandes d'affiliation de projet au collectif
    billboardTicket: "1425436541882339369", // billboard des demandes d'aide via ticket
  },
  messages: {
    chart: "1425368514918879272", // message de la charte
    pronom: "1429832429425918164", // message où réagir pour le choix du rôle de pronom
    skill: "1429832646078365807", // message où réagir pour le choix des rôles des compétences
  },
  emojis: {
    validate: "✅", // validation de la charte

    pronom_il: "1️⃣", // choix de pronom 1
    pronom_elle: "2️⃣", // choix de pronom 2
    pronom_iel_neutre: "3️⃣", // choix de pronom 3
    pronom_iel_il: "4️⃣", // choix de pronom 4
    pronom_iel_elle: "5️⃣", // choix de pronom 5

    skill_gamedesign: "🪇",
    skill_gameart: "🎨",
    skill_gamedev: "🖥️",
    skill_qa: "🎮",
  },
};

import config from "./config.js"; // si c’est dans un autre fichier
const { roles, emojis } = config;

// Associe chaque émoji à un rôle - pour les pronoms
export const pronounRoles = {
  [emojis.pronom_il]: roles.il,
  [emojis.pronom_elle]: roles.elle,
  [emojis.pronom_iel_neutre]: roles.iel_neutre,
  [emojis.pronom_iel_il]: roles.iel_il,
  [emojis.pronom_iel_elle]: roles.iel_elle,
};

// Associe chaque émoji à un rôle - pour les compétences
export const skillRoles = {
  [emojis.skill_gamedesign]: roles.gamedesign,
  [emojis.skill_gameart]: roles.gameart,
  [emojis.skill_gamedev]: roles.gamedev,
  [emojis.skill_qa]: roles.qa,
};