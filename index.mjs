import "dotenv/config"
import { clear } from "./server/utils.mjs"

import ServerController from "./controllers/server.mjs"

import PublicMiddleware from "./middleware/public.mjs"
import APIMiddleware from "./middleware/api.mjs"
import EntropyController from "./controllers/entropy.mjs"


const rootPath = (await import("path")).dirname((new URL(import.meta.url)).pathname)
const {
    OUTPUT: outputPath = "./entropy", 
    HTTPS_PORT: port = 8443,
    HTTPS_CERT: certPath = "",
    HTTPS_KEY: keyPath = "",
    HTTPS_CA: caPath = "",
    HTTPS_HOST: host = "127.0.0.1"
} = process.env

clear()

const server = new ServerController(rootPath)
const entropyCtrl = new EntropyController(rootPath, outputPath)

await server.loadCertPair({ certPath, keyPath, caPath })
await server.initHTTPSServer({ port, host })

await server.installMiddleware("/", PublicMiddleware, {})
await server.installMiddleware("/api", APIMiddleware, {entropyCtrl})
