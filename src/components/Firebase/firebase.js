import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

const config = {
    apiKey: "AIzaSyDdAwZEPIHGmecudZQ2VGaYKtBRTX0U6aY",
    authDomain: "modulus-e56e4.firebaseapp.com",
    databaseURL: "https://modulus-e56e4.firebaseio.com",
    projectId: "modulus-e56e4",
    storageBucket: "modulus-e56e4.appspot.com",
    messagingSenderId: "768709169703",
    appId: "1:768709169703:web:a38f5dfb315550f831b402",
    measurementId: "G-TX7CYMZJN7"
};


class Firebase {
    constructor() {
        app.initializeApp(config);

        this.auth1 = app.auth();
        this.db = app.database();
        this.storage = app.storage();
        
    }
    // *** Auth API ***
    doCreateUserWithEmailAndPassword = (email, password) =>
        this.auth1.createUserWithEmailAndPassword(email, password);

    doChangePersist = () => 
        this.auth1.setPersistence(app.auth.Auth.Persistence.SESSION);

    doSignInWithEmailAndPassword = (email, password) =>
        this.auth1.signInWithEmailAndPassword(email, password);

    doSignOut = () => this.auth1.signOut();

    doPasswordReset = email => this.auth1.sendPasswordResetEmail(email);

    doPasswordUpdate = password =>
        this.auth1.currentUser.updatePassword(password);

    // *** Merge Auth and DB User API *** //
    onAuthUserListener = (next, fallback) =>
        this.auth1.onAuthStateChanged(authUser => {
            if (authUser) {
                this.user(authUser.uid)
                    .once('value')
                    .then(snapshot => {
                        const dbUser = snapshot.val();
                        // default empty roles
                        if (!dbUser.roles) {
                            dbUser.roles = {};
                        }
                        // merge auth and db user
                        authUser = {
                            uid: authUser.uid,
                            email: authUser.email,
                            ...dbUser,
                        };
                        next(authUser);
                    });

            } else {
                fallback();
            }
        });

    // *** User API ***
    user = uid => this.db.ref(`users/${uid}`);
    users = () => this.db.ref('users');

    course = appID => this.db.ref(`courses/${appID}`);
    courses = () => this.db.ref('courses');

    modules = courseID => this.db.ref(`courses/${courseID}/modules`);

    sub = sID => this.db.ref(`subscriptions/${sID}`);
    subs = () => this.db.ref('subscriptions');
}



export default Firebase;
