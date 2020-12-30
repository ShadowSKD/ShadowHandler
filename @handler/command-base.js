const validatePermissions = (permissions) => {
    const validPermissions = [
        'CREATE_INSTANT_INVITE',
        'KICK_MEMBERS',
        'BAN_MEMBERS',
        'ADMINISTRATOR',
        'MANAGE_CHANNELS',
        'MANAGE_GUILD',
        'ADD_REACTIONS',
        'VIEW_AUDIT_LOG',
        'PRIORITY_SPEAKER',
        'STREAM',
        'VIEW_CHANNEL',
        'SEND_MESSAGES',
        'SEND_TTS_MESSAGES',
        'MANAGE_MESSAGES',
        'EMBED_LINKS',
        'ATTACH_FILES',
        'READ_MESSAGE_HISTORY',
        'MENTION_EVERYONE',
        'USE_EXTERNAL_EMOJIS',
        'VIEW_GUILD_INSIGHTS',
        'CONNECT',
        'SPEAK',
        'MUTE_MEMBERS',
        'DEAFEN_MEMBERS',
        'MOVE_MEMBERS',
        'USE_VAD',
        'CHANGE_NICKNAME',
        'MANAGE_NICKNAMES',
        'MANAGE_ROLES',
        'MANAGE_WEBHOOKS',
        'MANAGE_EMOJIS',
      ]

      for (const permission of permissions) {
          if(!validPermissions.includes(permission)) {
              throw new Error(`SKDCommands --> Unknown permission node "${permission}"`)
          }
      }
}
/**
 * Command Event Handler
 * @param {*} bot  Discord.Client()
 * @param {*} commandFile File of command
 * @param {*} Information Info regarding guilds
 * @param {*} global 
 * @param {*} dir 
 */
module.exports = (bot, commandFile, Information, global, dir, db) => {
 
    let UsedRecently = new Set()

    let {
        commands,
        syntax = '',
        permissionsError = `You don't have the permissions to run this command`,
        minArgs = 0,
        maxArgs = null,
        permissions = [],
        requiredRoles = [],
        isDMCommand = false,
        execute,
        cooldown = -1,
        parameters,
        isNAC = false,
        Name,
        modularCommand = false
    } = commandFile

    /*
    parameters --> {
        blacklist: [],
        whitelist: [],
        isMOC: false, 
        AccessMembers: [],
        isOwnerOnly
    }
    */

    if (typeof commands === 'string') {
        commands = [commands]
    }

    if(isNAC === true) return console.log(`${Name} Command is not accessible. Code: isNAC=true`)

    if (permissions.length) { 
        if (typeof permissions === 'string') permissions = [permissions]
        validatePermissions(permissions)
    }
    
    bot.on('message', msg => {
        const { member, content, channel, guild, author } = msg
        let prefix = '!'
        try {
            for (const alias of commands) {
                if(channel.type === 'dm') {
                    id = 'DM'
                } else {
                    id = guild.id
                }
                prefix = Information.get(id).prefix
                if (content.toLowerCase().startsWith(`${prefix}${alias.toLowerCase()}`)) {
                    if(cooldown > 0){
                        if(UsedRecently.has(`${Name}-${author.id}`)){
                            return channel.send(`Please wait till your cooldown finish...`)
                        } else {
                            UsedRecently.add(`${Name}-${author.id}`)
                            setTimeout(() => {
                                UsedRecently.delete(`${Name}-${author.id}`)
                            }, cooldown * 1000 )
                        }
                    }

                    if(global) {
                        try {
                            let { avoidedChannels } = global
                            if (avoidedChannels.includes(channel.id)) return
                        } catch (error) {
                            console.log(`SKDCommands --> Invalid global parameter. Read Handler Docs.`)
                        }
                    }

                    if(parameters) {
                        let entries = Object.entries(parameters)

                        let blacklist = []
                        let whitelist = []
                        let isMOC = false
                        let AccessMembers = []
                        let isOwnerOnly = false

                        entries.forEach(entry => {
                            if(entry[0] === 'blacklist') {
                                if(typeof entry[1] === 'string') entry[1] = [entry[1]]
                                blacklist = entry[1]
                            }
                            if(entry[0] === 'whitelist') {
                                if(typeof entry[1] === 'string') entry[1] = [entry[1]]
                                whitelist = entry[1]
                            }
                            if(entry[0] === 'isMOC') {
                                if(typeof entry[1] !== 'boolean') throw new TypeError(`TypeError: isMOC of ${Name} Command is not boolean`)
                                isMOC = entry[1]
                            }
                            if(entry[0] === 'AccessMembers'){
                                if(typeof entry[1] === 'string') entry[1] = [entry[1]]
                                AccessMembers = entry[1]
                            }
                            if(entry[0] === 'isOwnerOnly'){
                                if(typeof entry[1] !== 'boolean') throw new TypeError(`TypeError: isMOC of ${Name} Command is not boolean`)
                                isOwnerOnly = entry[1]
                            }
                        })

                        if(whitelist.toString() !== '' && blacklist.toString() !== ''){
                            throw new Error('Unexpected declaration. Both whitelist and blacklist are declared.\nSKDcommands --> Handler accepts only one at once')
                        }  

                        if(whitelist.toString() !== ''){
                            if(!whitelist.includes(channel.id)) return
                        }

                        if(blacklist.toString() !== ''){
                            if(blacklist.includes(channel.id)) return
                        }

                        if(isMOC === true){
                            if(AccessMembers.toString() === '') {
                                throw new Error(
                                    `TypeError: isMOC is true though there is no userId's in AccessMembers.\nSKDCommands --> Keep isMOC false or Add UserId's to AccessMembers`
                                    )
                            }
                            if(!AccessMembers.includes(member.user.id)) { 
                                if(!Information.get(guild.id).Mods.includes(member.id)){
                                    channel.send(`${member}, This command is only for specific users.`)
                                    return
                                }
                            }
                        }
                        if(isOwnerOnly === true) {
                            if (msg.member.id !== msg.guild.owner.id){
                                channel.send(`Only Server Owner can use this command.`)
                            }
                        }
                    }

                    if(channel.type === 'dm' && isDMCommand === false){
                        msg.reply(`You can't use this command in Direct Message`)
                        return
                    }

                    if(channel.type !== 'dm') {
                        const verifier = guild.members.cache.find(member => member.user.id === bot.user.id)

                        if(!verifier.hasPermission('ADMINISTRATOR')) {
                            const guildOwner = guild.members.cache.get(guild.ownerID)
                            guildOwner.send(`<@${guild.ownerID}>, Bot Doesn't have enough permissions to perform the activity. Please fix the issue ASAP.`)
                            msg.channel.send(`Bot do not have permissions. Contact Server owner to fix issue.`)
                            return
                        }
                    }

                    for (const permission of permissions) {
                        if(!Information.get(guild.id).Mods.includes(member.id)){
                            if (!member.hasPermission(permission)){
                                msg.reply(permissionsError)
                                return
                            }
                        }
                        
                    }

                    for (const requiredRole of requiredRoles) {
                        const role = guild.roles.cache.find(role => role.name === requiredRole)

                        if(!role || !member.roles.cache.has(role.id)) {
                            if(!Information.get(id).Mods.includes(member.id)) {
                                msg.reply(`You require "${requiredRole} to use this command."`)
                                return
                            }
                        }
                    }

                    const args = content.split(/[ ]+/)

                    args.shift()

                    if (args.length < minArgs || maxArgs !==null && args.length > maxArgs){
                        msg.reply(`Incorrect syntax! Use ${prefix}${alias} ${syntax}`)
                        return
                    }
            
                    if(modularCommand === true){
                        execute(msg,args, args.join(' '), bot, dir, Information, db)
                    } else {
                        execute(msg, args, args.join(' '), bot)
                    }
                }
            }
        } catch (error) {
            console.log(`SKDCommands --> ` + error.message +' :')
            console.warn(`SKDCommands --> Details: ${error}`)
        }
        return
    })
}