import { Client, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN; // token dans le .env

// --- Initialisation du client Discord ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// --- Quand le bot est prêt ---
client.once("ready", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.login(TOKEN);