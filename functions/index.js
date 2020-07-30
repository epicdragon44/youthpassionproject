const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors')({origin: true});
const app = express();
const admin = require('firebase-admin');
admin.initializeApp();

//  Remember to set token using >> firebase functions:config:set stripe.token="SECRET_STRIPE_TOKEN_HERE"
const stripe = require('stripe')(functions.config().stripe.token);

function charge(req, res) {
    const body = JSON.parse(req.body);
    const token = body.token.id;
    const amount = body.charge.amount;
    const currency = body.charge.currency;

    // Charge card
    stripe.charges.create({
        amount,
        currency,
        description: 'Firebase Example',
        source: token,
    }).then(charge => {
        send(res, 200, {
            message: 'Success',
            charge,
        });
    }).catch(err => {
        console.log(err);
        send(res, 500, {
            error: err.message,
        });
    });
}

function send(res, code, body) {
    res.send({
        statusCode: code,
        headers: {'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify(body),
    });
}

app.use(cors);
app.post('/', (req, res) => {

    // Catch any unexpected errors to prevent crashing
    try {
        charge(req, res);
    } catch(e) {
        console.log(e);
        send(res, 500, {
            error: `The server received an unexpected error. Please try again and contact the site admin if the error persists.`,
        });
    }
});

function updateSub(uid) {
    var ref = admin.database().ref(`subscriptions/${uid}`);
    ref.child('time').transaction(function(val){
        if (val === 0) return 0;
        if (val !== 1000000) return val -=1
        else return val;
    });
}

exports.countTime = functions.https.onRequest((req, res) => {
    
    var dbRef = admin.database().ref(`subscriptions`);
    dbRef.once('value', function(snapshot) {
        for ( let i  in snapshot.val()){
            console.log(i);
            updateSub(i);
        }
      });
    res.redirect(200);
});

exports.charge = functions.https.onRequest(app);