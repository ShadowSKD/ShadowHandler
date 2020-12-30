/**
 * Command Info object generator.
 * @param {*} dir takes the directory of commands folder.
 * @returns Information of commands in a new Map.
 */

module.exports = (dir) => {
    const fs = require('fs')
    const path = require('path')

    let commandInfo = new Map()

    commandInfo.set('home',{
        Name: 'home',
        Description: 'Home commands for user',
        aliases: [],
        Info: {
            Name: [],
            Description: [],
            syntax: [],
            reqRoles: [],
            isDM: [],
            aliases: []
        }
    })

    let home = fs.readdirSync(dir).filter(c => c.endsWith('.js'))
    for(const c of home) {
        const cFile = require(path.join(dir,c))
        let {
            Name,
            syntax = '',
            isDMCommand = false,
            requiredRoles = [],
            commands,
            Description,
            isNAC = false
        } = cFile
        if(isNAC === true) return
        commandInfo.get('home').Info.Name.push(Name)
        commandInfo.get('home').aliases.push(commands[0])
        commandInfo.get('home').Info.Description.push(Description)
        commandInfo.get('home').Info.isDM.push(isDMCommand)
        if(syntax === '') syntax = -1
        commandInfo.get('home').Info.syntax.push(syntax)
        if(requiredRoles.join(' ') === '') requiredRoles = -1 
        commandInfo.get('home').Info.reqRoles.push(requiredRoles)
        if (typeof commands === 'string') commands = [commands]
        commandInfo.get('home').Info.aliases.push(commands.join(' '))
    }

    const readCommands = (dir) => {
        
        let info = {
            Name: '',
            Description: '',
            aliases: [],
            Info: {
                Name: [],
                Description: [],
                syntax: [],
                reqRoles: [],
                isDM: [],
                aliases: []
            }
        }

        const Group = (dir) => {
            const files =fs.readdirSync(dir).filter(file => !file.endsWith('.js'))
            for(const file of files) {
                const stat = fs.lstatSync(path.join(dir, file))
                if(stat.isDirectory()) {
                    Group(path.join(dir,file))
                } else {
                    const cFile = require(path.join(dir, file))
                    const { isNaG = false, GroupName, GroupDescription, GroupCommands } = cFile
                    if (isNaG !==  true) {
                        info.Name = GroupName
                        info.Description = GroupDescription
                        info.aliases= GroupCommands
                        commandInfo.set(GroupName,info)
                        info = {
                            Name: '',
                            Description: '',
                            aliases: [],
                            Info: {
                                Name: [],
                                Description: [],
                                syntax: [],
                                reqRoles: [],
                                isDM: [],
                                aliases: []
                            }
                        }
                    }
                }
            }
        }
        
        const Commands = (dir) => {
            const cFiles = fs.readdirSync(dir).filter(f => !f.endsWith('.json'))
            for (const c of cFiles ) {
                const s = fs.lstatSync(path.join(dir, c))
                if (s.isDirectory()){
                    Commands(path.join(dir,c))
                } else {
                    const cFile = require(path.join(dir, c))
                    let {
                        Name,
                        syntax = '',
                        isDMCommand = false,
                        requiredRoles = [],
                        group = 'home',
                        commands,
                        Description,
                        isNAC = false
                    } = cFile
                    if(!isNAC || isNAC === false){
                        if(group !== 'home'){
                            if(commandInfo.has(group)){
                                commandInfo.get(group).Info.Name.push(Name)
                                commandInfo.get(group).Info.Description.push(Description)
                                if(!syntax) syntax =-1
                                commandInfo.get(group).Info.syntax.push(syntax)
                                if(!requiredRoles) requiredRoles =-1
                                commandInfo.get(group).Info.reqRoles.push(requiredRoles)
                                commandInfo.get(group).Info.isDM.push(isDMCommand)
                                if(typeof commands === 'string') commands = [commands]
                                commandInfo.get(group).Info.aliases.push(commands.join(' '))
                            } else {
                                console.warn(`SKDCommands --> ${Name} Command doesn't belong to any specified group. Please check whether the "${group}.json" file present in directory or spelling of group in ${Name} command file is correct.`)
                                console.log(`SKDCommands --> Cannot save command info of this command.`)
                            }
                        } if (dir.endsWith('home')){
                            throw new Error(`"home" is pre-registered group for your home directory. Please change name of the group.`)
                        }
                    } 
                }
            }
        }
        
        try {
            Group(dir)
            Commands(dir)
        } catch (error) {
            console.log(`SKDCommand --> ${error.message}`)
        }
    }
    
    readCommands(dir)
    
    return commandInfo
}