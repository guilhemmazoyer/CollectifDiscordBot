import { Client } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN; // token dans le .env

const client = new Client();

// --- Quand le bot est prêt ---
client.once("ready", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.login(TOKEN);