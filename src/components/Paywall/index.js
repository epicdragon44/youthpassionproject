import React from 'react';
import SecureStorage from 'secure-web-storage';
import { withFirebase } from '../Firebase';
import stripesecured from './stripe-payment-logo.png';
import ReactGA from 'react-ga';

//TODO EVENTUALLY: display a separate paywall if they want to do a monthly sub

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

class Paywall extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            stripeLoading: true,
            isMobile: "large", //either large, medium or small
        };
        // onStripeUpdate must be bound or else clicking on button will produce error.
        this.onStripeUpdate = this.onStripeUpdate.bind(this);
        // binding loadStripe as a best practice, not doing so does not seem to cause error.
        this.loadStripe = this.loadStripe.bind(this);
        this.setTimeLeft = this.setTimeLeft.bind(this);
        this.charge = this.charge.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }
  
    setTimeLeft() {
        // const usr = secureStorage.getItem('authUser');
        // const uid = Object.values(usr).slice()[0];
        // const days = this.isTimeUp();
        // let set;
        // if ( days === 1000000)
        //     set = 7;
        // else 
        //     set = days + 30;
        // this.props.firebase.sub(uid).update({
        //     time: set,
        //     id: uid,
        // });
        // window.location.reload()

        //TODO: set the current course to be already paid for
        //current code is this.props.courseCode

        const usr = secureStorage.getItem('authUser');
        var courses = Object.values(usr).slice()[2];
        
        var cnt;
        for (cnt in courses) {
            if (courses[cnt].includes("PAIDFOR")) {
                // if (courses[cnt].substring(0, courses[cnt].length-7)===this.props.courseCode) {
                //     return false;
                // }
                //if the course in the db is already paid for, its not the one im looking for.
                continue;
            } else {
                if (courses[cnt]===this.props.courseCode) {
                    courses[cnt] = courses[cnt] + "PAIDFOR";
                }
            }
        }

        var uid = Object.values(usr).slice()[0];

        this.props.firebase.user(uid).update({ courses: courses, });

        window.location.reload();
    }
  
    // isTimeUp() {
        
    // const usr = secureStorage.getItem('authUser');
    // const uid = Object.values(usr).slice()[0];
    // console.log(uid);
    // let ret;
    // this.props.firebase.sub(uid).on('value', snapshot => {
    //     if(snapshot.val() == null) {
    //         this.props.firebase.sub(uid).update({time: 1000000, id: uid,})
    //         ret = 1000000
    //     }
    //     else {
    //       ret = snapshot.val().time;
    //     }
    // })
    // return ret;

    // }
  
    loadStripe(onload) {
        if(! window.StripeCheckout) {
            const script = document.createElement('script');
            script.onload = function () {
                console.info("Stripe script loaded");
                onload();
            };
            script.src = 'https://checkout.stripe.com/checkout.js';
            document.head.appendChild(script);
        } else {
            onload();
        }
    }
  
    componentDidMount() {
        //update window size
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.props.firebase.doChangePersist();

      const STRIPE_PUBLIC_KEY = 'pk_live_51H25mNDwxccNPcIyOLzqL5jogn7rWHsyHywdqcA3iJFfu6aGFtVQn6ouBWP4ZHSuW822CkQCdn5WLS8BvBoWeoMR00BKJASAtd';
      const charge_amount = 499;
          const charge_currency = 'usd';
      this.loadStripe(() => {
          this.stripeHandler = window.StripeCheckout.configure({
              key: STRIPE_PUBLIC_KEY,
              locale: 'auto',
              token: async token => {
  
                  // Pass the received token to our Firebase function
                  let res = await this.charge(token, charge_amount, charge_currency);
                  if (res.body.error) {
                      alert('There was an error processing your payment.');
                      return;
                  }
  
                  // Card successfully charged!
                  this.setState({
                      displayPayButton: false
                  });
                  this.setTimeLeft();
              }
          });
  
          this.setState({
              stripeLoading: false,
              // loading needs to be explicitly set false so component will render in 'loaded' state.
              loading: false,
          });
      });
  }
    async charge(token, amount, currency) {
        var actionStr = "Paid";
        ReactGA.event({
            category: "Paid",
            action: actionStr,
        });

      const FIREBASE_FUNCTION = 'https://us-central1-modulus-e56e4.cloudfunctions.net/chargeKoin ';
      const res = await fetch(FIREBASE_FUNCTION, {
          method: 'POST',
          body: JSON.stringify({
              token,
              charge: {
                  amount,
                  currency,
              },
          }),
      });
      const data = await res.json();
      data.body = JSON.parse(data.body);
      return data;
    }
    
    updateWindowDimensions() {
        if (window.innerWidth<0) { //LEGACY, UNUSED
            this.setState({ isMobile: "small" },
            () => this.render());
        }
        else if (window.innerWidth<1100) {
            this.setState({ isMobile: "medium" },
            () => this.render());
        }
        else {
            this.setState({ isMobile: "large" },
            () => this.render());
        }
    }
  
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
        if(this.stripeHandler) {
            this.stripeHandler.close();
        }
    }
  
    onStripeUpdate(e) {
      this.stripeHandler.open({
          name: 'Koin Premium Course',
          description: 'Unlimited Access to this Course',
          panelLabel: 'Buy Now',
      });
      e.preventDefault();
    }
  
    render() {
        var actionStr = "Viewed the paywall.";
        ReactGA.event({
            category: "Paywall Viewed",
            action: actionStr,
        });

        var youtubeLink = "YEET";
        //BEGIN HARDCODED VIDEO PREVIEWS
        if (this.props.courseCode==="2029183779575016816101543") { //Paying for your College Journey
            youtubeLink = "https://www.youtube.com/embed/w41ebjJAYcs";
        }
        if (this.props.courseCode==="2651345192031906821537") { //Money Management
            youtubeLink = "https://www.youtube.com/embed/kEjbEjXxCbg";
        }
        if (this.props.courseCode==="265134519-16396202808078") { //Interest Debt and Borrowing
            youtubeLink = "https://www.youtube.com/embed/2nJbjqEJjWE";
        }
        //END HARDCODED VIDEO PREVIEWS

        const { stripeLoading, loading } = this.state;
        if (this.state.isMobile==='medium') {
            return (<div className="centered">
                <div className="normalbg">
                        <h1>Koin Premium</h1>
                        <p>$4.99</p>
                        <p>Access this course with Koin Premium</p>
                        <img height="100px" src={stripesecured} />
                        <br />
                        <div>
                            {(loading || stripeLoading)
                                ? <p>Loading..</p>
                                : <button className="begintrialmobile" onClick={this.onStripeUpdate}>Access Now</button>
                            }
                        </div>
                        <br /><br /><br /><br /><br /><br /><br /><br />
                    </div>
                </div>);
        }
        // if (this.isTimeUp()===1000000) {
        //     //display upgrade page
        //     return (
        //         <div className="centered">
        //             <div className="paybackgroundstrip">
        //                 <br /><br />
        //                 <h1>Confirm your Registration</h1>
        //                 <br /><br />
        //                 <button className="begintrial" onClick={this.setTimeLeft}>Begin 7-day Free Trial</button>
        //             </div>
        //             <div className="normalbg">
        //                 <br /><br />
        //                 <div className="contentbox">
        //                     Our mission is to provide everyone with an affordable education in financial literacy, but unfortunately, it's not free to keep the lights on.
        //                     <br /><br />
        //                     For just 4.99 a month, you'll get full access to our suite of online courses.
        //                 </div>
        //                 <br />
        //                 <div className="contentbox">
        //                     <h2>One Price - Unlimited Features</h2>
        //                     <br />
        //                     <h3>For only 4.99 a month, you get:<br /></h3>
        //                     <ul>
        //                         <li>✓  Infinite financial course access</li>
        //                         <li>✓  Complete access to our online community</li>
        //                         <li>✓  Real world simulations on our Discord server</li>
        //                     </ul>
        //                 </div>
                        
        //                 <br />
        //                 <button className="begintrial" onClick={this.setTimeLeft}>Begin Free Trial</button>
        //                 <br /><br /><br /><br /><br /><br /><br /><br />
        //             </div>
        //         </div>
        //     );
        // } else 
        // if (this.isTimeUp()===false) { //if time's up, be like "i see youre enjpying modulus, buy another 30 days"
            return (
                <div className="centered">
                    <div className="paybackgroundstrip">
                        <br /><br />
                        <h1>Hey, you're trying to access a Koin Premium course!</h1>
                        <h3>It's only $4.99 to get unlimited access to this course.</h3>
                        <br /><br />
                        <div>
                            {(loading || stripeLoading)
                                ? <p>Loading..</p>
                                : <button className="begintrial" onClick={this.onStripeUpdate}>Access Now</button>
                            }
                        </div>
                    </div>
                    <div className="normalbg">
                        <br /><br />
                        <div className="contentbox">
                            Our mission is to provide everyone with an affordable education in financial literacy, but unfortunately, it's not free to keep the lights on.
                            <br /><br />
                            For just 4.99, you'll get unrestricted access to everything in this course.
                        </div>
                        <br />
                        <div className="contentbox">
                            <h2>Want to know what's in this course?</h2>
                            <br />
                            <h3>Here's a preview of one of the videos within:<br /></h3>
                            <iframe width="560" height="315" src={youtubeLink} frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                        <img height="200px" src={stripesecured} />
                        <br />
                        <div>
                            {(loading || stripeLoading)
                                ? <p>Loading..</p>
                                : <button className="begintrial" onClick={this.onStripeUpdate}>Access Now</button>
                            }
                        </div>
                        <br /><br /><br /><br /><br /><br /><br /><br />
                    </div>
                </div>
            );
        // }
        // else { //tell them the number of days they have left, and offer to buy another 30 now
        //     return (
        //         <div className="centered">
        //             <div className="paybackgroundstrip">
        //                 <br /><br />
        //                 <h1>Thank you for using Pro</h1>
        //                 <h3>You still have {this.isTimeUp()} days left of Pro.</h3>
        //                 <br /><br />
        //                 <div>
        //                     {(loading || stripeLoading)
        //                         ? <p>Loading..</p>
        //                         : <button className="begintrial" onClick={this.onStripeUpdate}>
        //                             Add another 30 days<br />
        //                             <span>For only 4.99</span>
        //                         </button>
        //                     }
        //                 </div>
        //             </div>
        //             <div className="normalbg">
        //                 <br /><br />
        //                 <div className="contentbox">
        //                     Our mission is to provide everyone with an affordable education in financial literacy, but unfortunately, it's not free to keep the lights on.
        //                     <br /><br />
        //                     For just 4.99 a month, you'll get full access to our suite of online courses.
        //                 </div>
        //                 <br />
        //                 <div className="contentbox">
        //                     <h2>One Price - Unlimited Features</h2>
        //                     <br />
        //                     <h3>For only 4.99 a month, you get:<br /></h3>
        //                     <ul>
        //                         <li>✓  Infinite financial course access</li>
        //                         <li>✓  Complete access to our online community</li>
        //                         <li>✓  Real world simulations on our Discord server</li>
        //                     </ul>
        //                 </div>
        //                 <img height="200px" src={stripesecured} />
        //                 <br />
        //                 <div>
        //                     {(loading || stripeLoading)
        //                         ? <p>Loading..</p>
        //                         : <button className="begintrial" onClick={this.onStripeUpdate}>Add another 30 days</button>
        //                     }
        //                 </div>
        //                 <br /><br /><br /><br /><br /><br /><br /><br />
        //             </div>
        //         </div>
        //     );
        // }
    }
  }

  export default withFirebase(Paywall);