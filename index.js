const app = require("express")()
const path = require("path")
const bodyParser = require("body-parser")
const cookieSession = require("cookie-session")
const geoip = require("geoip-lite")
const helmet = require("helmet")
const dotenv = require("dotenv")

app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  )
  next()
})

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
)

app.disable("x-powered-by")
app.use(helmet())
dotenv.load()
app.use(
  cookieSession({
    secret: process.env.SECRET,
    cookie: {
      maxAge: 60000,
      httpOnly: true,
      secure: true,
    },
  })
)

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"))
})

app.get("/ip", function (req, res) {
  var ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress
  res.send(ipAddress)
})

app.get("/ip/:type", function (req, res) {
  var ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress
  if (req.params.type === "json") {
    res.json({ ip: ipAddress })
  } else if (req.params.type === "jsonp") {
    res.send('callback({"ip":' + JSON.stringify(ipAddress) + "});")
  }
})

app.get("/ip/:type/:callback", function (req, res) {
  var ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress
  if (req.params.type === "jsonp") {
    res.send(
      req.params.callback + '({"ip":' + JSON.stringify(ipAddress) + "});"
    )
  }
})

app.get("/geo", function (req, res) {
  var ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress
  var geo = geoip.lookup(ipAddress)
  res.json(geo)
})

app.use(function (err, req, res, next) {
  console.log(err)
  res.status(500).send("Something broke!")
})

const port = process.env.PORT || 3000
app.listen(port)
