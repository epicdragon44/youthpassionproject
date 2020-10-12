
import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import Navigation from '../Navigation';
import LandingPage from '../Landing';
import SignUpPage from '../SignUp';
import SignInPage from '../SignIn';
import PasswordForgetPage from '../PasswordForget';
import HomePage from '../Home';
import AccountPage from '../Account';
import AdminPage from '../Admin';
import PublicCourses from '../PublicCourses';
import Error from '../Error';
import Vidcall from '../Vidcall';
import Payment from '../Payment';

import * as ROUTES from '../../constants/routes';
import { withAuthentication } from '../Session';

const App = () => (
    <Router>
        <Navigation />

        <Switch>
            <Route exact path={ROUTES.LANDING} component={LandingPage} />
            <Route exact path={ROUTES.SIGN_UP} component={SignUpPage} />
            <Route exact path={ROUTES.SIGN_IN} component={SignInPage} />
            <Route
                exact
                path={ROUTES.PASSWORD_FORGET}
                component={PasswordForgetPage}
            />
            <Route exact path={ROUTES.HOME} component={HomePage} />
            <Route exact path={ROUTES.ACCOUNT} component={AccountPage} />
            <Route exact path={ROUTES.ADMIN} component={AdminPage} />
            <Route exact path={ROUTES.PUBLIC_COURSES} component={PublicCourses} />
            <Route exact path={ROUTES.VIDCALL} component={Vidcall} />
            <Route exact path={ROUTES.PAYMENT} component={Payment} />
            <Route component={Error} />
        </Switch>
    </Router>
);

export default withAuthentication(App);
