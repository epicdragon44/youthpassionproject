import React, { useState } from 'react';
import { AuthUserContext, withAuthorization } from '../Session';

// import { Jutsu, useJitsi } from 'react-jutsu'
// import Jutsu from 'react-jutsu'
import { withFirebase } from '../Firebase';
import Paywall from '../Paywall';
import SecureStorage from 'secure-web-storage';
require('dotenv').config()
var CryptoJS = require("crypto-js");
var SECRET_KEY = process.env.REACT_APP_KEY;
var secureStorage = new SecureStorage(localStorage, {
    hash: function hash(key) {
        key = CryptoJS.SHA256(key, SECRET_KEY);
 
        return key.toString();
    },
    encrypt: function encrypt(data) {
        data = CryptoJS.AES.encrypt(data, SECRET_KEY);
 
        data = data.toString();
 
        return data;
    },
    decrypt: function decrypt(data) {
        data = CryptoJS.AES.decrypt(data, SECRET_KEY);
 
        data = data.toString(CryptoJS.enc.Utf8);
 
        return data;
    }
});

function Vidcall(props)  {
  return (
    <div>
        Test
    </div>
  );
}

export default withFirebase(Vidcall);