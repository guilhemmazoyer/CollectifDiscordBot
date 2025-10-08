import { Client, GatewayIntentBits, Partials, Collection, Events } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

import { startAbandonedProjectCheck } from "./jobs/checkAbandonedProjects.js";


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// --- Chargement automatique des fichiers d'événements ---
const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = await import(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}


// --- commands --- //
import * as checkProjectStatus from "./commands/checkProjectStatus.js";

// Initialise la collection de commandes
client.commands = new Collection();

// Ajoute la commande
client.commands.set(checkProjectStatus.data.name, checkProjectStatus);

client.on(Events.InteractionCreate, async (interaction) => {
  // Vérifie que c’est une commande slash
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error("❌ Erreur dans l'exécution de la commande :", error);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({
        content: "⚠️ Une erreur est survenue lors de l'exécution de la commande.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "⚠️ Une erreur est survenue lors de l'exécution de la commande.",
        ephemeral: true,
      });
    }
  }
});


client.once("clientReady", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
  startAbandonedProjectCheck(client);
});

client.login(process.env.DISCORD_TOKEN);