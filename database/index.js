const vision = require('@google-cloud/vision');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app = express();

// ------------------------------ //
// GOOGLE VISION API
// ------------------------------ //

const client = new vision.ImageAnnotatorClient({
  keyFilename: './database/apiKey.json'
});

const getConvertedText = image => {
  console.log(image)
  return new Promise((resolve, reject) => {
    const request = {
      image: {
        source: { imageUri: image }
      }
    }

    client
      .textDetection(request)
      .then(response => {
        //console.log(response)
        resolve(response[0].fullTextAnnotation.text);
      })
      .catch(err => {
        reject(err);
      });
  })
};

// ------------------------------ //
// Mongo Database
// ------------------------------ //

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/foodApp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to the Mongo DB');
})

let foodSchema = mongoose.Schema({
  foodName: { type: String, unique: true },
  ingredients: Array,
  effect: String,
  date: Date
});

let Food = mongoose.model('Food', foodSchema);

let saveFood = (food, ingredients) => {
  let foodObj = {
    foodName: food,
    ingredients: ingredients,
    effect: null,
    date: Date()
  }
  return Food.create(foodObj)
    .then(response => {
      console.log('Successfully saved to DB.');
      console.log(response)
      return Food.find()
    })
    .catch(error => {
      console.error(error);
    })
}

let getAllFoods = () => {
  return Food.find({ foodName: { $ne: '' } }).sort({ date: -1 })
}

let getFoodInfo = (id) => {
  return Food.find({ _id: id })
}

const updateFood = async (effect, foodId) => {
  const doc = await Food.findOne({ _id: foodId });

  doc.overwrite({ ...doc, effect: effect });
  await doc.save();
  return doc;
}

// const updateFood = (effect, foodId) => {
//   const doc = Food.findOne({ _id: foodId });

//   doc.overwrite({ effect: effect });
//   await doc.save();
// }

module.exports = { saveFood, getAllFoods, getConvertedText, updateFood, getFoodInfo };