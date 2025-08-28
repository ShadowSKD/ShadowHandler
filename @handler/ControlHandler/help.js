const Discord = require('../../handler').getDiscord()

module.exports = {
    Name: 'help',
    commands: ['help'],
    syntax: '<category (not_necessary & only for fewcommands)>',
    permissionError: '',
    minArgs: 0,
    maxArgs: 1,
    permissions: [],
    requiredRoles: [],
    isDMCommand: true,
    execute: (msg, args, text, bot, dir, Information) => {
        let verifactor = -1
        let id = null
        let GuildName = null
        if(msg.channel.type === 'dm') {
            id = 'DM'
        } else{
            id = msg.guild.id
            GuildName = msg.guild.name
        }
        let { prefix } = Information.get(id)
        let color = '#0099ff'
        const avtr = bot.user.avatarURL()
        const commandInfo= require('../comInfo')
        const Info = commandInfo(dir)
        if(msg.channel.type !== 'dm') {
            color = msg.member.displayHexColor
            if (color == '#000000'){
                if(msg.member.hoistRole){
                    color = msg.member.hoistRole.hexColor
                } else {
                    color = '#0099ff'
                }
            }
        }
        let helpmsg = new Discord.MessageEmbed()
            .setAuthor(bot.user.username,avtr,'https://discord.io/ShadowSKD')
            .setThumbnail(avtr)
            .setColor(color)
            .setTimestamp()
            .setFooter(bot.user.username,'https://icon-library.com/images/verified-icon-png/verified-icon-png-12.jpg')

        if(args.length === 0){
            if(GuildName === null){
                helpmsg.setTitle(`${bot.user.username} Feature Commands`)
            } else {
                helpmsg.setTitle(`${bot.user.username} Feature Commands in ${msg.guild.name.replace(' Server','')} Server`)
            }
            verifactor = 0
            Info.forEach(inf => {
                let cName = inf.Name.split('')
                cName[0] = cName[0].toString().toUpperCase()
                cName = cName.join('')
                helpmsg.addField(`${cName} Commands`,`${inf.Description}\n\`${prefix}help ${cName}\``, true)
            })
            msg.channel.send(helpmsg)
        } else if (args[0]){
            Info.forEach(inf => {
                if(args[0].toString().toLowerCase() === inf.Name.toString().toLowerCase()){
                    let cName = inf.Name.split('')
                    cName[0] = cName[0].toString().toUpperCase()
                    cName = cName.join('')
                    helpmsg.setTitle(`${cName} Commands`)
                    for (let index = 0; index < inf.Info.Name.length; index++) {
                        let name = inf.Info.Name[index]
                        let ds = inf.Info.Description[index]
                        let a = `${inf.Info.aliases[index].split(' ')[0]}`
                        let syn = ` ${inf.Info.syntax[index]}`
                        if(syn === ' -1' ) syn = ''
                        helpmsg.addField(`${prefix}${name.replace(' Command','')} Command`,`${ds}\nUsage: \`\`\`${prefix}${a}${syn}\`\`\``)
                    }
                    verifactor = 0
                    msg.channel.send(helpmsg)
                } else {
                    for (let index = 0; index < inf.Info.Name.length; index++) {
                        if(inf.Info.aliases[index].toLowerCase().split(' ').includes(args[0].toLowerCase())) {
                            let cName = inf.Info.Name[index].split('')
                            cName[0] = cName[0].toString().toUpperCase()
                            cName = cName.join('')
                            helpmsg.setTitle(`${cName.replace(` Command`,'')} Command`)
                            helpmsg.addField(inf.Info.Description[index],`Usage: \`\`\`${prefix}${inf.Info.aliases[index].toLowerCase().split(' ')[0]} ${inf.Info.syntax[index].toString().replace("-1",'')}\`\`\``)
                            helpmsg.addField(`Is Usable in DM?`,`\`\`\`${inf.Info.isDM[index].toString().toUpperCase()}\`\`\``)
                            verifactor = 0
                            msg.channel.send(helpmsg)
                        }
                        
                    }
                }
            })
        } 
        if(verifactor === -1){
            msg.channel.send(`Invalid Searched Command`)
        }
    },
    Discription: 'Displays Help Portal.',
    group: 'home',
    modularCommand: true
}