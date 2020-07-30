import React from "react";
import * as ROUTES from "../../constants/routes";
import { Link } from 'react-router-dom';
import errorimage from './error.svg';

const Error = () => (
    <div style={{overflow: "hidden"}}>
        <center>
            <br /><br /><br /><br />
            <img src={errorimage}/>
        </center>
    </div>
);

export default Error;