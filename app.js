const express = require('express')
const bodyParser = require('body-parser')
const {check, validationResult} = require('express-validator')
const path = require('path')
const multer = require('multer');
const mongoose = require('mongoose');

const app = express()
const port = 5000;

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'files');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const urlencodedParser = bodyParser.urlencoded({extended: false})

app.set("view engine", "ejs")

app.use(multer({storage: fileStorage}).single('file'));
app.use(express.static(path.join(__dirname, "public")));


var usersRouter = require("./routes/user");
var indexRouter = require("./routes/index");

/*
app.get('',(req,res) =>{
    res.render('index')
})
app.get('/form',(req,res) =>{
    res.render('form')
})*/


app.post('/form', urlencodedParser, (req,res) => {
    res.json(req.body)
})

app.use("/user", usersRouter);

app.use("/", indexRouter);



/*
mongoose
  .connect(
    "mongodb+srv://arnobkumarsaha:sustcse16@cluster0.nj6lk.mongodb.net/searchableEncryption?retryWrites=true&w=majority"
  )
  .then(result =>{
    app.listen(port, ()=> console.info("App listening on port: " , port))
    console.log("Yesss ! MongoDb is connected.");
  })
  .catch(err =>{
    console.log(err);
  });

*/

app.listen(port, ()=> console.info("App listening on port: " , port))