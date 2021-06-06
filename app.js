const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const passport = require('passport')
const connectDB = require('./config/db')
const session = require('express-session')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')

mongoose.Promise = global.Promise;

dotenv.config({path: './config/config.env'})
connectDB()

require('./config/passport')(passport)

const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())


if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const {formatDate, stripTags, truncate, editIcon} = require('./helpers/hbs')

// Register `hbs.engine` with the Express app.
app.engine('.hbs', exphbs({ helpers: 
  {formatDate, 
    stripTags, 
    truncate,
    editIcon
  },
  defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');


app.use(session({
  secret : 'mysecretkey',
  resave : true,
  saveUninitialized : true,
  store :MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

app.use(passport.initialize())
app.use(passport.session())

app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 5005
app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
    )

