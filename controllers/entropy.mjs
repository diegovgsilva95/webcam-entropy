import { resolve } from "path"
import { log } from "../server/utils.mjs"
import { appendFile } from "fs/promises"

export default class EntropyController {
    constructor(rootPath, outputPath){
        this.queue = []
        this.rootPath = rootPath
        this.outputPath = outputPath
        this.fullOutputPath = resolve(rootPath, outputPath)
        log(`[EntropyController] Entropy will write to the following path: \n\t${this.fullOutputPath}\n\tEnd the program immediately if you're not okay with it.\n\t(starting timer in 5 sec.)`)
        setTimeout(this.startTimer.bind(this), 5000)
    }
    startTimer(){
        log(`[EntropyController] Okay, so starting the timer (5sec. between writings)...`)
        this.timer = setInterval(this.handleTimer.bind(this), 5000)
    }
    async handleTimer(){
        if(this.queue.length > 0){
            let additions = this.queue.splice(0, this.queue.length)
            let additionsF32 = Float32Array.from(additions)
            let additionsOctets = new Uint8Array(additionsF32.buffer)
            log(`[EntropyController] Converted ${additions.length} numbers to bytestream (${additionsOctets.length} bytes)`)
            try {
                await appendFile(this.fullOutputPath, additionsOctets)
            } catch(e){
                log(`[EntropyController] Couldn't write to file: ${e}. Ending program.`)
                process.exit(1)
            }
            log(`[EntropyController] Successfully written.`)
        } else {
            log("[EntropyController] Ticking, but queue is empty.")

        }
    }
    feedEntropy(moreEntropyData){
        if(!Array.isArray(moreEntropyData))
            throw new Error("Expected array")
        
        for(let item of moreEntropyData)
            if(isNaN(item))
                throw new Error("Expected numeric items")
            
        log(`[EntropyController] Received ${moreEntropyData.length} numbers: `)
        log(moreEntropyData)
        this.queue.push(...moreEntropyData)
    }
}
