const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const admin = require('firebase-admin');
const db = admin.firestore();

const authMiddleWare = require('../authMiddleware');
const { firebaseConfig } = require('firebase-functions');

const postApp = express();
postApp.use(authMiddleWare);

postApp.use(cors({ origin: true }));


///////////////////Gets posts from specific user using user id
postApp.get('/:id', async (req, res) => {
    const userId = req.params.id;
    const snapshot = await db.collection('users').doc(userId).collection('plants').get();

    let posts = [];
    snapshot.forEach(doc => {
        let id = doc.id;
        let data = doc.data();

        posts.push({ id, ...data });
    });

    res.status(200).send(JSON.stringify(posts));
});

/////////////Gets posts from friends of user using user id
postApp.get('/friendPosts/:id', async (req, res) => {
    const userId = req.params.id;
    const doc = await db.collection('users').doc(userId).get();

    var user = doc.data();
    const friends = user.friends;

    const friendsEmails = [];
    friends.forEach(friendEmail => {
        var mailToString = String(friendEmail);
        friendsEmails.push(mailToString);
    });

    const usersToGetFrom = await db.collection('users').where("email", "in", friendsEmails).get();

    let users = [];
    usersToGetFrom.forEach(doc => {
        users.push(doc);
    });
    
    let userDataList = [];
    for (var i = 0; i < users.length; i++) {
        let user = users[i];
        
        let friendId = user.id;
        let userName = user.data().name;

        const plantsDocs = await db.collection('users').doc(friendId).collection('plants').get();

        
        try {
            let plants = [];
                plantsDocs.forEach(doc => {
                let id = doc.id;
                let data = doc.data();

                plants.push({ id, ...data });
            });

            var userData = {
                userName: userName,
                plants: plants
            }
        userDataList.push(userData);

        } catch (e) {
            functions.logger.log("Error: ", e);
        }
    }


    res.status(200).send(JSON.stringify(userDataList));
});


////////////creates a new post(plant)
postApp.post('/new/:id', async (req, res) => {
    const userId = req.params.id;
    const title = req.body.title;
    const imageUrl = req.body.image;

    const watering = req.body.watering;
    const temperature = req.body.temperature;
    const sunlight = req.body.sunlight;

    const note = req.body.note;

    const height = req.body.height;

    const time = req.body.time;

    const data = {
        title: title,
        imageUrl: imageUrl,
        watering: watering,
        height: height,
        temperature: temperature,
        sunlight: sunlight,
        note: note,
        creationTime: time,
        updates:  [ {height:  height, imageUrl: imageUrl, note: note, time: time, daysOld: "0"} ] 
    }

    await db.collection('users').doc(userId).collection('plants').add(data);

    res.status(201).send();
});


///////////creates a new update for a post(plant)
postApp.put('/newUpdate/:id', async (req, res) => {
    const userId = req.params.id;
    const plantId = req.body.plantId;

    const height = req.body.height;
    const time = req.body.time;
    const note = req.body.note;

    const daysOld =req.body.daysOld;

    const imageUrl = req.body.imageUrl;

    const data = {height:  height, imageUrl: imageUrl, note: note, time: time}

    await db.collection('users').doc(userId).collection('plants').doc(plantId).update({
        imageUrl: imageUrl,
        height: height
    })
    
    await db.collection('users').doc(userId).collection('plants').doc(plantId).update(({
        updates: admin.firestore.FieldValue.arrayUnion({
            height: height,
            imageUrl: imageUrl,
            note: note,
            daysOld: daysOld,
            time: time
        })
    }));

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