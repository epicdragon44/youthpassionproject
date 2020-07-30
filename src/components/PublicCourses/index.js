import React from "react";
import * as ROUTES from "../../constants/routes";
import { Link } from 'react-router-dom';
import './courses.css';
import ReactSearchBox from 'react-search-box'
import * as firebase from 'firebase'
import { withFirebase } from '../Firebase';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import copyicon from './copy.svg'
import SecureStorage from 'secure-web-storage';
require('@firebase/database');
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



class Select extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    state = {
      options: [
        {
            name: "Search All",
            value: "all",
        },
        {
            name: 'Course Name',
            value: 'name',
        },
        {
            name: 'Teacher',
            value: 'teacher',
        },
        {
            name: 'Subject',
            value: 'subject',
        },
      ],
      value: '?',
    };

    handleChange = (event) => {
      this.props.passState(event.target.value);
      this.setState({ value: event.target.value });
    };

    render() {
      const { options, value } = this.state;

      return (
          <div className="searchthing">
            <React.Fragment>
                <select className="searchfilter" name="search_categories" id="search_categories" onChange={this.handleChange} value={value}>
                    {options.map(item => (
                    <option className="option" key={item.value} value={item.value}>
                        &nbsp;&nbsp;&nbsp;{item.name}
                    </option>
                    ))}
                </select>
            </React.Fragment>
          </div>
      );
    }
}

function getPublicCourses(firebase) {
    
    firebase.courses().on('value', snapshot => {
        const coursesObject = snapshot.val();
        const coursesList = Object.keys(coursesObject).map(key => ({
            ...coursesObject[key],
            appID: key,
        }));
        secureStorage.setItem('courses', coursesList);
    });
    var publicItems = [];
    const allCourses = secureStorage.getItem('courses');

    for (let i = 0, len = allCourses.length; i < len; ++i) {
        var course = allCourses[i];
        if (course.visibility === "public") {
            publicItems.push({
                name: course.CourseName,
                teacher: course.nteacherName,
                joinCode: course.nclasscode,
                subject: course.osubject,
            });
        }
    }

    return publicItems;
}

function PublicCourse(props) {
    let defaultPlaceholder = "Search our open course library...";

    const [value, setValue] = React.useState(defaultPlaceholder);
    const [publicCourses, setPublicCourses] = React.useState(getPublicCourses(props.firebase));
    const [filter, setFilter] = React.useState('all');

    function handleClick(event) {
        if (event.target.value===defaultPlaceholder) {
            setValue("");
        }
    }

    function filterFunction(course, usertext) {
        usertext = usertext.toLowerCase();

        if (filter==="all") {
            return (( String(course.name.toLowerCase()).includes(usertext) ) || ( String(course.teacher.toLowerCase()).includes(usertext) ) || ( String(course.subject.toLowerCase()).includes(usertext) ));
        }
        if (filter==='name') {
            let courseString = String(course.name.toLowerCase());
            return courseString.includes(usertext);
        }
        if (filter==='teacher') {
            let courseString = String(course.teacher.toLowerCase());
            return courseString.includes(usertext);
        }
        if (filter==='subject') {
            let courseString = String(course.subject.toLowerCase());
            return courseString.includes(usertext);
        }
    }

    function handleChange(event) {
        setValue(event.target.value);

        var output = [];
        var usertext =  event.target.value;
        console.log(usertext);
        var allcourses = getPublicCourses(props.firebase);
        var cnt;
        for (cnt in allcourses) {
            console.log(allcourses[cnt]);
            console.log('YEE' + String(allcourses[cnt].name.toLowerCase()));
            if (filterFunction(allcourses[cnt], usertext)) {
                output.push(allcourses[cnt]);
                console.log('pushed');
            }
        }
        setPublicCourses(output);
    }

    function passState(value) {
        setFilter(value);
    }

    return (
        <div className="restOfPage">
            {/* <div className="browsesearch">
                <div className="toplargecontent">
                    <br /><br />
                    <h1>Browse Public Courses</h1>
                    <p>Made with ♥ by a global community of teachers</p>
                    <br />
                </div>
                <br /><br /><br />
            </div> */}
            <div>
                <div className="searchstrip">
                    <div className="centeritem">
                        <div className="centereditem">
                            <div className="searchflexsplit">
                                <label className="searchbox" >
                                    <input type="text" value={value} onChange={handleChange} onClick={handleClick} />
                                </label>
                                <Select passState={passState}/>
                            </div>
                        </div>
                    </div>
                    {
                        publicCourses.map(course => (
                            <div className="streamlinedlargecontent">
                                <div className="flexsplit">
                                    <div className="leftsplit">
                                        <br /><br />
                                        <h2>{course.name}</h2>
                                        <h4>By {course.teacher}</h4>
                                        <center>
                                            <div className="subjecttag">
                                                {course.subject}
                                            </div>
                                        </center>
                                        <br /><br /><br />
                                    </div>
                                    <div className="moreflexsplit">
                                            <p><b>Join Code:</b> <br/><br /> {course.joinCode}</p>
                                            
                                            <CopyToClipboard text={course.joinCode} >
                                                <a className="smallcopybutton">
                                                    <img src={copyicon} width="20px"></img>
                                                </a>
                                            </CopyToClipboard>
                                        
                                    </div>
                                    
                                </div>
                            </div>
                        ))
                    }
                    <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
                </div>
            </div>
        </div>
    );
}

export default withFirebase(PublicCourse);