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

mongoose.connect(process.env.MONGODB_URI)

app.get("/", (req, res)=>{
    res.json("Welcome to my Vinted-API 🚀😎")
})
//import routes
const userRoutes = require("./routes/user")
app.use(userRoutes)

const offerRoutes = require("./routes/offer")
app.use(offerRoutes)

app.listen(process.env.PORT, ()=>{
    console.log("Server started on Port 3000");
})
