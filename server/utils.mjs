export const log = console.log.bind(console)
export const clear = () => typeof process === "undefined" ? console.clear() : process.stdout.write("\x1b[H\x1b[2J\x1b[3J")