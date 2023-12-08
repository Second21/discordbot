require('dotenv').config();
const { Client, IntentsBitField, ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const prefix = '!'; // Your bot's command prefix
const roleId = ''; // Replace with the ID of the role to check


const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return; // Ignore messages from other bots

    const mentionedUsers = message.mentions.users;
    
    // Check if any mentioned user has the specified role
    let shouldDeleteMessage = false;
    mentionedUsers.forEach(user => {
        const member = message.guild.members.cache.get(user.id);
        if (member && member.roles.cache.has(roleId)) {
            shouldDeleteMessage = true;
        }
    });

    if (shouldDeleteMessage) {
        message.delete(); // Delete the message
        message.channel.send(`<@${message.author.id}>, Please Do Not Mention Users With The Founder Role.`);
        return;
    }

    if (!message.content.startsWith(prefix)) return; // Ignore messages without the bot's prefix

    // Your other bot commands can go here
});

(async () => {
    try {
        mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB_URI, {keepAlive: true });
    console.log('Connected to DB.');

    eventHandler(client);
    } catch (error) {
        console.log(`Error: ${error}`)
    }
})();




client.on('ready', (c) => {
    console.log(`✅ ${c.user.tag} is online.`);

    client.user.setActivity({
        name: '/help',
        type: ActivityType.Watching,
    });
});

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;
  
    if (interaction.commandName === 'hey') {
      return interaction.reply('hey!');
    }
  
    if (interaction.commandName === 'ping') {
      return interaction.reply('Pong!');
    }
  });

client.login(process.env.TOKEN);