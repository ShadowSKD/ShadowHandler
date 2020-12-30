const base = require('./@handler/command-base.js')
const path =  require('path')
const fs = require('fs')
const { exit } = require('process')
let DiscordJS = undefined
const { version } = require('./package.json')

require('events').EventEmitter.defaultMaxListeners = 20

/**
 * @fileoverview ShadowHandler 
 * @author ŞhádøwSKD#6322
 */
/**
 * give Discord for automation of commands
 * @param {*} Discord 
 * This helps the module to get properties of Discord require for Embeds and other properties.
 * @example //In main file
 * const Discord = require('discord.js')
 * giveDiscord(Discord)
 */
exports.giveDiscord = (Discord) => {
    try {
        if(Discord.Constants.Package._from === 'discord.js'){
            DiscordJS = Discord 
        }
    } catch (error) {
        console.log(`ShadowHandler @ --> giveDiscord\nError: --> Wrong file is given to giveDiscord(), Check Documentation or use fetchMethods('giveDiscord') to get info regarding usage of giveDiscord()`)
        throw new Error(`ShadowHandler @ --> giveDiscord(), Use Proper File of 'discord.js`)
    }
}
/**
 * @borrows 'discord.js'
 * @ignore Don't Use it or you may get error.
 */
module.exports.getDiscord = () => {
    if(DiscordJS !== undefined){
        return DiscordJS
    } else {
        console.log(`SKDCommands --> Shadow Handler require Discord to automate help, aliases and setting commands.\nUse 'shadowhandler.giveDiscord(Discord)'to make use of automatted commands.`)
        return -1
    }    
}

/**
 * SKDCommands:
 * 
 * Integrated command handler for your bot.
 * 
 * Note: Use giveDiscord() before this function to get other inbuilt automatted commands.
 * @param {ClientData} bot 
 * Takes the Discord Client for command handling.
 * @param {*} db 
 * quick.db's database for storing data
 * @param {Location} dir 
 * Uses the path of the caller. Give the path to Commands directory.
 * @param {Object} parameters 
 * Global parameters for bot. Takes the avoidChannels argument with array of ChannelIDs on which bot won't work. 
 * 
 * The command handler just automatically makes a environment for your bot. It uses 'quick.db' for storing data of servers
 * and also allow bot user to have their own custom prefix.
 * 
 * @throws Error : If the file in directory is different than .js or .json
 */
exports.SKDCommands = (bot, db, dir, parameters) => {

    const guilds = bot.guilds.cache

    console.log(`ShadowHandler_v${version} @ --> Running SKDCommands`)

    let caller = path.toNamespacedPath(require.main).path

    let p = path.isAbsolute(dir)

    if(!p){
        dir = path.join(caller,dir)
    }

    if(!parameters) console.log(`SKDCommands --> No Global Parameters`)

    const GI = new Map()

    guilds.forEach(guild => {
        let presence = 0
        let prefix = '!'
        if(db.has(guild.id)) {
            prefix = db.get(`${guild.id}.prefix`)
            presence = 1
        }
        let Mods = guild.members.cache.filter(member => member.hasPermission('ADMINISTRATOR')  && !member.user.bot ).map(member => member.id)
        if(typeof Mods === 'string') Mods = [Mods]
        let info = {
            guild: {
                name: guild.name,
                id: guild.id
            },
            prefix: prefix,
            Mods: Mods
        }
        GI.set(guild.id, info)

        if(presence = 0){
            db.set(guild.id, { 
                name: guild.name,
                prefix: prefix
            })
            db.push(`${guild.id}.Mods`, Mods)
        }
    })

    GI.set('DM',{
        prefix: '!'
    })
    
    readCommands = (dir) => {
        const files =fs.readdirSync(dir).filter(file => !file.endsWith('.json'))
        for(const file of files) {
            const stat = fs.lstatSync(path.join(dir, file))
            if(stat.isDirectory()) {
                readCommands(path.join(dir,file))
            } else {
                if(!file.endsWith('.js')){
                    throw new Error(`SKDCommands --> The Directory have different files than ".js" or ".json".`)
                }
                const cFile = require(path.join(dir, file))
                let { isNAC } = cFile
                if(!isNAC || isNAC === false) {
                    let cName =cFile.Name.split('')
                    cName[0] = cName[0].toString().toUpperCase()
                    cName = cName.join('')
                    cName = cName.toString().replace(" Command",'').replace(" command",'')
                    console.log(`SKDCommands --> Updating ${cName} Command`)
                    base(bot, cFile, GI, parameters)
                }
            }
        }
    }
    const built_in_commands= fs.readdirSync(path.join(__dirname,'./@handler/ControlHandler'))
    if(DiscordJS === -1) console.log(`SKDCommands --> Discord not provided. Automatted commands won't be registered.`)
    if(DiscordJS !== -1) {
        built_in_commands.forEach( c => {
            const command = require(path.join(__dirname,'./@handler/ControlHandler',c))
            let cName =command.Name.toString().split('')
            cName[0] = cName[0].toString().toUpperCase()
            cName = cName.join('').toString().replace(" command",'')
            cName = cName.toString().replace(" Command",'')
            console.log(`SKDCommands --> Updating ${cName} Command`)
            base(bot, command, GI, parameters, dir, db)
        })
    }
    
    readCommands(dir)

    bot.on('guildCreate', (guild) => {
        let presence = 0
        let prefix = '!'
        if(db.get(guild.id)) {
            prefix = db.get(`${guild.id}.prefix`)
            presence = 1
        }
        let Mods = guild.members.cache.filter(member => member.hasPermission('ADMINISTRATOR')  && !member.user.bot ).map(member => member.id)
        if(typeof Mods === 'string') Mods = [Mods]
        let info = {
            guild: {
                name: guild.name,
                id: guild.id
            },
            prefix: prefix,
            Mods: Mods
        }
        GI.set(guild.id, info)

        if(presence = 0){
            db.set(guild.id, { 
                name: guild.name,
                prefix: prefix
            })
            db.push(`${guild.id}.Mods`, Mods)
        }

        let defaultChannel = ''

        guild.channels.cache.forEach((channel) => {
            if(channel.type === 'text' && defaultChannel === '') {
                if (channel.permissionsFor(guild.me).has('SEND_MESSAGES')) {
                    defaultChannel = channel
                }
            }
        })

        defaultChannel.send(`Hi, I'm ${bot.user.username}. I hope you all are great. <a:DanceAmongStick:757263005321920582>`).catch((err) => {
            console.log(err.message)
        })
    })

    bot.on('guildDelete', (guild) => {
        GI.delete(guild.id)
    })
}

exports.fetchMethods = (fn,dir_to_save) => {
    let caller = path.toNamespacedPath(require.main).path
    if(fn.toLowerCase() === `skdcommands`){
        let isGiven = false
        if(dir_to_save){
            isGiven = true
        }
        let loc = isGiven ? dir_to_save : path.join(caller,'./')
        if(!path.isAbsolute(dir_to_save)){
            loc = path.join(caller,dir_to_save)
        }
        console.log(
            `SKDCommands__ReadLOG -->\n`+
            `SKDCommands --> ({ Client() }, Database{quickdb}, path_to_Commands(require whole path),{global_parameter})\n`+
            `   Ex -> \n`+
            `   SKDCommands(client,db,path.join(__dirname,'Commands'),{ avoidedChannels: 'ChannelID'}))\n`+
            `   Gloabal parameter is not neccessary.\n`+
            `SKDCommands --> Writing ReadME file...`
        ) 
        if(loc !== path.join(caller,'./')) {
            console.log(`SKDCommands --> ReadME.md at ${path.join(loc,'ReadME.md')} is Saved. Check it for more info...\nFetchEnds...`)
        } else {
            console.log(`No specified directory to save. Saving at default bot directory. Location: ${path.join(loc,'ReadME.md')} \nFetchEnds...`)
        }
        let file = fs.createWriteStream(path.join(loc,'ReadME.md'))
        file.end()
        let data = fs.readFileSync(path.join(__dirname,'readme.txt'))
        fs.writeFileSync('ReadME.md',data)
        exit()

    } else if(fn.toLowerCase() === 'givediscord') {
        if(dir_to_save){
            let isGiven = false
            if(dir_to_save){
                isGiven = true
            }
            let loc = isGiven ? dir_to_save : path.join(caller,'./')
            let file = fs.createWriteStream(path.join(loc,'ReadME(giveDiscord).md'))
            file.end()
            let data = `giveDiscord()__@ShadowHandler --> ReadLOG ::> \n`+
            `Usage: \n`+
            `   //In Main file\n`+
            `   const Discord = require('discord.js')\n`+
            `   giveDiscord(Discord)`+
            `FetchEnds...\n`+
            `Exiting the process. Don't Call fetchMethods() if you want to run the bot.`
            fs.writeFileSync('ReadME.md',data)
            exit()
        }
        console.log(
            `giveDiscord()__@ShadowHandler --> ReadLOG ::> \n`+
            `Usage: \n`+
            `   //In Main file\n`+
            `   const Discord = require('discord.js')\n`+
            `   giveDiscord(Discord)`+
            `FetchEnds...\n`+
            `Exiting the process. Don't Call fetchMethods() if you want to run the bot.`
        )
    } else {
        console.log(`Unknown method or function of ShadowHandler`)
    }
}