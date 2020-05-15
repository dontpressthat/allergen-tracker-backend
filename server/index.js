const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const awsInfo = require('./awsInfo.js');
const db = require('../database');
const dictionaryKey = require('../helpers/dictionary_api');
const axios = require('axios');


const s3 = new aws.S3({
  accessKeyId: awsInfo.awsAccessKeyId,
  secretAccessKey: awsInfo.awsSecretKey,
  region: "us-west-1",
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: awsInfo.bucket,
    acl: 'public-read',
    metadata(req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key(req, file, cb) {
      cb(null, Date.now().toString() + '.jpg');
    }
  })
})

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// app.use(express.static(__dirname + '/../client/dist'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const http = require('http').Server(app);

app.post('/uploadToAws', upload.single('photo'), (req, res, next) => {
  res.json(req.file)
});

// ------------------------------ //
// GOOGLE VISION API
// ------------------------------ //

app.get('/api/google', (req, res) => {
  db.getConvertedText(req.query.imageUri)
    .then((results) => res.status(200).json(results))
    .catch((err) => {
      console.log(err);
    });
});

// ------------------------------ //
// MERRIAM-WEBSTER API
// ------------------------------ //

app.get('/api/dictionary', (req, res) => {
  // console.log(req.query.words);
  let ingredients = req.query.words;
  let words = ingredients.slice(13).replace(/\(|\)|\[|\]|\,|\./g,'').replace(/\n/g, ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let wordsArray = words.split(' ');
  for (let i = 0; i < wordsArray.length; i++) {
    if (wordsArray[i].toLowerCase().endsWith('ed')) {
      wordsArray.splice(i, 1)
    }
  }
  let fixedWordsArray = [];

  // console.log(wordsArray)
  for (let j = 0; j < wordsArray.length; j++) {
    axios.get(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${wordsArray[j]}?key=${dictionaryKey.key}`)
      .then(response => {
        if (response.data[0].meta && !(fixedWordsArray.includes(response.data[0].meta.id.split(':')[0]))) {
          fixedWordsArray.push(response.data[0].meta.id.split(':')[0])
        }
      })
      .catch(error => {
        console.log(error)
      })
  }
  setTimeout(() => {
    return res.status(200).send(fixedWordsArray)
  }, 1000)
})

// ------------------------------ //
// DATABASE
// ------------------------------ //

app.post('/api/foods', (req, res) => {
  const food = req.body.food;
  const ingredients = req.body.ingredientsArray;
  // console.log(food, ingredients)
  db.saveFood(food, ingredients)
    .then((results) => res.status(200).json(results))
    .catch((err) => {
      throw err;
    });
});

app.get('/api/foods', (req, res) => {
  console.log(req)
  if (req.query.id) {
    db.getFoodInfo(req.query.id)
    .then((results) => res.status(200).json(results))
    .catch((err) => {
      throw err;
    });
  }
if (!req.query.id) {
  db.getAllFoods()
    .then((results) => res.status(200).json(results))
    .catch((err) => {
      throw err;
    });
}
});

app.put('/api/foods', async (req, res) => {
  const effect = req.body.effect;
  const foodId = req.body.foodId;
  // console.log(req)
  const doc = await db.updateFood(effect, foodId)
  // .then((results) => res.status(200).json(results))
  // .catch((err) => {
  //   throw err;
  // });
  res.status(200).json(doc);
})

let port =  3004;
http.listen(port, () => {
  console.log(`Listening on port ${port}`);
});