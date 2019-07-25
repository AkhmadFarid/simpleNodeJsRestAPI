const express = require('express')
const app = express()
const morgan = require("morgan")
const expressValidator = require('express-validator')
const bodyParser = require('body-parser')
const userRouter = require('./routes/users')
const methodOverride = require('method-override')
const fileUpload = require('express-fileupload')
const flash = require('express-flash')
const session = require('express-session')

app.use(morgan('short'))
app.set('view engine', 'ejs')
app.use(express.static('views'))
app.use(expressValidator())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(fileUpload())
app.use(flash())

app.use(session({
    cookie: {maxAge: 6000},
    secret: 'weuw',
    resave: false,
    saveUninitialized: false
}))

app.use(methodOverride(function(req, res){
    if(req.body && typeof req.body === 'object' && '_method' in req.body){
        var method = req.body._method
        delete req.body._method
        return method
    }
}))

app.use('/', userRouter)

app.listen(3003, () => {
    console.log("Server is up and listening on 3003...")
})