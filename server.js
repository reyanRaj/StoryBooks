const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const exphbs = require('express-handlebars')
const connectDB = require('./config/db');
const passport = require('passport');
//Load config
dotenv.config({ path: './config/config.env' })

// Passport Config
require('./config/passport')(passport)

const PORT = process.env.PORT || 5000;
const app = express()

// BOdy parser
app.use(express.urlencoded({ extended: false}))
app.use(express.json())

//Method Override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  })
)


//Connect to Databse
connectDB();

if(process.env.NODE_ENV === 'development'){
	app.use(morgan('dev'));
}

//Handlebar helper
const {formatDate, truncate, stripTags, editIcon,select}  = require('./helper/hbs');

// Setting the view engine
app.engine('.hbs', exphbs({helpers: {
	formatDate,truncate, stripTags,editIcon,select
},extname: '.hbs'}));
app.set('view engine', '.hbs');

//Session middleware
app.use(session({
	secret: 'amIDog',
	resave: false,
	saveUninitializedSession: false,
	 store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI
        })
}))

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Global Variable
app.use((req,res,next)=>{
	res.locals.user = req.user || null;
	next()
})


//Setting static foelder
app.use(express.static(path.join(__dirname,'public')));


// Routes
app.use('/',require('./routes/index'))
app.use('/auth',require('./routes/auth'))
app.use('/stories',require('./routes/stories'))


app.listen(PORT , console.log(`Server running on ${process.env.NODE_ENV} mode on port ${PORT}`))