const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient({
  keyFilename: './apiKey.json'
});

const getConvertedText = imagePath => {
  return new Promise((resolve, reject) => {
    const request = {
      image: {
        source: {filename: imagePath}
      }
    }
    
    client
      .textDetection(request)
      .then(response => {
        resolve(response[0].fullTextAnnotation.text);
      })
      .catch(err => {
        reject(err);
      });
  })
};

module.exports = { getConvertedText }