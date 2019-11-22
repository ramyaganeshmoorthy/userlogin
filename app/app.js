var express = require("express");
var bodyParser = require("body-parser");
var fs = require('fs');
const { Parser } = require('json2csv');
const mongoose = require('mongoose');
// Constants
const PORT = 3000;
const HOST = '0.0.0.0';
const uri = "mongodb+srv://admin:admin@123@cluster0-b81gs.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function (callback) {
    console.log("connection succeeded");
})

var app = express();
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));


var signupschema = mongoose.Schema({
    name: {
        type: String,
        alias: 'Label'
    },
    email: {
        type: String,
        alias: 'Value'
    },
    password: String,
    phone: String
});

var Signup = mongoose.model("user_details", signupschema);


app.get('/list', function (req, res) {
    Signup.find({ name: { $ne: '' }, email: { $ne: '' } }, 'name email', function (err, response) {
        if (err) throw err;
        var obj = JSON.stringify(response);
        res.send(obj);
    });
});

function fileCreation(err,response,res){
    if (err) throw err;
    const json2csvParser = new Parser({ fields, quote: '' });
    const csv = json2csvParser.parse(response);
    if (response.name != "" && response.email != "") {
        fs.writeFile('data.csv', csv, function (err) {
            if (err) throw err;
            res.download("data.csv")
        });
    }
}

const fields = ['Label', 'Value'];
app.get('/csv', function (req, res) {
    id = req.query.id;
    Signup.findById(id, 'name email', function (err, response) {
        fileCreation(err, response,res);
    })
});

app.get('/downloadcsv', function (req, res) {
    Signup.find({ name: { $ne: '' }, email: { $ne: '' } }, 'name email', function (err, response) {
        fileCreation(err, response,res);
    });

});

app.post('/check', function (req, res) {
    var nam = req.body.element;
    Signup.find().where('_id').in(nam).exec(function (err, response) {
        fileCreation(err, response,res);
    });
});

app.post('/sign_up', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var pass = req.body.password;

    var data = {
        "name": name,
        "email": email,
        "password": pass,
    }

    db.collection('user_details').insertOne(data, function (err, collection) {
        if (err) throw err;
        console.log("Record inserted Successfully");

    });

    return res.redirect('success.html');
})


app.get('/', function (req, res) {
    res.set({
        'Access-control-Allow-Origin': '*'
    });
    return res.redirect('index.html');
}).listen(PORT, HOST);


console.log(`Running on http://${HOST}:${PORT}`);