import express, { Router } from "express"
import { log } from "../server/utils.mjs"

export default class APIMiddleware {
    /**
     * @param {Object} param0 
     * @param {express.Express} param0.app 
     * @param {string} param0.rootPath 
     * @param {string} param0.outputPath
     */
    constructor({rootPath, outputPath, entropyCtrl}){
        this.outputPath = outputPath
        this.router = Router()
        this.entropyCtrl = entropyCtrl

        this.router.get("/entropy", this.handleGet.bind(this))
        this.router.post("/entropy", express.json(), this.handlePost.bind(this))
        this.router.use(this.handleError.bind(this))
    }

    /** @type {express.ErrorRequestHandler} */
    handleError(err, req, res, next) {
        if(err.type == "entity.parse.failed"){
            log(`Client sent non-JSON to ${req.url}`)
            return res.status(400).json({error: "Expected a JSON"})
        }

        log(`Had some weird error.`, err)
        res.status(500).end()
    }

    /** @type {express.Handler} */
    handleGet(req, res){ // Will return the stored entropy data for consumers
        res.json({msg: "To be implemented yet, not a priority (priority is to store and hoard the entropy)."}).end()
    }

    /** @type {express.Handler} */
    async handlePost(req, res){
        if(req.body == null || !Array.isArray(req.body.data)){ 
            console.log(`Client gave non-JSON data?`)
            res.status(400).json({error: "Expected a JSON"})
            return; 
        }

        try {
            this.entropyCtrl.feedEntropy(req.body.data)
        } catch(e){
            res.status(400).json({ error: e.message })
            return
        }
        res.json({success: true})
    }
}