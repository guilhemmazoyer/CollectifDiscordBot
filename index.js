import { Client, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
import http from "http";
dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN; // token dans le .env
const PORT = process.env.PORT || 3000;
const SELF_URL = process.env.RENDER_EXTERNAL_URL; // fourni automatiquement par Render

// Petit serveur HTTP
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("✅ Bot online\n");
}).listen(PORT, () => console.log(`Open on port ${PORT}`));

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