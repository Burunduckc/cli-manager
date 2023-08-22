import process from "node:process";
import fs from "fs";
import readline from "readline";
import path from 'path'
import crypto from "crypto";
import os from "os";
import zlib from "zlib";

const username = process.argv[2].indexOf('username=')

const currentDir = () => {
    console.log(`You are currently in ${process.cwd()}`)
}

const goodBye = () => {
    console.log((`Thank you for using File Manager, ${username ? process.argv[2].slice(10) : 'guest'}, goodbye!`))
    process.exit(0)
}

console.log(`Welcome to the File Manager, ${username ? process.argv[2].slice(10) : 'guest'}!`)
currentDir()

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


rl.on('line', (userValue: string) => {
    const com = userValue.trim()
    const [operation, ...args] = com.split(' ');
    switch (operation) {
        case 'ls':
            try {
                const filesRead = fs.readdirSync(process.cwd())
                filesRead.map((value, index) => {
                    console.log(`${index} ${value}`)
                })
            } catch (err) {
                console.log(`Operation field: ${err}`)
            }
            break;
        case 'cd':
            const newPath = args[0]
            const targetPath = path.resolve(process.cwd(), newPath)
            fs.access(targetPath, (error) => {
                if (error) {
                    console.log('Incorrect path')
                    return
                }

                try {
                    process.chdir(targetPath)
                    console.log(`Change directory to: ${targetPath}`)
                } catch (err) {
                    console.log(err)
                }
            })
            break;
        case 'add':
            if (args.length !== 2) {
                console.log('Usage: add <filename> <content>');
                break;
            }

            const newFile = args[0];
            const fileContent = args[1];

            try {
                fs.access(newFile, (error) => {
                    if (error) {
                        fs.writeFile(newFile, fileContent, (err) => {
                            if (err) {
                                console.log('Error creating file:', err);
                            } else {
                                console.log('File created');
                            }
                        });
                    } else {
                        console.log('Current file created')
                    }
                })
            } catch (err) {
                console.log(`Operation failed: ${err}`);
            }
            break;
        case 'rm' :
            if (args.length !== 1) {
                return
            }
            const fileForDelete = args[0]

            try {
                fs.access(fileForDelete, (error) => {
                    if (error) {
                        console.log('Delete cancel, file not exists or file already delete')
                        return;
                    } else {
                        fs.unlink(fileForDelete, (error) => {
                            console.log(`${fileForDelete} successfully delete`)
                        })
                    }
                })
            } catch (e) {
                console.log(`Operation failed: ${e}`)
            }
            break;
        case 'up':
            try {
                const currentPath = process.cwd();
                const parentPath = path.resolve(currentPath, '..');

                process.chdir(parentPath);
            } catch (err) {
                console.log(`Operation failed: ${err}`);
            }
            break;
        case 'cp':
            const filePath = args[0]
            const pathToCopy = args[1]

            try {
                const filePathStream = fs.createReadStream(filePath)
                const pathToCopyStream = fs.createWriteStream(pathToCopy)

                filePathStream.pipe(pathToCopyStream)

                filePathStream.on('end', () => {
                    console.log('File successfully copy')
                })

                filePathStream.on('error', () => {
                    console.log('Error copy file')
                })
            } catch (e) {
                console.log(`Operation failed: ${e}`)
            }
            break;
        case 'rn':
            if (args.length !== 2) {
                return;
            }
            const filePathForRename = args[0]
            const fileNewName = args[1]
            try {
                fs.access(filePathForRename, (error) => {
                    if (error) {
                        console.log('Current file not exists')
                    } else {
                        fs.rename(filePathForRename, fileNewName, (error) => {
                            if (error) {
                                console.log('Failed rename')
                            } else {
                                console.log('successfully')
                            }
                        })
                    }
                })
            } catch (e) {
                console.log(`Operation failed: ${e}`)
            }

            break;
        case 'cat' :
            if (args.length !== 1) {
                return;
            }
            const forRead = args[0]

            try {
                fs.access(forRead, (error) => {
                    if (error) {
                        console.log('file not exists')
                    } else {
                        const read = fs.readFileSync(forRead, 'utf-8')
                        console.log(read)
                    }
                })
            } catch (e) {
                console.log(`Operation failed: ${e}`)
            }
            break;
        case 'hash':
            if (args.length !== 1) {
                return;
            }
            try {
                const fileForHash = args[0]
                const fileData = fs.readFileSync(fileForHash)
                const hash = crypto.createHash('sha256').update(fileData).digest('hex')
                console.log(`Hash: ${hash}`)
            } catch (e) {
                console.log(`Operation failed: ${e}`)
            }

            break;
        //OS
        case 'os':
            const options = args[0]

            switch (options) {
                case '--EOL':
                    console.log(`${os.EOL}`)
                    break;
                case '--cpus':
                    const cpus = os.cpus()
                    console.log(`Number of CPUS: ${cpus.length}`)
                    cpus.map((threads, index) => {
                        console.log(`CPU ${index + 1}: Model: ${threads.model}`)
                    })
                    break;
                case '--username':
                    const username = os.userInfo().username
                    console.log(`Your username on os: ${username}`)
                    break;
                case '--homedir':
                    console.log(`Your homedir: ${os.homedir()}`)
                    break;
                case '--architecture':
                    console.log(`architecture: ${os.arch()}`)
                    break;
                default:
                    console.log('Invalid argument for OS')
            }
            break;
        //Compress
        case 'compress':
            if (args.length !== 2) {
                return;
            }

            try {
                const urlToFile = args[0]
                const urlLocateZip = args[1]

                const gzip = zlib.createGzip()
                const readMyFile = fs.createReadStream(urlToFile)
                const writeMyArchive = fs.createWriteStream(urlLocateZip)
                readMyFile.pipe(gzip).pipe(writeMyArchive)
                readMyFile.on('error', (error) => {
                    console.log('miss file')
                })
                readMyFile.on('end', () => {
                    console.log('successfully')
                })
            } catch (e) {
                console.log(`Operation failed: ${e}`)
            }
            break;
        case 'decompress':
            if (args.length !== 2) {
                return;
            }
            try {
                const urlToArchive = args[0]
                const urlToMyFile = args[1]

                const myArchive = fs.createWriteStream(urlToArchive)
                const output = fs.createWriteStream(urlToMyFile)

                const unzip = zlib.createGunzip()

                myArchive.pipe(unzip).pipe(output)
                myArchive.on('error', () => {
                    throw new Error('miss archive')
                })
                output.on('finish', () => {
                    console.log('All is okay')
                })
            } catch (e) {
                console.log('Operation failed', e)
            }
            break
        default:
            console.log('Invalid input')
    }
    currentDir()
})

rl.on('SIGINT', goodBye)