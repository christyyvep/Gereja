/**
 * MyRajawali - Ultra Minimal Test Function
 */

const functions = require('firebase-functions');

// Minimal test function
exports.test = functions.https.onRequest((req, res) => {
  res.status(200).send('Hello World');
});

// Minimal with JSON
exports.testJson = functions.https.onRequest((req, res) => {
  res.status(200).json({ message: 'Hello JSON' });
});
