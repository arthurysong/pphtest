const express = require('express');
const uuidv4 = require("uuid/v4");
const router = express.Router();

const request = require('request');
const braintree = require("braintree");
require('dotenv').config();

// console.log(braintree);
// console.log(process.env.BRAINTREE_PUBLIC);
var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: "9jvqr368s676gf66",
    publicKey: process.env.BRAINTREE_PUBLIC,
    privateKey: process.env.BRAINTREE_PRIVATE
  });

router.post("/checkout", (req, res) => {
    const nonceFromTheClient = req.body.payment_method_nonce;
    // use amount from the request to create a transaction...
    // console.log(req.body)
    gateway.transaction.sale({
        amount: "10.00",
        paymentMethodNonce: nonceFromTheClient,
        deviceData: req.body.deviceData,
        options: {
          submitForSettlement: true
        }
      }, function (err, result) {
          return res.status(201).json(result);
      });
})

// :::::FOR PAY PAL HERE SDK:::::

router.get('/access_token', (req, res) => {
    fetchAccessToken().then(body => {
        console.log(body);
        console.log(JSON.parse(body));
        // return res.status(200).json({ success: true });
        return res.status(200).json(JSON.parse(body));
    })
    // return res.status(200).json({ success: true });
})

function fetchAccessToken() {
    return new Promise ((resolve, error) => {
        const dataString = 'grant_type=client_credentials';
        const headers = {
            // 'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            // 'Accept-Charset': 'utf-8',
        }

        const options = {
            url: 'https://api.sandbox.paypal.com/v1/oauth2/token',
            method: 'POST',
            headers: headers,
            body: dataString,
            // Here need to get ID and Secret for LAG's paypal account...
            auth: {
                'user': process.env.PAYPAL_ID,
                'pass': process.env.PAYPAL_SECRET,
            }
        };

        request(options, (err, response, body) => {
            // console.log(body);
            // console.log(err);
            // console.log(response);
            // if (!error && response.statusCode === 200) {
            //     // console.log(body);
            //     resolve(body);
            // }
            resolve(body);
        });
    })
}

router.post('/capture_payment', (req, response) => {
    console.log(req.body);
    const id = uuidv4();
    fetchAccessToken().then(res => {
        // console.log(res);
        // orderDetails(req.body.orderID, JSON.parse(res).access_token).then(res => {
        //     console.log(res);
        //     return response.status(201).json(JSON.parse(res));
        // })
        capturePayment(req.body.authorizationID, id, JSON.parse(res).access_token).then(res => {
            console.log(res);
            return response.status(201).json(JSON.parse(res));
        })
    });
    
})

// function orderDetails(orderId, accessToken) {
//     return new Promise((resolve, error) => {
//         // console.log("orderId", orderId);
//         const headers = {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${accessToken}`
//         };
        
//         const options = {
//             url: `https://api.sandbox.paypal.com/v2/checkout/orders/${orderId}`,
//             headers: headers
//         };
        
//         request(options, (err, response, body) => {
//             resolve(body);
//         });
//     })
// }

// function capturePayment(authorizationID, requestId, accessToken) {
//     console.log(authorizationID);
//     return new Promise ((resolve, error) => {
//         const headers = {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${accessToken}`,
//             // unique paypal id.
//             'PayPal-Request-Id': requestId
//         };
    
//         const options = {
//             url: `https://api.sandbox.paypal.com/v2/payments/authorizations/${authorizationID}/capture`,
//             method: 'POST',
//             headers: headers
//         };
    
//         request(options, (err, response, body) => {
//             resolve(body);
//         });
//     })
    
// }

module.exports = router;