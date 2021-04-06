const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const admin = require('firebase-admin');
const db = admin.firestore();

const authMiddleWare = require('../authMiddleware');

const postApp = express();
postApp.use(authMiddleWare);

postApp.use(cors({ origin: true }));

postApp.get('/:id', async (req, res) => {
    const userId = req.params.id;
    const snapshot = await db.collection('users').doc(userId).collection('posts').get();

    let posts = [];
    snapshot.forEach(doc => {
        let id = doc.id;
        let data = doc.data();

        posts.push({ id, ...data });

        res.status(200).send(JSON.stringify(posts));
    });

});

postApp.post('/new/:id', async (req, res) => {
    const userId = req.params.id;
    const title = req.body.title;
    const imageUrl = req.body.image;

    const data = {
        title: title,
        imageUrl: imageUrl
    }

    await db.collection('users').doc(userId).collection('plants').add(data);

    res.status(201).send();
});

postApp.put('/:id', async (req, res) => {
    const id = req.params.id;
    const body = req.params.body;

    await db.collection('users').doc(userId).collection('plants').doc(id).update(body);

    res.status(200).send();
});

postApp.delete('/:id', async (req, res) => {
    const userId = req.params.id;
    const docId = JSON.parse(req.body.postId);

    await db.collection('users').doc(userId).collection('plants').doc(docId).delete();

    res.status(200).send();
});

exports.post = functions.https.onRequest(postApp);