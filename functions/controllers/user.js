const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const admin = require('firebase-admin');
const db = admin.firestore();

const authMiddleWare = require('../authMiddleware');
const { firebaseConfig } = require('firebase-functions');

const userApp = express();
userApp.use(authMiddleWare);

userApp.use(cors({ origin: true }));


/////////creates a new user
userApp.post('/userName/:id', async (req, res) => {
    const userId = req.params.id;
    const userName = req.body.userName;
    const email = req.body.email;

    await db.collection('users').doc(userId).set({
        name: userName,
        email: email,
        friends: []
    });

    res.status(200).send("worked");
});


////////Add friend for user
userApp.post('/addFriend/:id', async (req, res) => {
    const userId = req.params.id;
    const emailToAdd = req.body.email;

    await db.collection('users').doc(userId).update({
        friends: admin.firestore.FieldValue.arrayUnion(emailToAdd)
    });

    res.status(200).send("added friend");
});

///////Gets all users
userApp.get('/', async (req, res) => {
    const snapshot = await db.collection('users').get();

    let users = [];
    snapshot.forEach(doc => {
        let id = doc.id;
        let data = doc.data();

        users.push({ id, ...data });

        res.status(200).send(JSON.stringify(users));
    });

});


//////Gets specific user
userApp.get('/:id', async (req, res) => {
    const snapshot = await db.collection('users').doc(req.params.id).get();

    const userId = snapshot.id;
    const userData = snapshot.data();

    res.status(200).send(JSON.stringify({ id: userId, ...userData }));
});

//////Adds a user
userApp.post('/', async (req, res) => {
    const user = JSON.parse(req.body);

    await db.collection('users').add(user);

    res.status(201).send();
});


//////Puts in data of user
userApp.put('/:id', async (req, res) => {
    const body = JSON.parse(req.body);

    await db.collection('users').doc(req.params.id).update(body);

    res.status(200).send();
});


//////Deletes user using id
userApp.delete('/:id', async (req, res) => {
    await db.collection('users').doc(req.params.id).delete();

    res.status(200).send();
});

exports.user = functions.https.onRequest(userApp);