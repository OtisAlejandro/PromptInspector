const { Client, GatewayIntentBits, Events, Partials, ActivityType } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping], partials: [Partials.Channel, Partials.Reaction, Partials.Message],});
const monitoredChannels = require("./MONITORED_CHANNELS.json");
require("dotenv").config();

// Handle Errors, Anti-Crashing
const process = require("node:process");
process.on("unhandledRejection", async (reason, promise) => {
  console.log("Unhandled Rejection At", promise, "Reason", reason);
});

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception At", err);
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log("Uncaught Exception Monitor", err, origin);
});

// Prompt Inspector
const ExifReader = require("exifreader");
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const { guild, channel } = message;

  if (monitoredChannels.monitoredChannels.includes(channel.id) && message.attachments.size > 0) {
    const attachment = message.attachments.first();
    const attachmentURL = attachment.url;

    // Download the attachment
    const attachmentData = await fetch(attachmentURL);
    const buffer = await attachmentData.arrayBuffer();

    // Read the metadata using ExifReader
    const tags = ExifReader.load(buffer);

    // Access the desired metadata tag
    const parameters = tags["parameters"];

    if (parameters) {
      message.react("🔍");
    } else {
      return;
    }
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (reaction.emoji.name === "🔍") {
    const message = await reaction.message.fetch();

    if (message.author.bot) return;
    if (user.bot) return;

    const { guild, channel } = message;

    // Check if the message has attachments
    if (monitoredChannels.monitoredChannels.includes(channel.id) && message.attachments.size > 0) {
      for (const attachment of message.attachments.values()) {
        const attachmentURL = attachment.url;

        // Download the attachment
        const attachmentData = await fetch(attachmentURL);
        const buffer = await attachmentData.arrayBuffer();

        // Read the metadata using ExifReader
        const tags = ExifReader.load(buffer);

        // Access the desired metadata tag
        const parameters = tags["parameters"];

        if (!parameters) return;

        // Access the value property of parameters
        const parametersValue = parameters.value;

        if (!parametersValue) return;

        // Split the parametersValue into separate fields
        const parsedParams = getParamsFromString(parametersValue);

        // Create an embed
        const embed = new EmbedBuilder()
          .setTitle("Prompt")
          .setColor("Yellow")
          .setImage(attachmentURL)
          .setFooter({
            text: `Posted by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          });

        // Add embed fields from the parsed parameters
        for (const key in parsedParams) {
          const value = parsedParams[key];
          embed.addFields({ name: key, value: value, inline: key !== "Prompt" });
        }

        // Send the embed message
        await user.send({ content: "", embeds: [embed] });
      }
    }
  }
});

// Helper function to parse parametersValue into separate fields
function getParamsFromString(parametersValue) {
  const outputDict = {};
  const parts = parametersValue.split("Steps: ");
  const prompts = parts[0];
  const params = "Steps: " + parts[1];

  if (prompts.includes("Negative prompt: ")) {
    outputDict["Prompt"] = prompts.split("Negative prompt: ")[0];
    outputDict["Negative Prompt"] = prompts.split("Negative prompt: ")[1];
    if (outputDict["Negative Prompt"].length > 1000) {
      outputDict["Negative Prompt"] =
        outputDict["Negative Prompt"].slice(0, 1000) + "...";
    }
  } else {
    outputDict["Prompt"] = prompts;
  }

  if (outputDict["Prompt"].length > 1000) {
    outputDict["Prompt"] = outputDict["Prompt"].slice(0, 1000) + "...";
  }

  const paramsList = params.split(", ");
  paramsList.forEach((param) => {
    const [key, value] = param.split(": ");
    outputDict[key] = value;
  });

  return outputDict;
}

client.login(process.env.TOKEN)

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
})


