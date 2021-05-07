const express = require('express')
const bodyParser = require('body-parser')
const {check, validationResult} = require('express-validator')

const app = express()
const port = 5000

const urlencodedParser = bodyParser.urlencoded({extended: false})

app.set("view engine", "ejs")

app.get('',(req,res) =>{
    res.render('index')
})
app.get('/form',(req,res) =>{
    res.render('form')
})
app.post('/form', urlencodedParser, (req,res) => {
    res.json(req.body)
})

app.listen(port, ()=> console.info("App listening on port: ${port}"))