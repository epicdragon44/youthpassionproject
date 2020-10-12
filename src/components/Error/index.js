import React from "react";
import * as ROUTES from "../../constants/routes";
import { Link } from 'react-router-dom';
import errorimage from './error.svg';
import { Redirect } from "react-router-dom";

function Error(props) {
    // window.location.href = window.location.href.substring(0, (window.location.href+"").length-17);
    
    return (
        <Redirect to={ROUTES.LANDING} />
        // <div style={{overflow: "hidden"}}>
        //     <center>
        //         <br /><br /><br /><br />
        //         <img src={errorimage}/>
        //     </center>
        // </div>
    );
}

export default Error;