const log = console.log.bind(console)
const sleep = ms => new Promise(r => setTimeout(r, ms))

let entropyQueue = []
// In the start, it's all zeroes. Wait until values, then start storing.
let storingEntropy = false
let cumulatedDebiased = []

async function sendEntropy(data){
    await fetch("/api/entropy", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            data
        })
    })
}

async function initWebcam(){
    let webcam

    try {
        webcam = await navigator.mediaDevices.getUserMedia({
            video: {
                width: {ideal: 1280},
                height: {ideal: 720},
                facingMode: { ideal: "environment" }
            }
        })
    }
    catch(e) {
        document.body.appendChild(document.createElement("h2")).innerText = "Error getting webcam"
        log("Error getting webcam:", e)
        return null
    }

    const video = document.createElement("video")
    document.body.appendChild(video)
    video.controls = true
    video.autoplay = true
    video.srcObject = webcam

    window.video = video

    video.addEventListener("playing", () => {
        log("It's playing. Start canvas.")
        initCanvas()
    })

    if(video.paused){
        try {
            await video.play()
            await sleep(100)
            if(video.paused)
                throw new Error("Video is still paused")
        }
        catch(e){
            log("Autoplay is probably disabled, trying via user gesture...")
            let elm = document.createElement("h2")
            elm.innerText = "Click anywhere to start video"
            document.body.appendChild(elm)
            addEventListener("click", () => {
                    elm.remove()
                    video.play()
                }, 
                {once: true}
            )
        }
    }
}

function initCanvas(width = 64, height = 36){
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    document.body.appendChild(canvas)

    const ctx = canvas.getContext("2d", {willReadFrequently: true})

    window.canvas = canvas
    window.ctx = ctx

    setInterval(drawVideoFrame, 1000/10)
    setInterval(flushEntropy, 5000)
}

async function drawVideoFrame(){
    let W = canvas.width
    let H = canvas.height

    ctx.drawImage(video, 0, 0, W, H)
    const imageData = ctx.getImageData(0, 0, W, H)
    const data = imageData.data

    const noiseBits = []

    for(let i = 0; i < imageData.data.length; i+=4){
        noiseBits.push(data[i] & 1)     // Red LSB
        noiseBits.push(data[i+1] & 1)   // Green LSB
        noiseBits.push(data[i+2] & 1)   // Blue LSB
    }

    // Von Neumann debiasing
    const debiased = cumulatedDebiased
    for(let i = 0; i < noiseBits.length - 1; i+=2){
        if(noiseBits[i] !== noiseBits[i + 1]) {
            debiased.push(noiseBits[i])
        }
    }

    if(debiased.length < 32){
        log("Not enough bits yet. Got", debiased.length)
        cumulatedDebiased = debiased
        return
    }
    cumulatedDebiased = []

    let randomValue = 0
    let poweredDebiased = []
    for(let i = 0; i < debiased.length; i++){
        let curVal = (debiased[i] * (2 ** (debiased.length - i - 1))) / (2 ** debiased.length)
        randomValue += curVal
        poweredDebiased.push(curVal)
    }

    if(storingEntropy)
        entropyQueue.push(randomValue)
    else if(randomValue !== 0) {
        storingEntropy = true
        entropyQueue.push(randomValue)
    }
}

async function flushEntropy(){
    if(entropyQueue.length > 0){
        log("Flushing entropy...", entropyQueue)
        try {
            await sendEntropy(entropyQueue)
        } catch(e){
            log("Error sending entropy:", e)
        }
        entropyQueue = []
    }
}


await initWebcam()