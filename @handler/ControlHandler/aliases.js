const Discord = require('../../handler').getDiscord()

module.exports = {
    Name: 'aliases command',
    commands: ['aliases'],
    isDMCommand: true,
    maxArgs: 0,
    Description: 'Tell all aliases of each command',
    group: 'home',
    execute: (msg, args, text, bot, dir, Information, db) => {
        const commandInfo= require('../comInfo')
        const comInfo = commandInfo(dir)
        let id = 'DM'
        if(msg.channel.type !== 'dm') id = msg.guild.id
        let Embed = new Discord.MessageEmbed()
                        .setColor('#39FF14')
                        .setAuthor(bot.user.username,bot.user.avatarURL(),'https://discord.io/ShadowSKD')
                        .setTitle(`These are the aliases`)
                        .setFooter(`Shadows's Assistant`,'https://icon-library.com/images/verified-icon-png/verified-icon-png-12.jpg')
                        .setTimestamp()
        
        comInfo.forEach(inf => {
            let alias = inf.Info.aliases.forEach(c => {
                let ac = c.split(' ')
                let name = ac.shift()
                ac.join(`, ${Information.get(id).prefix}`)
                if(ac.toString() !== '') Embed.addField(`${Information.get(id).prefix}${name} :`,`${Information.get(id).prefix}${ac}`)
            })
        })

        msg.channel.send(Embed)
    },
    modularCommand: true
}