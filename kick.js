const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const warn = require('../../models/admin/warnings')
const generateID  = require('../../utils/generateID');
const { options } = require('mongoose');
module.exports = {
    data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn')
    .addSubcommand( commands => commands.setName('add').setDescription('Warn a user').addUserOption( options => options.setName('user').setDescription('The user to warn').setRequired(true)).addStringOption(options => options.setName('reason').setDescription('The reason to warn the user')))
    .addSubcommand( commands => commands.setName('remove').setDescription('Remove a warning from a user').addStringOption(options => options.setName('case-id').setDescription('The case id').setRequired(true)))
    .addSubcommand( commands => commands.setName('edit').setDescription('Edit a case').addStringOption( options => options.setName('caseid').setDescription('The case id to edit the case').setRequired(true)).addStringOption(options => options.setName('reason').setDescription('The new reason for the warning').setRequired(true)))
    .addSubcommand( commands => commands.setName('list').setDescription('See the warnings of a user').addUserOption(options => options.setName('user').setDescription('The user to check the warnings').setRequired(true))),
    async execute(interaction) {
        const { options, member, guild, user } = interaction;
        const sub = options.getSubcommand()
        const target = await options.getUser('user')
        const reason = await options.getString('reason') ?? 'No reason provided.'

        const invalidPermissions = {
            title: `Invalid Permissions`,
            description: `You dont have the valid permissions to execute this command.`
        }
        switch(sub) {
            case 'add':
                if(!member.permissions.has(PermissionFlagsBits.ManageMessages)) return await interaction.reply({ embeds: [invalidPermissions], ephemeral: true })
                const id = generateID();
                await warn.create({
                    user: target.id,
                    guild: guild.id,
                    warnedb: user.id,
                    reason: reason,
                    caseid: id
            })

            const warneds = {
                title: `Warned`,
                description: `${target} has been warned by ${user} for ${reason}. Case id: ${id}`
            }
         
            await interaction.reply({ embeds: [warneds] })
            break;

            case 'remove':
                if(!member.permissions.has(PermissionFlagsBits.ManageMessages)) return await interaction.reply({ embeds: [invalidPermissions], ephemeral: true })
                const caseid = await options.getString('case-id')

                const data = await warn.findOne({ caseid: caseid }) 
                if(data) {
                await warn.findOneAndDelete({ caseid: caseid })
                const embed = {
                    title: `Success`,
                    description: `Case id: ${caseid} has been removed.`
                }
            
                return await interaction.reply({ embeds: [embed] })
            } else {
                const embed = {
                    title: `Error`,
                    description: `Invalid case id.`
                }
                return await interaction.reply({ embeds: [embed] })
            } 

            case 'list':
                if(!member.permissions.has(PermissionFlagsBits.ManageMessages)) return await interaction.reply({ embeds: [invalidPermissions], ephemeral: true })

                const data2 = await warn.find({ user: target.id })
                if(!data2) {
                    const embed = {
                        title: `Error`,
                        description: `This user has 0 warnings at the moment`
                    }
                    return await interaction.reply({ embeds: [embed] })
                } else {
                    const embed = {
                        title: `Warnings for ${target.username}`,
                        fields: [],
                    };
            
                    data2.forEach((data2) => {
                        embed.fields.push({
                            name: `Warnings of ${target.globalName ?? user.username}`,
                            value: `**Reason:** ${data2.reason}\n**Moderator:** <@${data2.warnedb}>\n**Id:** ${data2.caseid}`,
                        });
                    });
            
                    return await interaction.reply({ embeds: [embed] });

                

                    
                } break;
                case 'edit':
                    if(!member.permissions.has(PermissionFlagsBits.ManageMessages)) return await interaction.reply({ embeds: [invalidPermissions], ephemeral: true })
            const caseid2 = await interaction.options.getString('caseid')
            const data3 = await warn.findOne({ caseid: caseid2})

            if(!data3) {
                const embed = {
                    title: `Error`,
                    description: `Invalid case id`
                }
                return await interaction.reply({ embeds: [embed], ephemeral: true })
            } else {
                await warn.findOneAndUpdate({ 
                    caseid: caseid2,
                    reason: reason,
                    warnedb: data3.warnedb,
                    user: data3.user,
                    guild: interaction.guild.id
                })

                const embed = {
                    title: `Success`,
                    description: `Case with id ${caseid2} has been edited.`
                }

                return await interaction.reply({ embeds: [embed] })
            }
        } 

    }
}

