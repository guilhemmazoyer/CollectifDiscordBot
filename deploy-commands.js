import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

import * as checkProjectStatus from "./commands/checkProjectStatus.js";

const commands = [checkProjectStatus.data.toJSON()];

// ─────────────── CONFIG ───────────────
const CLIENT_ID = process.env.CLIENT_ID; // ton ID d’application
const GUILD_ID = process.env.GUILD_ID;   // ton serveur de test
const TOKEN = process.env.DISCORD_TOKEN;
// ──────────────────────────────────────

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("📤 Déploiement des commandes slash...");

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Commandes enregistrées avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors du déploiement :", error);
  }
})();