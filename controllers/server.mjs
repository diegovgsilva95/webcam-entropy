import { readFile } from "fs/promises"
import express from "express"
import https from "https"
import { log } from "../server/utils.mjs"
import { resolve } from "path"

export default class ServerController {
    constructor(rootPath){
        this.rootPath = rootPath
        this.defaultOpts = {
            rootPath: this.rootPath
        }
        this.app = express()
    }
    async loadCertPair({keyPath, certPath, caPath = ""}){ 
        // CA is optional so it should only throw if its path is present.
    
        if(
            typeof keyPath !== "string" || typeof certPath !== "string" || 
            keyPath.trim().length == 0 || certPath.trim().length == 0
        ){
            throw new ReferenceError(`Invalid HTTPS cert/key.\nDetailed error: unspecified key/cert.`)
        }
        
        
        let cert = null
        let key = null
        let ca = null
        
        try {
            cert = await readFile(resolve(this.rootPath, certPath), "utf-8")
            key = await readFile(resolve(this.rootPath, keyPath), "utf-8")
        } catch(e){
            throw new ReferenceError(`Invalid HTTPS cert/key.\nDetailed error: ${e}`)
        }
        
        if(typeof caPath === "string" && caPath.length > 0)
            try {
                ca = await readFile(resolve(this.rootPath, caPath), "utf-8")
            } catch(e){
                throw new ReferenceError(`Invalid HTTPS CA.\nDetailed error: ${e}`)
            }
    
        this.cert = cert
        this.key = key
        this.ca = ca
        // return {cert, key, ca}
    }
    async initHTTPSServer({port = 8443, host = "127.0.0.1"}){
        let {cert, ca, key, app} = this
        if(typeof key !== "string" || typeof cert !== "string")
            throw new ReferenceError("Cannot start HTTPS without loading certs")
        

        this.serverHTTPS = https.createServer({cert, key, ca}, app)
        this.serverHTTPS.listen(port, host)
    }
    async installMiddleware(path, Middleware, optionalOpts = {}){
        if(typeof optionalOpts !== "object" || optionalOpts === null)
            optionalOpts = {}
    
        let allOpts = {...this.defaultOpts, ...optionalOpts}

        if(typeof Middleware === "object"){
            if(Middleware != null && typeof Middleware.router === "function")
                this.app.use(path, Middleware.router) // Not going to use options. 
            else // It's either null or doesn't have router
                throw TypeError("Middleware should be either a function/class or an object with a router property.")
        }
        else if(typeof Middleware === "function"){ 
            // So it could be either be a direct function or a class.
            // For the sake of simplicity, I'd just consider as class and construct an instance out of it.
            let middleware = new Middleware(allOpts)

            if(typeof middleware.router === "function")
                this.app.use(path, middleware.router)
            else
                throw new TypeError(`Middleware ${Middleware.name} doesn't have a router.`)
        }
    }
}