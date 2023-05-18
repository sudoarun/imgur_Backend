
//import Statements
const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
var bodyParser = require('body-parser');
// const formidable = require('express-formidable');
const { Schema } = mongoose;
const PORT = process.env.PORT || 8080;
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2
require('dotenv').config();

// server init
const app = express();
const corsOptions = {
    origin: process.env.FRONTENDURL
};



//Server MiddleWare
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));   // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
// app.use(formidable());
app.use(fileUpload({
    useTempFiles: true
}));

// Configuration

cloudinary.config({
    cloud_name: process.env.CloudName,
    api_key: process.env.KEY,
    api_secret: process.env.SECRET
});

mongoose.Promise = global.Promise;
mongoose
    .connect(process.env.MONGODBURL)
    .then(data => {
        console.log('MongoDB is Connected')
    })
    .catch(err => console.log(err))

const PostSchema = new Schema({
    title: String,
    desc: String,
    imgPath: String
})
const Post = mongoose.model('Post', PostSchema);

//Server Routes

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
})

//Get all Data Route
app.get('/post', (req, res) => {
    Post.find({})
        .then(data => res.send(data))
        .catch(err => res.status(500).send(err))
})

//Post Route
app.post('/', (req, res) => {
    // console.log(req.fields);
    const fileUpload = req.files.img;
    // console.log(fileUpload)
    cloudinary.uploader.upload(fileUpload.tempFilePath, { folder: 'Imgur', transformation: { width: 500, height: 500 } }, (err, result) => {
        // console.log(result);
        let Post_title = req.body.title
        let Post_desc = req.body.desc
        var Post1 = new Post({
            title: Post_title,
            desc: Post_desc,
            imgPath: result.url
        })
        Post1.save()
            .then(data => res.send(data))
            .catch(err => res.status(500).send(err))
    })

})


//Update Route 

app.patch('/', (req, res) => {
    let Post_title = req.body.title
    let Post_desc = req.body.desc
    let Post_new_desc = req.body.new_desc
    Post.update({
        title: Post_title,
        desc: Post_desc

    }, {
        desc: Post_new_desc
    })
        .then(data => res.send(data))
        .catch(err => res.status(500).send(err))
})


//Delete Route
app.delete('/', (req, res) => {
    let Post_title = req.body.title
    let Post_desc = req.body.desc
    Post.deleteOne({
        title: Post_title,
        desc: Post_desc
    })
        .then(data => res.send(data))
        .catch(err => res.status(500).send(err))
})


//server Start

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})