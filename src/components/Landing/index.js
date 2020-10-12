import React, { useEffect } from 'react';
import './landingstyle.css';
import AnchorLink from 'react-anchor-link-smooth-scroll'
import { Link } from 'react-router-dom';
import ReactPixel from 'react-facebook-pixel';
import { Helmet } from 'react-helmet';
import * as ROUTES from "../../constants/routes";

import { withFirebase } from '../Firebase';
import SecureStorage from 'secure-web-storage';

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

function Landing(props) {

    props.firebase.courses().on('value', snapshot => {
        const coursesObject = snapshot.val();
        const coursesList = Object.keys(coursesObject).map(key => ({
            ...coursesObject[key],
            appID: key,
        }));
        secureStorage.setItem('courses', coursesList);
    });

        return (
            <>
                <div className="landing-hero">
                    <h1><b>Learn with the<br></br> Youth Passion Project</b></h1>
                    <p></p>
                    <center>
                        {/* <div className="landing-flexrow"> */}
                            <Link id="mobilesignupbutton" to={ROUTES.SIGN_UP}><button>Sign Up Now</button></Link>
                            {/* <a className="button" href="https://discord.gg/dvJXfWh">Join the Discord</a> */}
                        {/* </div> */}
                    </center>
                </div>
                
                <div className="landing-footer">
                    <a href="https://modulusedu.com/">Powered by Modulus</a>
                    <br />
                    <div className="landing-flexrow"><a href="mailto:hello@modulusedu.com">Email</a> &nbsp; <a href="https://www.instagram.com/modulusweb.app/">Instagram</a> &nbsp; <a href="https://www.linkedin.com/company/68372192/">LinkedIn</a></div>
                </div>
            </>
        );
    // }
} 

export default withFirebase(Landing);