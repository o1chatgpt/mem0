const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const fs = require("fs")

// Check if we're in production mode
const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

const PORT = process.env.PORT || 80

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(PORT, (err) => {
    if (err) throw err
    console.log(`> WebContainer Manager running on http://localhost:${PORT}`)
  })
})
