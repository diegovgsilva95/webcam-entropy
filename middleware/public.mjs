import express from "express"
import { join } from "path"

export default class PublicMiddleware {
    /**
     * @param {Object} param0 
     * @param {express.Express} param0.app 
     * @param {string} param0.rootPath 
     */
    constructor({rootPath}){
        let publicPath = join(rootPath, "./public/")
        this.router = express.static(publicPath, { index: "index.htm" })
    }
}