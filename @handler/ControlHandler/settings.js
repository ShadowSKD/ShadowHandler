module.exports = {
    Name: 'settings Command',
    commands: ['settings', 'set'],
    syntax: 'setings_name <arguments...>',
    permissionError: 'You have to Moderator of Server to Access this command',
    minArgs: 2,
    maxArgs: 2,
    permissions: ["ADMINISTRATOR"],
    Description: `Change settings for your server [ModOnly] \n**Use the following Commands**:\n1.prefix: Changes the prefix for your server. Usage \`\`\`!set prefix <prefix>\`\`\`\nNote: Use the prefix of your server in front of set or settings command, else it will not work. Default prefix is "!" `,
    group: 'home',
    execute: (msg, args, text, bot, dir, Information, db) => {
        if(args[0] !== 'prefix') return msg.channel.send(`Setting command take only prefix argument for now.`)
        let prefix = args[1]
        if(args[1].toLowerCase() === 'default') prefix = Information.get('DM').prefix
        Information.get(msg.guild.id).prefix = prefix
        db.set(`${msg.guild.id}.prefix`,prefix)
        msg.channel.send(`The prefix for ${msg.guild.name} is "\`${prefix}\`".`)
    },
    modularCommand: true
}