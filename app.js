let express = require('express');
let firebase = require('firebase');
let bodyParser = require('body-parser');
let cors = require('cors');

let app = express();
app.use(cors());
app.use(bodyParser.json()); //need to parse HTTP request body

var firebaseConfig = {
  apiKey: 'AIzaSyCnqTdSUG4sxEuDKQgIBX-Wz5U2ZpmCkCQ',
  authDomain: 'andela-mini-netflix.firebaseapp.com',
  databaseURL: 'https://andela-mini-netflix.firebaseio.com',
  projectId: 'andela-mini-netflix',
  storageBucket: 'andela-mini-netflix.appspot.com',
  messagingSenderId: '278018783962',
  appId: '1:278018783962:web:349d85300c6793785103e3',
  measurementId: 'G-EXN1R1WHD8'
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

// app.get('/', (request, response) => {
//   response.send('Bonjour');
// });

// get all movies in my firestore database
app.get('/all-movies', async (req, res, next) => {
  try {
    const noteSnapshot = await db.collection('mini-netflix-andela').get();
    const notes = [];
    noteSnapshot.forEach(doc => {
      notes.push(Object.assign({}, doc.data(), { id: doc.id }));
    });
    res.json(notes);
  } catch (e) {
    next(e);
  }
});

// get all favorites movies in my firestore database
app.get('/all-favorite-movies', async (req, res, next) => {
  try {
    const movies = [];
    let dbRef = await db
      .collection('mini-netflix-andela')
      .where('favorite', '==', true)
      .get()
      .then(movie => {
        if (!movie) {
          res.status(404).send({ error: 'Movie Not found' });
        }
        movie.forEach(doc => {
          movies.push(Object.assign({}, doc.data(), { id: doc.id }));
        });
        res.json(movies);
      });
  } catch (e) {
    next(e);
  }
});

// Update movie info, used for defining a movie as favorite by setting favorite attribute to true or false
app.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const movie = req.body;
    if (!id) throw new Error('id is missing');
    if (!movie) throw new Error('Movie is missing');
    var movieDocRef = db.collection('mini-netflix-andela').doc(id);

    movieDocRef
      .get()
      .then(function(doc) {
        if (doc.exists) {
          movieDocRef.set(movie, { merge: true });
          res.json(movie);
        } else {
          res.status(404).send({ error: 'Movie Not found' });
          // next('Movie Not found');
        }
      })
      .catch(function(error) {
        console.log('Error getting document:', error);
        res.status(404).send({ error: 'Une erreur est survenue durant le traitement de la requête' });
      });
  } catch (e) {
    next('Une erreur est survenue durant la requête');
  }
});

// app.post('/', (request, response) => {
//   // Traitement des données
// });

app.listen(8080, () => {
  console.log('Server is listening on port 8080');
});
