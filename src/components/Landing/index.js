import React, { useEffect } from 'react';
import './landingstyle.css';
import AnchorLink from 'react-anchor-link-smooth-scroll'
import { Link } from 'react-router-dom';
import ReactPixel from 'react-facebook-pixel';
import { Helmet } from 'react-helmet';
import * as ROUTES from "../../constants/routes";

import { withFirebase } from '../Firebase';
import SecureStorage from 'secure-web-storage';
import { Redirect } from "react-router-dom"; 
import fish1 from './fish1.svg';
import fish2 from './fish2.svg';

import partner1 from './images/koinpartner1.png';
import partner2 from './images/koinpartner2.png';
import partner3 from './images/koinpartner3.png';
import partner4 from './images/koinpartner4.png';
import partner5 from './images/koinpartner5.png';

import courseimg from './koingraphic1.png';
import discordimg from './koingraphic2.png';

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


const linkstyle = {
    fontSize: 20,
    color: 'white',
};

function Landing(props) {
    const advancedMatching = { em: 'kelly8hu@gmail.com' }; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/advanced/advanced-matching
    const options = {
        autoConfig: true, // set pixel's autoConfig
        debug: false, // enable logs
    };
    ReactPixel.init('913473442493570', advancedMatching, options);
    ReactPixel.pageView();

    props.firebase.courses().on('value', snapshot => {
        const coursesObject = snapshot.val();
        const coursesList = Object.keys(coursesObject).map(key => ({
            ...coursesObject[key],
            appID: key,
        }));
        secureStorage.setItem('courses', coursesList);
    });

    const [isMobile, setIsMobile] = React.useState('large');

    function updateWindowDimensions() {
        if (window.innerWidth<0) { //LEGACY, UNUSED
            setIsMobile('small');
        }
        else if (window.innerWidth<1100) {
            setIsMobile('medium');
        }
        else {
            setIsMobile('large');
        }
    }
    
    React.useEffect(() => {
        //update window size
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);
    });

    var d = new Date();
    var n = d.getFullYear();

    if (isMobile==='medium') {
        return (
            <>
                <div className="landing-hero">
                    <h1><b>Master your money</b></h1>
                    <p>Learn money management through our certified courses, and then apply your knowledge in an online simulation with other students.</p>
                    
                            <Link id="mobilesignupbutton" to={ROUTES.SIGN_UP}><button>Start Learning</button></Link>
                       
                </div>
                <div className="landing-about-mobile">
                    <center>
                        <div className="landing-icon">
                            <img src="https://img.icons8.com/wired/64/000000/checked.png"/>
                            <p>Learn from Expert-verified Courses</p>
                        </div>
                        <div className="landing-icon">
                            <img src="https://img.icons8.com/wired/64/000000/geography.png"/>
                            <p>Gain Real World Experience</p>
                        </div>
                        <div className="landing-icon">
                            <img src="https://img.icons8.com/wired/64/000000/groups.png"/>
                            <p>Join a global student community</p>
                        </div>
                    </center>
                </div>
                <div className="landing-features-mobile">
                    <div className="landing-mobile-section">
                        <center>
                        <img className="landing-sectionimg-light-mobile" src={courseimg}/>
                        <div className="landing-sectiondescr-mobile">
                        <br /><br />
                            
                                <h1>Learn valuable financial skills online...</h1>
                                <br />
                                <p>At Koin, you can learn from a variety of courses such as banking, tax paying, investments, microeconomics, and personal money management — all carefully crafted by experts for you. <br /><br /><b>Our course creators</b> include certified teachers, Silicon Valley entrepreneurs, and FBLA National Medalists. </p>
                            
                        </div>
                        <br /><br />
                        </center>
                    </div>
                    <div className="landing-mobile-section">
                        <center>
                        <img className="landing-sectionimg-dark-mobile" src={discordimg}/>
                        <br /><br />
                        <div className="landing-sectiondescr-mobile">
                            
                                <h1>...and then apply your skills in a digital economy of fellow students.</h1>
                                <br />
                                <p>Put your skills to the test by networking with your peers and replicating the real world financial experience with our online Discord economy simulation. Learn when to spend, and when to save.</p>
                            
                        </div>
                        <br /><br />
                        </center>
                    </div>
                </div>
                <center>
                    <div className="landing-pricing-mobile">
                        <h1>Pricing</h1>
                        <center>
                            <div className="landing-tile">
                                <h2>Free Trial</h2>
                                <hr />
                                <p>
                                    For one week, enjoy all the benefits of koin Premium without paying a dime.
                                </p>
                                <hr />
                                <h3>FREE</h3>
                            </div>
                            <div className="landing-tile">
                                <h2>Premium</h2>
                                <hr />
                                <p>
                                    Unlimited access to all courses, online games, and customer support.
                                </p>
                                <hr />
                                <h3>4.99 / mo</h3>
                            </div>
                            </center>
                        <center><Link id="mobilesignupbutton" to={ROUTES.SIGN_UP}><button>Start Learning Now</button></Link></center>
                    </div>
                </center>
                <div className="landing-footer">
                    Copyright {n} Koin Inc.
                    <br />
                    <a href="mailto:fincademy0@gmail.com">Contact</a>
                </div>
            </>
        );
    } else {
        return (
            <>
                <div className="landing-hero">
                    <h1><b>Master your money</b></h1>
                    <p>Learn money management through our certified courses,<br /> and then apply your knowledge in an online simulation with other students.</p>
                    <center>
                        {/* <div className="landing-flexrow"> */}
                            <Link id="mobilesignupbutton" to={ROUTES.SIGN_UP}><button>Learn Finance Online</button></Link>
                            {/* <a className="button" href="https://discord.gg/dvJXfWh">Join the Discord</a> */}
                        {/* </div> */}
                    </center>
                </div>
                <div className="landing-about">
                    <div className="landing-flexrow">
                        <div className="landing-icon">
                            <img src="https://img.icons8.com/wired/64/000000/checked.png"/>
                            <p>Learn from our <br />expert-verified courses</p>
                        </div>
                        <div className="landing-icon">
                            <img src="https://img.icons8.com/wired/64/000000/geography.png"/>
                            <p>Gain real-world experience</p>
                        </div>
                        <div className="landing-icon">
                            <img src="https://img.icons8.com/wired/64/000000/groups.png"/>
                            <p>Join a global  <br />student community</p>
                        </div>
                    </div>
                </div>
                <div className="landing-features">
                    <center><div className="landing-buffered" /></center>
                    <div className="landing-flexrow">
                        <img className="landing-sectionimg" src={courseimg}/>
                        <div className="landing-sectiondescr">
                            <h1>Learn valuable financial skills online...</h1>
                            <br />
                            <p>At Koin, you can learn from a variety of courses such as banking, tax paying, investments, microeconomics, and personal money management — all carefully crafted by experts for you. <br /><br /><b>Our course creators</b> include certified teachers, Silicon Valley entrepreneurs, and FBLA National Medalists.</p>
                        </div>
                    </div>
                    <center><div className="landing-buffered" /></center>
                    <div className="landing-flexrow">
                        <div className="landing-sectiondescr">
                            <h1>...and then apply your skills in a digital economy of fellow students.</h1>
                            <br />
                            <p>Put your skills to the test by networking with your peers and replicating the real world financial experience with our online Discord economy simulation. Learn when to spend, and when to save.</p>
                        </div>
                        <img className="landing-sectionimg" src={discordimg}/>
                    </div>
                </div>
                <div className="landing-partners">
                    <center><div className="landing-buffered" /></center>
                    <h1>Our Partners</h1>
                    <center>
                    <div className="landing-partnersrow">
                        <img src={partner1} height="75px" />
                        <img src={partner2} height="75px" />
                        <img src={partner3} height="75px" />
                        <img src={partner4} height="75px" />
                        <img src={partner5} height="75px" />
                    </div>
                    </center>
                    {/* <center><div className="landing-buffered" /></center> */}
                </div>
                <center>
                    <div className="landing-pricing">
                        <h1>Pricing</h1>
                        <div className="landing-flexrow">
                            <div className="landing-tile">
                                <h2>Free Trial</h2>
                                <hr />
                                <p>
                                    For one week, enjoy all the benefits of Koin Premium without paying a dime.
                                </p>
                                <hr />
                                <h3>FREE</h3>
                            </div>
                            <div className="landing-tile">
                                <h2>Premium</h2>
                                <hr />
                                <p>
                                    Unlimited access to all courses, online games, and customer support.
                                </p>
                                <hr />
                                <h3>4.99 / mo</h3>
                            </div>
                        </div>
                        <center><Link id="mobilesignupbutton" to={ROUTES.SIGN_UP}><button className="landing-bottombutton">Start Learning Now</button></Link></center>
                    </div>
                </center>
                <div className="landing-footer">
                    Copyright {n} Koin Inc.
                    <br />
                    <div className="landing-flexrow"><a href="mailto:fincademy0@gmail.com">Email</a> &nbsp; <a href="https://www.instagram.com/koinfinance/">Instagram</a> &nbsp; <a href="https://www.facebook.com/koinfinance/">Facebook</a> &nbsp; <a href="https://www.linkedin.com/company/koin-finance">LinkedIn</a></div>
                </div>
            </>
        );
    }
} 

export default withFirebase(Landing);