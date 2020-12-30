ShadowHandler: An andvanced command handler which make it easier for you to code.
This handler have automated functions with bulks of features for you.

SKDCommands ::: It reads the given Directory and check for commands in each folder in it.

    SKDCommands(Discord_Client(), DataBase, Directory, Global_Parameters)
    Note:"Global_Parameters is not necessary"

    Discord_Client(): Takes the Discord.Client() from your your main file.
    DataBase: Uses "quick.db" for storing data regarding guild prefixes offline. When the bot restarts it fecthes GuildInfo from DB with the prefix.
    Directory: Directory of commands.

Command Documentation:
    commandfile: It's module exports of the command. Module exports should have these properties.
        **commands,
        **Name,
        **execute,
        **Description,
        syntax,
        minArgs,
        maxArgs,
        permissions,
        permissionsError,
        requiredRoles,
        isDMCommand,
        parameters,
        isNAC,
        group,
        cooldown
    Note: ** These are are compulsion commands. Without these if the bot is started, it can cause errors.
    Properties Description:
        commands: Array or string of aliases. If message starts with any of the element in array of it, it will execute the command.
        Name: Name of the Command.
        execute: executable code for the command. It is the funtion which takes arguments of message, message_arguments, message_text and bot.
                "OR" execute(message,arguments,message_text,bot)
        Description: Description of the command.
        syntax: Usage of the command (without command Name)
            ex: syntax = '<argument_property>...'
        minArgs: Minimum number of arguments should be present for the command
        maxArgs: Maximum number of arguments that the command can take in.
        permissions: Array or string of permissions that the message user must have.
            Note: Don't use this property if isDMCommand is true or you don't know about permissions of members of discord.
        permissionsError: Gives this error to the message member when he don't have the permissions present in permissions.
        requiredRoles: Array or string of roles required for message member.
        isDMCommand: Boolean constant. If true then the command will execute even in Direct Messages.
        parameters: Object parameters -->   {
                                                blacklist: [],
                                                whitelist: [],
                                                isMOC: false, 
                                                AccessMembers: [],
                                                isOwnerOnly
                                            }
                blacklist: Array of channelIDs in which this command won't execute.
                whitelist: Array of channelIDs in which this command can only be executed.
                    Note: If blacklist and whitelist are declared together then error will occur.
                isMOC: isMemberOnlyCommand , Boolean. When true , membersIDs present in AccessMembers can only access the command.
                    Note: If no AccessMembers while isMOC is true, then error will occur.
                isOwnerOnly: If You are testing the command and don't want others to test command then use this command.
        isNAC: if your file ends with '.js' and The file is not an command file then just add property isNAC = true to the module exports of '.js' file. The file will not be readed.
        group: Name of the group in which the command is present.
        cooldown: Timeof cooldown for command. It should be number. The Number represents amount of time in seconds.

Group Documentation:
    groupFile: It's ".json" file have properties of the group folder.
        **GroupName: Name of group. ,
        **GroupDescription: Description of the group. ,
        isNAG: Boolean constant, if true, the file wont be considered as Group.

Update_log@v1.0.0:
    Global_Parameters: { avoidedChannels: [<array of channelIDs>]}
        - the bot won't execute on those channels.
