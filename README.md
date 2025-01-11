# Introduction
As the name implies, it extracts entropy out of webcam real-time imagery, writing a file full of (perhaps) true randomness (serialized as 32-bit float sequence) that can be reused later.

# Requirements

## A blindfolded webcam
Exactly: a fully covered webcam. As counterintuitive as it may seem, the webcam needs to be fully covered. Natural and artificial phenomena, such as environmental radiation, EMI upon the circuitry as well as thermal fluctuation, those phenomena make noise which is captured by the camera. When the camera is fully covered, this forces the automatic digital gain to be maxed out, reducing the SNR thus amplifying the noise. As this project revolves around noise, it's a desirable consequence of automatic gain.

## NPM dependencies
- Express.js (express)
- dotenv (I'm sticking to an old version of Node.js; I'm aware that newer versions seem to load the `.env` natively)

## Instructions
1. Clone the repo to a folder
2. `cd` to the folder
3. Install the dependencies (`npm install`)
4. Create an `.env` file pointing which filepath to write (`OUTPUT`), which port to listen (`HTTPS_PORT`) and which pair of cert (`HTTPS_CERT`) and key (`HTTPS_KEY`) to use for HTTPS (optionally, you can also point a CA cert via `HTTPS_CA`). The pair needs to be recognized by your browsers (I recommend that you make a self-signed CA to yourself, and using it to sign a certificate, then installing your self-signed CA as trusted).
5. Run the daemon (`node index.mjs`)
6. Open the browser and access `https://<your-local-ip>:<your-port>/`.
7. Click/touch anywhere on the page to start the webcam video (if not started automatically) and it'll start generating entropy which will be delivered back to the daemon.
8. You can repeat steps 6 and 7 for using many devices simultaneously.

## Testing/visualize-entropy-file.htm
It's just an idea on how to visualize it, in order to determine the quality of randomness. I better come with something better next time...