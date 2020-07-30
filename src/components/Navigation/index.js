import React from 'react';
import { Link } from 'react-router-dom';
import logo from './koinlogo.png';
import tinylogo from './smallinversemodulus.png';

import { AuthUserContext } from '../Session';
import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';

import dashboard from './dashboard.png';
import account from './account.png';
import cameraicon from './vidcall.svg';
import publiccourses from './browsecourses.svg';//change to new icon for public courses

import './nav.css';

function Logo() {
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

    if (isMobile==='medium') {
        return (
            <div className="logo" >
                <Link to={ROUTES.LANDING}><img id="logo" src={logo} alt="Modulus Logo" /></Link>
            </div>
        );
    } else {
        return (
            <div className="logo" >
                <Link to={ROUTES.LANDING}><img id="logo" src={logo} alt="Modulus Logo" /></Link>
            </div>
        );
    }
}

const Navigation = () => (
    <AuthUserContext.Consumer>
        {authUser =>
            authUser ? (
                <NavigationAuth authUser={authUser} />
            ) : (
                <NavigationNonAuth />
            )
        }
    </AuthUserContext.Consumer>
);

function DashboardMenuItem(props) {
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

    if (isMobile==='medium') {
        return (
            <li className="navmobile" id="dashboard">
                <Link to={props.link}><img src={dashboard} height="20px"/></Link>
            </li>
        );
    } else {
        return (
            <li className="nav" id="dashboard">
                <Link to={props.link}>Dashboard</Link>
            </li>
        );
    }
}

function AccountMenuItem(props) {
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

    if (isMobile==='medium') {
        return (
            <li className="navmobile" id="account">
                <Link to={props.link}><img src={account} height="20px" /></Link>
            </li>
        );
    } else {
        return (
            <li className="nav" id="account">
                <Link to={props.link}>Account</Link>
            </li>
        );
    }
}
function PublicCoursesMenuItem(props) {
    return (
        <li className="nav" id="special">
            <Link to={props.link}><img src={publiccourses} alt="publiccourses" height="20px"></img></Link>
        </li>
    );
}
function VidcallMenuItem(props) {
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

    if (isMobile==='medium') {
        return(
            <li className="navmobile" id="account">
                {/*change id*/}
                <Link to={props.link}><img src={cameraicon} height="20px" /></Link>
            </li>
        );
    } else {
        return(
            <li className="nav" id="account">
                {/*change id*/}
                <Link to={props.link}>Gameboard</Link>
            </li>
        );
    }
}
function MenuItem(props) {
    return (
        <li className="nav" id="special">
            <Link to={props.link}>Sign In</Link>
        </li>
    );
}
function Premium(props) {
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

    if (isMobile==='medium') {
        return (
            <li className="navmobile">
                <Link id="upgradebutton" to={ROUTES.PAYMENT}>
                    <button className="mobilenavigationbutton" style={{height: "3em"}} type="button">
                        Pro
                    </button>
                </Link>
            </li>
        );
    } else {
        return (
            <li className="nav">
                <Link id="upgradebutton" to={ROUTES.PAYMENT}>
                    <button className="navigationbutton" style={{height: "3em"}} type="button">
                        Premium
                    </button>
                </Link>
            </li>
        );
    }
}

const NavigationAuth = ({ authUser }) => (
    <div>
        <ul className="nav">
            {/* <li className="left">
                <Link to={ROUTES.LANDING}>Modulus</Link>
            </li> */}
            <li className="left">
                <Logo />
            </li>
            {/* <li className="left" style={{marginTop: "-5px"}}>
                &nbsp;&nbsp;<PublicCoursesMenuItem link={ROUTES.PUBLIC_COURSES} />
            </li> */}
            {/* <Premium /> */}
            
            <AccountMenuItem link={ROUTES.ACCOUNT} />
            
            {/* <VidcallMenuItem link={ROUTES.VIDCALL}/> */}

            <DashboardMenuItem link={ROUTES.HOME} />
            {/* {authUser.roles.includes(ROLES.ADMIN) && (
                <li>
                    <Link to={ROUTES.ADMIN}>Admin</Link>
                </li>
            )} */}
            
        </ul>
    </div>

);

const NavigationNonAuth = () => (
    <ul className="nav">
        <li className="left">
            <Logo />
        </li>
        {/* <li className="left" style={{marginTop: "-5px"}}>
            &nbsp;&nbsp;&nbsp;<PublicCoursesMenuItem link={ROUTES.PUBLIC_COURSES} />
        </li> */}
        <MenuItem link={ROUTES.ACCOUNT} name="Sign In" />
    </ul>
);

export default Navigation;