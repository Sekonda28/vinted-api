require("dotenv").config();
const express = require('express')
const formidable = require('express-formidable')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')


const app = express()
app.use(formidable())
app.use(cors())
morgan('tiny')

mongoose.connect('mongodb://localhost:27017/VintedDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

//import routes
const userRoutes = require("./routes/user")
app.use(userRoutes)

const offerRoutes = require("./routes/offer")
app.use(offerRoutes)

app.listen(3000, ()=>{
    console.log("Server started on Port 3000");
})
