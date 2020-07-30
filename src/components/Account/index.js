
import React from 'react';

import { AuthUserContext, withAuthorization } from '../Session';
import PasswordChangeForm from '../PasswordChange';
import { PieChart } from 'react-minimal-pie-chart';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import SignOutButton from '../SignOut';
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


function VarkProfile(props) {
    const lineWidth = 60;
    return (
        <div className="varkprofile">
            <PieChart
                style={{
                    fontFamily:
                    '"Nunito Sans", -apple-system, Helvetica, Arial, sans-serif',
                    fontSize: '8px',
                    height: "150px",
                }}
                data={[
                    {
                        color: 'red',
                        title: 'V',
                        value: props.Vcnt,
                    },
                    {
                        color: 'blue',
                        title: 'A',
                        value: props.Acnt,
                    },
                    {
                        color: 'green',
                        title: 'R',
                        value: props.Rcnt,
                    },
                    {
                        color: 'purple',
                        title: 'K',
                        value: props.Kcnt,
                    },
                ]}
                radius={PieChart.defaultProps.radius - 6}
                lineWidth={60}
                segmentsStyle={{ transition: 'stroke .3s', cursor: 'pointer' }}
                animate
                label={({ dataEntry }) => Math.round(dataEntry.percentage) + '%'}
                labelPosition={100 - lineWidth / 2}
                labelStyle={{
                    fill: '#fff',
                    opacity: 0.75,
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}

function currentUserIsAdmin() {
    const usr = secureStorage.getItem('authUser');
    return (Object.values(usr).slice()[3][0]==="ADMIN");
}

function AccountPage(props) {
    const [showUID, setShowUID] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    // if(!window.location.hash) {
    //     window.location = window.location + '#loaded';
    //     window.location.reload();
    // }

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

    const usr = secureStorage.getItem('authUser');
    var values = Object.values(usr).slice()[6];
    var Vcnt = 0;
    var Acnt = 0;
    var Rcnt = 0;
    var Kcnt = 0;
    var varkLetter;
    for (varkLetter of values) {
        if (varkLetter==="V") {
            Vcnt++;
        }
        if (varkLetter==="A") {
            Acnt++;
        }
        if (varkLetter==="R") {
            Rcnt++;
        }
        if (varkLetter==="K") {
            Kcnt++;
        }
    }

    var varkProfile = (
        <VarkProfile 
            Vcnt={Vcnt}
            Acnt={Acnt}
            Rcnt={Rcnt}
            Kcnt={Kcnt}
        />
    );

    var topPanel = (null
        // <div class="largecontent">
        //     <center>
        //         <h1><br /> <br />Your VARK Profile</h1> 
        //         <p className="widespace">Based on what you clicked on within courses,<br /> we estimated your learning style preferences.</p> <br />
        //         <table className="offsetleft">
        //             <tr>
        //                 <td>
        //                     {varkProfile}
        //                 </td>
        //                 <td>
        //                     <p style={{color: "red"}}>Visual</p>
        //                     <p style={{color: "blue"}}>Auditory</p>
        //                     <p style={{color: "green"}}>Reading/Writing</p>
        //                     <p style={{color: "purple"}}>Kinesthetic</p>
        //                 </td>
        //             </tr>
        //         </table>
                
        //     </center>
            
        //     <center>
        //         {/* <p style={{color: "red"}}>Visual: Learns best through diagrams and charts</p>
        //         <p style={{color: "blue"}}>Auditory: Learns best through videos and lectures</p>
        //         <p style={{color: "green"}}>Reading/Writing: Learns best through reading and writing</p>
        //         <p style={{color: "purple"}}>Kinesthetic: Learns best through touching and testing</p> */}
        //         <br />
        //         {/* <p className="widespace">All students learn in different ways, and by knowing your VARK Profile,<br /> you can invest in courses that match your preferred education. </p> */}
        //         <p className="widespace">To learn more about the different learning models, visit <a className="nonformatted" href="https://vark-learn.com/">the VARK site</a>.<br />You can also take their <a className="nonformatted" href="https://vark-learn.com/the-vark-questionnaire/">quiz</a> and see how closely it matches your profile here.</p>
        //         <br /> <br /><br /> <br />
        //     </center>
        // </div>
    );
    if (currentUserIsAdmin()) {
        topPanel=(<div />);
    }

    if (isMobile==='medium') {
        return (
            <AuthUserContext.Consumer>
                {authUser => (
                    <div className="dialognowall">
                        {topPanel}
                        <div>
                            <center>
                                <h1> <br /> Change Password</h1> 
                                <h3>For {authUser.email}</h3> <br />
                            
                            <PasswordChangeForm /></center>
                        </div>
                        <br /><hr /><br />
                        <div>
                            <center><SignOutButton />   </center>
                        </div>
                        <br />
                        <br />
                        <br />
                    </div>
                )}
            </AuthUserContext.Consumer>
        );
    }

    return (
        <AuthUserContext.Consumer>
            {authUser => (
                <div className="dialogwallpaper">
                    {topPanel}
                    <br />
                    {/* <div className="largecontent">
                        <center>
                            <h1> <br />Your UID</h1> 
                            {showUID ? (
                                <>
                                    <h3>{authUser.uid}</h3>
                                    <CopyToClipboard text={authUser.uid} onCopy={() => setCopied(true)}>
                                        <a className="smalllinkbutton">{(copied) ? ("Copied!") : ("Copy to Clipboard")}</a>
                                    </CopyToClipboard>
                                </>
                            ) : (<h3 onClick={() => setShowUID(true)}>Click to reveal</h3>)} <br /> <br />
                        </center>
                    </div>
                    <br /><br /> */}
                    <div className="largecontent">
                        <center>
                            <h1> <br />Change Password</h1> 
                            <h3>For {authUser.email}</h3> <br />
                        </center>
                        <PasswordChangeForm />
                    </div>
                    <br /><br />
                    <div className="largecontent">
                        <center>
                            <SignOutButton />
                        </center>
                    </div>
                    <br />
                    <br />
                    <br />
                </div>
            )}
        </AuthUserContext.Consumer>
    );
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(AccountPage);