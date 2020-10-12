import React from 'react';
import './App.css';
import { withAuthorization } from '../Session';
import { Link } from 'react-router-dom';
import Paywall from '../Paywall';
import { Modal,ModalManager,Effect} from 'react-dynamic-modal';
import { PieChart } from 'react-minimal-pie-chart';
import * as ROUTES from '../../constants/routes';
import 'react-contexify/dist/ReactContexify.min.css';
import * as firebase from 'firebase'
import Helmet from 'react-helmet';
import { Resizable, ResizableBox } from 'react-resizable';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Line, Circle } from 'rc-progress';
import FileViewer from 'react-file-viewer';
import Tour from 'reactour';
import ReactPixel from 'react-facebook-pixel';
import { loadStripe } from '@stripe/stripe-js';
import checkmarkicon from './checkmark.png';
import backarrow from './backarrow.png';
import menuicon from './menu.svg';
import deviceicon from './rotatedevice.png';
import xicon from './xicon.svg';
import newtabicon from './newtab.svg'
import ReactGA from 'react-ga';
import ytguide1 from './guides/ytguide1.png';
import ytguide2 from './guides/ytguide2.png';
import gdrivevid1 from './guides/gdrivevid1.png';
import gdrivevid2 from './guides/gdrivevid2.png';
import gdrivevid3 from './guides/gdrivevid3.png';
import gdrivedoc1 from './guides/gdrivedoc1.png';
import gdrivedoc2 from './guides/gdrivedoc2.png';
import gdrivedoc3 from './guides/gdrivedoc3.png';
import gdriveform1 from './guides/gdriveform1.png';
import gdriveform2 from './guides/gdriveform2.png';
import gdriveform3 from './guides/gdriveform3.png';
import twittericon from './twitter.png';
import completedicon from './complete.svg';
import incompleteicon from './incomplete.svg';
import SecureLS from 'secure-ls';
import SecureStorage from 'secure-web-storage';

require('dotenv').config();
require('@firebase/database');

//NOTE
//You need to create a .env file in the root directory before the code will work
//It should be encoded in UTF-8
//And only contain one line:
//REACT_APP_KEY=fiursaghkuihersbkubaskygrcugvjusbgfrjsyu
//The exact string of characters that follows doesn't actually matter
//As long as it's cryptographically secure
//When deploying, we need to make sure this env file gets carried over
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

//DOC: Component: This component renders a single course button in the sidebar that, when clicked, changes the main panel to display that course.
//Input: name, active, changeActiveCourse, id (optional)
//Output: JSXElement
function CourseListItem(props) {

    var code = codeToName(props.name).substring(4);
    var description = props.getCourseDescription(props.name);
    if (code==="DELETE THAT YOU HOT DOG") return (null);
    return ( 
        <div className={"courselistitem"} onClick={() => {props.changeActiveCourse(props.name); setTimeout(() => window.dispatchEvent(new Event('resize')), 250)}} >
            <div className="verysmallbuffer"><br /></div>
            <span className="bufferedtext"><b>{code}</b> - {(props.percentage+'').substring(0, 3)==="100" ? "100" : (props.percentage+'').substring(0, 2)}% complete</span>
            <Line percent={props.percentage+''} strokeWidth="2" strokeColor="#3DBB9F" />
            
            <p className="coursedescr">{description}</p>
            
        </div>
    );
}

//DOC: Function: This function takes Converts the class code passed into the function into the actual English name of the course
//Input: classcode
//Output: String
function codeToName(classcode) {
	const allCourses = secureStorage.getItem('courses')
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === classcode) {
                return course.CourseName;
            }
        }
}

//DOC: Component: Displays a single button in the sidebar, that, when clicked, changes the main panel to allow you to enroll in a course
//Input: browseCourseMode
//Output: JSXElement
function BrowseCourseItem(props) {
    return (
        (<div className="addcourseitem" onClick={props.browseCourseMode}>
            Browse Courses
        </div>)
    );
}


//DOC: Component: Displays a single button in the sidebar, that, when clicked, changes the main panel to allow you to enroll in a course
//Input: browseCourseMode
//Output: JSXElement
function InlineBrowseCourseItem(props) {
    return (
        (<div className="inlineaddcourseitem" onClick={props.browseCourseMode}>
            <div className="verysmallbuffer"><br /></div>
            <span className="bufferedtext"><b>Add a course</b></span>
            <Line percent={'100'} strokeWidth="2" strokeColor="##D9D9D9" />
            <p className="largeplus">+</p>
        </div>)
    );
}

//DOC: Component: Displays a single button in the sidebar, that, when clicked, changes the main panel to allow you to enroll in a course
//Input: addCourseMode, isMobile
//Output: JSXElement
function AddCourseItem(props) {
    return (
        (<div className={props.isMobile==='large' ? "addcourseitem" : "mobileaddcourseitem"} onClick={props.addCourseMode}>
            Enroll
        </div>)
    );
}

//DOC: Component: Displays a single button in the sidebar, that, when clicked, changes the main panel to allow you to create a course
//Input: createCourseMode
//Output: JSXElement
function CreateCourseItem(props) {
    return (
        (<div className="addcourseitem" onClick={props.createCourseMode}>
            Create
        </div>)
    );
}

//DOC: Function: Determines whether the user is blocked from the activeCourse
//Input: username, activeCourse
//Output: boolean
function isUserBlocked(username, activeCourse) {
    // return false if the user is blocked from the course, and true if the user is not blocked
    // This should simply be the value in the key-value pair in the database you set up in getListOfStudents()
    const allCourses = secureStorage.getItem('courses')
    var stulist;
    for (let i = 0, len = allCourses.length; i < len; ++i) {
        var course = allCourses[i];
        if (course.nclasscode === activeCourse) {
            stulist = course.ostudentList; // identifies current course child name to update
            return stulist[username];
        }
    }
    return "true"; //placeholder to remove
}

//DOC: Component: Displays a break for the sidebar that lets us put headers within it
//Input: text
//Output: JSXElement
function ReallySmallBreak(props) {
    return (
        <div style={{fontSize: "25px"}}>
            <br />
            <p className="smallbreaktext">{props.text}</p>
        </div>
    );
}

function getStudentProgress(studentEmail, firebase, activeCourse) {
    // RETURN STUDENT PROGRESS AS 3D ARRAY
    const allCourses = secureStorage.getItem('courses');
    let students;
    for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === activeCourse) {
                students = course.studentUID;
            }
    }
    const newemail = studentEmail.replace(/\./g,'EMAILDOT');
    const uid = students[newemail];
    let ret = [];
    firebase.user(uid).child('vcourseprogress').child(activeCourse).on('value', snapshot => {
        if (snapshot.val() == null ) console.log('No progress for this student'); // will return null if student has no progress
        else {
            for (let [key, value] of Object.entries(snapshot.val())) {
                let moduleList = [];
                for (let [key1, value1] of Object.entries(value)){
                    moduleList[key1] = Object.values(value1);
                }
                ret[key] = moduleList;
            }
        }
    });
    
    if (ret != null ) return ret;
    else return 'wait for return';
}
//modules={this.props.modules} 
//firebase={this.props.firebase} 
//activeCourse={this.props.activeCourse} 
//studentEmail={student}
function getStudentProgressPercentage(studentEmail, firebase, activeCourse, modules) {
    var studentprogressarr = getStudentProgress(studentEmail, firebase, activeCourse);
    console.log(modules);

    let doneCnt = 0.0;
    let totalCnt = 0.0;

    let index;
    for (index in modules) {
        let index2;
        for (index2 in modules[index].contents) {
            if (modules[index].contents[index2]==='DELETE THAT YOU HOT DOG') {
                continue;
            } else {
                totalCnt++;
            }
        }
    }
    
    for (const [key, value] of Object.entries(studentprogressarr)) {

        let coveredItems = [];

        for (const [key2, value2] of Object.entries(value)) {// key2 is the item name, value2 is an array of size 1 that contians a boolean
            if (key2==='DELETE THAT YOU HOT DOG') {
                continue;
            }
            // totalCnt++;
            coveredItems.push(key2);
            if (value2[0]) { //if completed
                doneCnt++;
            }
        }
    }

    console.log(activeCourse + " : " + totalCnt);

    if (totalCnt===0) {
        return 0;
    }

    let percentage = 100*doneCnt/totalCnt;

    return percentage;
}

//DOC: Component: Displays a modal that lets the teacher view a student's progress
//Input: modules, firebase, activeCourse, studentName, getStudentProgress, studentEmail, onRequestClose
//Output: JSXElement
class ProgressModal extends React.Component{
    render(){
       const { onRequestClose } = this.props;
       const bigModal = {
            content: {
                margin                  : '75px auto auto auto',
                width                   : '75%',
                height                  : '80%',
                textAlign               : 'center',
                borderRadius            : '10px',
            }
        };

        var toRender = [];
        var studentprogressarr = this.props.getStudentProgress(this.props.studentEmail, this.props.firebase, this.props.activeCourse);

        let doneCnt = 0.0;
        let totalCnt = 0.0;
        
        for (const [key, value] of Object.entries(studentprogressarr)) {
            // console.log(key);
            toRender.push(
                <div className="modulerow">
                    {key}
                </div>
            );
            // console.log(value);

            let coveredItems = [];

            for (const [key2, value2] of Object.entries(value)) {// key2 is the item name, value2 is an array of size 1 that contians a boolean
                if (key2==='DELETE THAT YOU HOT DOG') {
                    continue;
                }
                totalCnt++;
                coveredItems.push(key2);
                if (value2[0]) { //if completed
                    doneCnt++;
                    toRender.push(
                        <div className="bisplit">
                            <img src={completedicon} height="40px" />
                            <div className="completeditemrow">
                                <div className="itemrowtext">{key2}</div>
                            </div>
                        </div>
                    );
                } else {
                    toRender.push(
                        <div className="bisplit">
                            <img src={incompleteicon} height="40px" />
                            <div className="incompleteitemrow">
                                <div className="itemrowtext">{key2}</div>
                            </div>
                        </div>
                    );
                }
            }

            let index;
            for (index in this.props.modules) {
                if (this.props.modules[index].title===key) { //if same module
                    let index2;
                    for (index2 in this.props.modules[index].contents) {
                        if (this.props.modules[index].contents[index2]==='DELETE THAT YOU HOT DOG') {
                            continue;
                        }
                        if (coveredItems.includes(this.props.modules[index].contents[index2])) {
                            continue;
                        } else {
                            totalCnt++;
                            toRender.push(
                                <div className="bisplit">
                                    <img src={incompleteicon} height="40px" />
                                    <div className="incompleteitemrow">
                                        <div className="itemrowtext">{this.props.modules[index].contents[index2]}</div>
                                    </div>
                                </div>
                            );
                        }
                    }
                }
            }
        }

        let percentage = 100*doneCnt/totalCnt;

        if (toRender.length===0) {
            return (
                <Modal
                    onRequestClose={onRequestClose}
                    style= {bigModal}
                    effect={Effect.ScaleUp}
                >
                    <div className="modaltopbar">
                        <button id="topbarbutton" onClick={ModalManager.close}><img src={xicon} alt="Return" height="15px" alt="Exit Dialog"/></button>
                        <h2 className="topbarheader">{this.props.studentName}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h2>
                    </div>
                    <div className="progresscontent">
                        <br />This student has nothing completed.                 
                    </div>
                </Modal>
           );
        }

        
        
       return (
            <Modal
                onRequestClose={onRequestClose}
                style= {bigModal}
                effect={Effect.ScaleUp}
            >
                <div className="modaltopbar">
                    <button id="topbarbutton" onClick={ModalManager.close}><img src={xicon} alt="Return" height="15px" alt="Exit Dialog"/></button>
                    <h2 className="topbarheader">{this.props.studentName}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h2>
                </div>
                <div className="progresscontent">
                    <h3 className="bluetext">{(percentage+'').substring(0, 4)}% of the course has been completed.</h3>
                    <br />
                    {
                        toRender.map(element => (
                            element
                        ))
                    }                    
                </div>
            </Modal>
       );
    }
 }

//DOC: Component: Displays a popup dialog.
//Input: cancelFunc (optional), contentType, itemName, firebase, text, modules, activeCourse, moduleTitle, internal, vark, onRequestClose, teacherMode, addItemMode (optional), varkStatus
//Output: JSXElement
class MyModal extends React.Component {     
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleItemNameChange = this.handleItemNameChange.bind(this);
        this.setInputType = this.setInputType.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.state = {
            varkselection: (this.props.vark==="V" || this.props.vark==="A" || this.props.vark==="R" || this.props.vark==="K") ? (this.props.vark) : (null),
            value: this.props.internal,
            itemName: (this.props.itemName==="add") ? ("") : (this.props.itemName),
            inputType: 0, //used to decide whether its a link, file, etc.
            selectedFile: null,
            error: '',
        };
    }

    fileData = () => { 
     
        if (this.state.selectedFile) {
          return (
            <div>
              <p className="verysmallteachernotice">File Name: {this.state.selectedFile.name}</p> 
              <p className="verysmallteachernotice">File Type: {this.state.selectedFile.type}</p> 
            </div> 
          ); 
        } else { 
          return ( 
            null
          ); 
        } 

      }; 

    onFileChange = event => { 
        // Update the state 
        if (event.target.files[0].size > 10000000) {
            this.setState({
                error: 'This file is too large!'
            });
        } else {
            this.setState({ 
                selectedFile: event.target.files[0],
                error: '',
            }); 
        }
    }; 

    setInputType(newType) {
        this.setState({
            inputType: newType,
        });
    }

    componentDidMount() {
        try {
            if (!(document.getElementsByTagName("IFRAME")[document.getElementsByTagName("IFRAME").length-1].getAttribute('src').includes('youtube') || document.getElementsByTagName("IFRAME")[document.getElementsByTagName("IFRAME").length-1].getAttribute('src').includes('youtu.be'))) {
                let newStr = window.screen.height + 'px';
                document.getElementsByTagName("IFRAME")[document.getElementsByTagName("IFRAME").length-1].setAttribute('height', newStr);
            }
        } catch (error) {
            console.log('No iframe to be found!');
        }
    }

    componentDidUpdate() {
        try {
            if (!(document.getElementsByTagName("IFRAME")[document.getElementsByTagName("IFRAME").length-1].getAttribute('src').includes('youtube') || document.getElementsByTagName("IFRAME")[document.getElementsByTagName("IFRAME").length-1].getAttribute('src').includes('youtu.be'))) {
                let newStr = window.screen.height + 'px';
                document.getElementsByTagName("IFRAME")[document.getElementsByTagName("IFRAME").length-1].setAttribute('height', newStr);
            }
        } catch (error) {
            console.log('No iframe to be found!');
        }
    }

    handleChange(event) {    this.setState({value: event.target.value});  }
    handleItemNameChange(event) {    this.setState({itemName: event.target.value});  }

    //typeCode indicates the embed directions. 1 means its a YT video, 2 means its a Google Drive link, 3 means its some other miscel link, and 4 means its a file upload
    handleSubmit(event, typeCode) {
        var itemname = (this.props.itemName==="add") ? ("") : (this.props.itemName);

        event.preventDefault();
        if (typeCode===4) {
            if (this.state.selectedFile==null) {
                alert('No valid file selected!');
                return;
            }
            
            const uploadTask = this.props.firebase.storage.ref(`userfiles/${this.state.selectedFile.name}`).put(this.state.selectedFile); // uploads image to firebase
            uploadTask.on('state_changed',
            (snapshot) => { // stores
                //const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100); // should give indication of finished upload
                //this.setState({progress}); // gives a number between 1-100 for percent done uploading
            },
            (error) => {
                alert(error);
            },
            () => {
                const urljob = this.props.firebase.storage.ref(`userfiles/${this.state.selectedFile.name}`).getDownloadURL().then(url => {
                    if (this.props.addItemMode) {
                        const allCourses = secureStorage.getItem('courses');
                        var courseID;
                        for (let i = 0, len = allCourses.length; i < len; ++i) {
                            var course = allCourses[i];
                            if (course.nclasscode === this.props.activeCourse) {
                                courseID = course.appID; // identifies current course child name to update
                                break;
                            }
                        }
                        const arrModules = this.props.modules;
                        const curModule = this.props.moduleTitle;
                        for ( let i = 0; i < arrModules.length; ++i) {
                            var neededModule;
                            if ( arrModules[i].title === curModule) {
                                neededModule = arrModules[i]; break; // finds needed module to edit
                            }
                        }
            
                        const contents = neededModule.contents; // add your new items
                        const internals = neededModule.internals;
                        const vark = neededModule.vark;

                        var itemname = (this.props.itemName==="add") ? ("") : (this.props.itemName);
            
                        //double check we don't already have an item with that name
                        let iteration;
                        for (iteration in contents) {
                            if (contents[iteration]===itemname) {
                                alert('You already have an item with that name!');
                                event.preventDefault();
                                return;
                            }
                        }
            
                        contents.push(itemname);
                        
                        internals.push(url);
                        vark.push(this.state.varkselection);
            
            
                        const newPush = this.props.modules;
            
            
                        this.props.firebase.courses().child(courseID).update({
                            modules: newPush.slice(),
                        });
                    }
                    else {
                
                        const allCourses = secureStorage.getItem('courses');
                        var courseID;
                        for (let i = 0, len = allCourses.length; i < len; ++i) {
                            var course = allCourses[i];
                            if (course.nclasscode === this.props.activeCourse) {
                                courseID = course.appID; // identifies current course child name to update
                                break;
                            }
                        }
                        const arrModules = this.props.modules;
                        const curModule = this.props.moduleTitle;
                        for ( let i = 0; i < arrModules.length; ++i) {
                            var neededModule;
                            if ( arrModules[i].title === curModule) {
                                neededModule = arrModules[i]; break; // finds needed module to edit
                            }
                        }
            
                        const contents = neededModule.contents;  // modify the corresponding item
                        const internals = neededModule.internals;
                        const vark = neededModule.vark;
                        for ( let i = 0; i < contents.length; ++i) {
                            let itemTemp = contents[i];
                            if ( itemTemp === this.props.itemName && vark[i] === this.props.vark) {
                               
                                internals[i] = url;
                            }
                        }
            
                        const newPush = this.props.modules; // record to database
                        
            
                        this.props.firebase.courses().child(courseID).update({
                            modules: newPush.slice(),
                        });
                    }
                });
            });
        }
        else {
            if (this.props.addItemMode) {
                const allCourses = secureStorage.getItem('courses');
                var courseID;
                for (let i = 0, len = allCourses.length; i < len; ++i) {
                    var course = allCourses[i];
                    if (course.nclasscode === this.props.activeCourse) {
                        courseID = course.appID; // identifies current course child name to update
                        break;
                    }
                }
                const arrModules = this.props.modules;
                const curModule = this.props.moduleTitle;
                for ( let i = 0; i < arrModules.length; ++i) {
                    var neededModule;
                    if ( arrModules[i].title === curModule) {
                        neededModule = arrModules[i]; break; // finds needed module to edit
                    }
                }

                const contents = neededModule.contents; // add your new items
                const internals = neededModule.internals;
                const vark = neededModule.vark;

                //double check we don't already have an item with that name
                let iteration;
                for (iteration in contents) {
                    if (contents[iteration]===itemname) {
                        alert('You already have an item with that name!');
                        event.preventDefault();
                        return;
                    }
                }

                contents.push(itemname);
                
                internals.push(this.state.value);
                
                vark.push(this.state.varkselection);


                const newPush = this.props.modules;


                this.props.firebase.courses().child(courseID).update({
                    modules: newPush.slice(),
                });
            }
            else {
        
                const allCourses = secureStorage.getItem('courses');
                var courseID;
                for (let i = 0, len = allCourses.length; i < len; ++i) {
                    var course = allCourses[i];
                    if (course.nclasscode === this.props.activeCourse) {
                        courseID = course.appID; // identifies current course child name to update
                        break;
                    }
                }
                const arrModules = this.props.modules;
                const curModule = this.props.moduleTitle;
                for ( let i = 0; i < arrModules.length; ++i) {
                    var neededModule;
                    if ( arrModules[i].title === curModule) {
                        neededModule = arrModules[i]; break; // finds needed module to edit
                    }
                }

                const contents = neededModule.contents;  // modify the corresponding item
                const internals = neededModule.internals;
                const vark = neededModule.vark;
                for ( let i = 0; i < contents.length; ++i) {
                    let itemTemp = contents[i];
                    if ( itemTemp === this.props.itemName && vark[i] === this.props.vark) {
                    
                        internals[i] = this.state.value;
                    }
                }


                const newPush = this.props.modules; // record to database
                

                this.props.firebase.courses().child(courseID).update({
                    modules: newPush.slice(),
                });
            }
        }

        this.closePopup();
    }

    // handleFilter(theState) { //handles selection of the dropdown VARK by the teacher
    //     this.setState({varkselection: theState}, () => this.filterCallback());
    // }

    // filterCallback() { //callback from handleFilter
    //     const allCourses = secureStorage.getItem('courses');
    //         var courseID;
    //         for (let i = 0, len = allCourses.length; i < len; ++i) {
    //             var course = allCourses[i];
    //             if (course.nclasscode === this.props.activeCourse) {
    //                 courseID = course.appID; // identifies current course child name to update
    //                 break;
    //             }
    //         }
    //         const arrModules = this.props.modules;
    //         const curModule = this.props.moduleTitle;
    //         for ( let i = 0; i < arrModules.length; ++i) {
    //             var neededModule;
    //             if ( arrModules[i].title === curModule) {
    //                 neededModule = arrModules[i]; break; // finds needed module to edit
    //             }
    //         }

    //         const contents = neededModule.contents;  // modify the corresponding item
    //         const vark = neededModule.vark;
    //         for ( let i = 0; i < contents.length; ++i) {
    //             let itemTemp = contents[i];
    //             if ( itemTemp === this.props.itemName) {
    //                 vark[i] = this.state.varkselection;
    //             }
    //         }

    //         const newPush = this.props.modules; // record to database
            
    //         this.props.firebase.courses().child(courseID).update({
    //             modules: newPush.slice(),
    //         });
    //     this.render();
    // }

    closePopup() {
        if (this.props.cancelFunc) {
            this.props.cancelFunc();
        }
        ModalManager.close();
    }

    render(){
        var itemname = (this.props.itemName==="add") ? ("") : (this.props.itemName);
       var internalDisplay = "";
       var link = this.props.internal;
       const bigModal = {
            content: {
                margin                  : '0 auto auto auto',
                width                   : '100%',
                height                  : '100%',
                textAlign               : 'center',
                overflow                : 'hidden',
            }
        };

       if (this.props.teacherMode) { //If we're in edit mode
        //    if (this.props.addItemMode) { //If we need to add a new item
                var topBar = (
                    <div className="modaltopbar">
                        <button id="topbarbutton" onClick={this.closePopup}><img src={xicon} alt="Return" height="15px" alt="Exit Dialog"/></button>
                        <h2 className="topbarheader">{itemname}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h2>
                        
                    </div>
                );
                var headerBar = (
                    null
                );

                //GUIDES

                var ytguide = (
                    <>
                        <br /><br />
                        <hr />
                        <br /><br />
                        <div className="instructionguide">
                            <h3>How to get a YouTube Video link</h3>
                            <br /><br />
                            <h2>Step 1</h2>
                            <img src={ytguide1} alt="Instructions"/><br />
                            <p>From the default YouTube video page, click "Share."</p>
                            <br /><br />
                            <h2>Step 2</h2>
                            <img src={ytguide2} alt="Instructions"/><br />
                            <p>Hit "Copy" in the popup that appears.<br />
                            If you want to change the timestamp at which the video begins to play, check the checkbox underneath the link, and type in the desired timestamp.</p>
                            <br /><br />
                        </div>
                    </>
                );

                var gdrivevid = (
                    <>
                        <br /><br />
                        <hr />
                        <br /><br />
                        <div className="instructionguide">
                            <h3>How to get a Google Drive Video/Audio link</h3>
                            <br /><br />
                            <h2>Step 1</h2>
                            <img src={gdrivevid1} alt="Instructions"/><br />
                            <p>From the file preview in Google Drive, click the Menu icon in the top right, and then click "Share."</p>
                            <br /><br />
                            <h2>Step 2</h2>
                            <img src={gdrivevid2} alt="Instructions"/><br />
                            <p>In the popup that appears, hit "Change" in the bottom left.</p>
                            <h2>Step 3</h2>
                            <img src={gdrivevid3} alt="Instructions"/><br />
                            <p>If you want the students to be able to edit the file directly, make sure the dropdown reads "Editor." However, if you only want them to be able to comment on the file, select "Commenter," or if you only want them to be able to view the file, select "Viewer." Then click "Copy Link." </p>
                            <br /><br />
                        </div>
                    </>
                );

                var gdrivedoc = (
                    <>
                        <br /><br />
                        <hr />
                        <br /><br />
                        <div className="instructionguide">
                            <h3>How to get a Google Drive Document link</h3>
                            <br /><br />
                            <h2>Step 1</h2>
                            <img src={gdrivedoc1} alt="Instructions"/><br />
                            <p>From the file, open in Google Docs, Slides, or some other editor, click the Share button in the top right.</p>
                            <br /><br />
                            <h2>Step 2</h2>
                            <img src={gdrivedoc2} alt="Instructions"/><br />
                            <p>In the popup that appears, hit "Change" in the bottom left.</p>
                            <h2>Step 3</h2>
                            <img src={gdrivedoc3} alt="Instructions"/><br />
                            <p>If you want the students to be able to edit the file directly, make sure the dropdown reads "Editor." However, if you only want them to be able to comment on the file, select "Commenter," or if you only want them to be able to view the file, select "Viewer." Then click "Copy Link." </p>
                            <br /><br />
                        </div>
                    </>
                );

                var gdriveform = (
                    <>
                        <br /><br />
                        <hr />
                        <br /><br />
                        <div className="instructionguide">
                            <h3>How to use Google Forms for Assessments</h3>
                            <br /><br />
                            <h2>Step 1</h2>
                            <img src={gdriveform1} alt="Instructions"/><br />
                            <p>Open a Google Form. In the top right, click the settings icon to open the settings dialog.</p>
                            <br /><br />
                            <h2>Step 2</h2>
                            <img src={gdriveform2} alt="Instructions"/><br />
                            <p>In the popup that appears, hit "Quizzes," and then hit the switch so that it's on. Modify the settings if you want, and then hit "Save."<br />
                            You should now be able to assign point values and correct answers to questions, and automatically view and grade student responses.</p>
                            <h2>Step 3</h2>
                            <img src={gdriveform3} alt="Instructions"/><br />
                            <p>Once your quiz is ready, hit "Send" in the top right, click the link icon, and then hit "Copy" to get the link.</p>
                            <br /><br />
                        </div>
                    </>
                );

                //FORM OPTIONS

                var youtubelink = (
                    <>
                        <form onSubmit={(event) => this.handleSubmit(event, 1)}>
                            <label>
                                <p className="teachernotice">Enter the YouTube video link:</p>
                                <input type="text" value={this.state.value} onChange={this.handleChange}/></label>
                                <br /><br />
                            <input type="submit" value="Submit" />
                        </form>
                        {ytguide}
                    </>
                )

                var googledrivelink = (
                    <>
                        <form onSubmit={(event) => this.handleSubmit(event, 2)}>
                            <label>
                                <p className="teachernotice">Enter the Google Drive view link:</p>
                                <input type="text" value={this.state.value} onChange={this.handleChange}/></label>
                                <br /><br />
                            <input type="submit" value="Submit" />
                        </form>
                        {gdrivevid}
                    </>
                );

                var googledriveformlink = (
                    <>
                        <form onSubmit={(event) => this.handleSubmit(event, 2)}>
                            <label>
                                <p className="teachernotice">Enter the Google Form link:</p>
                                <input type="text" value={this.state.value} onChange={this.handleChange}/></label>
                                <br /><br />
                            <input type="submit" value="Submit" />
                        </form>
                        {gdriveform}
                    </>
                );

                var googledrivedoclink = (
                    <>
                        <form onSubmit={(event) => this.handleSubmit(event, 2)}>
                            <label>
                                <p className="teachernotice">Enter the Google Drive view link:</p>
                                <input type="text" value={this.state.value} onChange={this.handleChange}/></label>
                                <br /><br />
                            <input type="submit" value="Submit" />
                        </form>
                        {gdrivedoc}
                    </>
                );

                var otherlink = (
                    <>
                        <form onSubmit={(event) => this.handleSubmit(event, 3)}>
                            <label>
                                <p className="teachernotice">Enter the link:</p>
                                <input type="text" value={this.state.value} onChange={this.handleChange}/></label>
                                <br /><br />
                            <input type="submit" value="Submit" />
                        </form>
                    </>
                );

                var fileuploadlink = ( //FILE UPLOAD. input type is 4. Specify mb max size, as well as accepted file formats. Check for max size before allowing upload - plug submit into the handler
                    <>
                        <div> 
                            <p className="teachernotice">Select a file to upload.</p>
                            <p className="smallteachernotice">Maximum file size: 10 MB.</p>
                            <br /><br />
                            <div className="upload-btn-wrapper">
                                <button className="btn">Select a file</button>
                                <input className="custom-file-input" type="file" onChange={this.onFileChange} /> 
                            </div>
                            {this.fileData()} 
                            {this.state.error}
                            {(this.fileData()!==null) ? (
                            <button className="uploadfilebutton" onClick={(event) => this.handleSubmit(event, 4)}>
                                Upload file
                            </button>) : (null)}
                            <br /><br />
                        </div> 
                    </>
                );
                
                if (this.props.contentType==='Video' || this.props.contentType==='Audio') { //if its video or audio
                    headerBar = (
                        <>
                            <h2>How do you wish to enter this item?</h2>
                            <br />
                            <button className="inputtypebutton" onClick={() => this.setInputType(1)}>
                                Youtube Video
                            </button>
                            {/* <button className="inputtypebutton" onClick={() => this.setInputType(2)}>
                                Google Drive
                            </button> */}
                            <button className="inputtypebutton" onClick={() => this.setInputType(3)}>
                                Other Link
                            </button>
                        </>
                    );

                    if (this.state.inputType===0) {
                        internalDisplay = (null);
                    } else if (this.state.inputType===1) { //if youtube video
                        internalDisplay = (
                            youtubelink
                        );
                    } else if (this.state.inputType===2) {
                        internalDisplay = (
                            googledrivelink
                        );
                    } else if (this.state.inputType===3) {
                        internalDisplay = (
                            otherlink
                        );
                    } 
                }
                if (this.props.contentType==='Document') { //if its document
                    headerBar = (
                        <>
                            <h2>How do you wish to enter this item?</h2>
                            <br />
                            <button className="inputtypebutton" onClick={() => this.setInputType(1)}>
                                File Upload
                            </button>
                            <button className="inputtypebutton" onClick={() => this.setInputType(2)}>
                                Google Drive
                            </button>
                            <button className="inputtypebutton" onClick={() => this.setInputType(3)}>
                                Other Link
                            </button>
                        </>
                    );

                    if (this.state.inputType===0) {
                        internalDisplay = (null);
                    } else if (this.state.inputType===1) { //if file upload
                        internalDisplay = ( //FILE UPLOAD. input type is 4. Specify mb max size, as well as accepted file formats
                            fileuploadlink
                        );
                    } else if (this.state.inputType===2) {
                        internalDisplay = (
                            googledrivedoclink
                        );
                    } else if (this.state.inputType===3) {
                        internalDisplay = (
                            otherlink
                        );
                    } 
                }
                if (this.props.contentType==='Assessment') { //if its assessment
                    headerBar = (
                        <>
                            <h2>How do you wish to enter this item?</h2>
                            <br />
                            <button className="inputtypebutton" onClick={() => this.setInputType(1)}>
                                Google Form (recommended)
                            </button>
                            <button className="inputtypebutton" onClick={() => this.setInputType(4)}>
                                Google Drive Document
                            </button>
                            <button className="inputtypebutton" onClick={() => this.setInputType(2)}>
                                File Upload
                            </button>
                            <button className="inputtypebutton" onClick={() => this.setInputType(3)}>
                                Other Link
                            </button>
                        </>
                    );

                    if (this.state.inputType===0) {
                        internalDisplay = (null);
                    } 
                    else if (this.state.inputType===2) { //if file upload
                        internalDisplay = ( 
                            fileuploadlink
                        );
                    } 
                    else if (this.state.inputType===1) {
                        internalDisplay = (
                            googledriveformlink
                        );
                    } 
                    else if (this.state.inputType===3) {
                        internalDisplay = (
                           otherlink
                        );
                    } else if (this.state.inputType===4) {
                        internalDisplay = (
                            googledrivedoclink
                        );
                    }
                }

                return ( //big modal
                    <Modal
                        style = {bigModal}
                        onRequestClose={this.props.onRequestClose}
                        effect={Effect.ScaleUp}
                    >
                        {topBar}
                        <br /><br />
                        {headerBar}
                        <br /><br /><br />
                        <hr />
                        <br /><br />
                        {internalDisplay}
                    </Modal>
                );
        //    } 
        //    else { //If we need to edit an existing item // THIS IS NEXT
        //         internalDisplay = (
        //             <div>
        //                 <center>
        //                     <h1 style={{fontSize: "xx-large"}}>Edit this item</h1>
        //                     <Select passState={this.handleFilter} default={"Choose a content type"}/>
        //                     <form onSubmit={this.handleSubmit}>
        //                         <label>
        //                             <p className="teachernotice">Enter the link to the item:</p>
        //                             <input type="text" value={this.state.value} onChange={this.handleChange}/></label>
        //                             <br /><br />
        //                         <input type="submit" value="Submit" />
        //                     </form>
        //                 </center>
        //             </div>
        //         );

        //         return ( //small modal
        //             <Modal
        //                 className="modaldialog"
        //                 onRequestClose={this.props.onRequestClose}
        //                 effect={Effect.ScaleUp}>
        //                 <h1 className="modaldialog">
        //                     {internalDisplay}
        //                 </h1>
        //             </Modal>
        //         );
        //     }
       }
       else { //if we're in student view mode
            var topBar = (
                <div className="modaltopbar">
                    <button id="topbarbutton" onClick={this.closePopup}><img alt="Exit dialog" src={xicon} alt="Return" height="15px" /></button>
                    <div className="centeredtopbaritem">                  
                        <button id="topbarbutton" onClick={() => this.props.goBack(itemname)}>&#9664; &nbsp; Back &nbsp; </button>      
                        <h2 className="topbarheader">{itemname}</h2>                        
                        <button id="topbarbutton" onClick={() => this.props.goNext(itemname)}>&nbsp; Next &nbsp; &#9654;</button>
                    </div>
                    <button id="topbarbutton" onClick={() => window.open(this.props.internal, "_blank")}><img alt="Open in new tab" src={newtabicon} alt="Return" height="15px" /></button>
                </div>
            );
            var bottomBar = (
                null
                // <div className="modalbottombar">
                    
                    
                // </div>
            );
            if (typeof link === 'undefined') { //if the link is undefined, we want to ignore it (it's probably an old or deleted item)
                // alert('Not available');
                return;
            }
            if("VARK".includes(this.props.vark) && link.includes("google")){ //if it's a Google Drive file
                // if (link.includes("/edit?usp=sharing")) { //standardize link view
                //     link = link.substring(0, link.indexOf("/edit?usp=sharing")) + "/view?usp=sharing";
                // }
                // if (link.includes("/view?usp=sharing")) { //if its a google drive shared file
                //     link = link.substring(0, link.indexOf("/view?usp=sharing")) + "/preview"; //make it an embeddable preview
                // }
                if (link.includes("/viewform")) { //if its a google form/quiz, make it embedded
                    link += "?embedded=true";
                }

                //embed it
                var beforeCode = "<iframe src=\"";
                var afterCode = "\" width=\"100%\" height=\"100%\" />";
                var code = beforeCode + link + afterCode;

                internalDisplay = (<div dangerouslySetInnerHTML={{__html: code}}></div>);

                return ( //big modal
                    <Modal
                        style= {bigModal}
                        onRequestClose={this.props.onRequestClose}
                        effect={Effect.ScaleUp}
                    >
                        <div className="noscroll">
                            {topBar}
                            <div className="scroll">
                                {internalDisplay}
                            </div>
                            {bottomBar}
                        </div>
                    </Modal>
                );
            } else if (link.includes("youtube") || link.includes("youtu.be")) { //if it's a Youtube video
                if (link.includes("youtu.be"))
                    link = link.substring(0, link.indexOf("youtu.be")) + "youtube.com/watch?v=" + link.substring(link.indexOf("be/") + 3, link.length);
                if (link.includes("youtube"))
                    link = link.substring(0, link.indexOf("/watch?v=")) + "/embed/" + link.substring(link.indexOf("v=") + 2, link.length);
                var beforeCode = "<iframe width=\"1008\" height=\"567\" src=\"";
                var afterCode = "\" frameBorder=\"0\"\n" +
                    "allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\"\n" +
                    "allowFullScreen></iframe>";
                var code = beforeCode + link + afterCode;

                internalDisplay = (<div dangerouslySetInnerHTML={{__html: code}}></div>);

                return ( //big modal
                    <Modal
                        style= {bigModal}
                        onRequestClose={this.props.onRequestClose}
                        effect={Effect.ScaleUp}
                    >
                        <div className="noscroll">
                            {topBar}
                            <div className="scroll">
                                {internalDisplay}
                            </div>
                            {bottomBar}
                        </div>
                    </Modal>
                );

            } else if (link.includes('firebasestorage.googleapis.com')) { //The link is a firebase file
                let file = link;
                let type = link.substring(link.lastIndexOf('.'));

                internalDisplay = (
                    <FileViewer
                        fileType={type}
                        filePath={file}
                    />
                );

                return ( //big modal
                    <Modal
                        style= {bigModal}
                        onRequestClose={this.props.onRequestClose}
                        effect={Effect.ScaleUp}
                    >
                        <div className="noscroll">
                            {topBar}
                            <div className="scroll">
                                {internalDisplay}
                            </div>
                            {bottomBar}
                        </div>
                    </Modal>
                );
            }
            else { //The link cannot be embedded as either Google Drive or normal File. We'll simply link to it in a new tab.
                var beforeCode = "<a class=\"linkbutton\" target=\"_blank\" href=\"";
                var afterCode = "\">Click here to open content in new tab</a>";
                var code = beforeCode + link + afterCode;

                internalDisplay = (<div dangerouslySetInnerHTML={{__html: code}}></div>);

                return ( //small modal
                    <Modal
                        className="modaldialog"
                        onRequestClose={this.props.onRequestClose}
                        effect={Effect.ScaleUp}>
                        <h1 className="modaldialog">
                            <table style={{maxHeight: "50px"}}>
                                <tr>
                                    <td>
                                        <button id="backbutton" onClick={this.closePopup}><img alt="Exit dialog" src={xicon} alt="Return" height="15px"/></button>
                                    </td>
                                    <td>
                                        {internalDisplay}
                                    </td>
                                </tr>
                            </table>
                        </h1>
                    </Modal>
                );
            }
        }
    }
}

//DOC: Component: Inline button that, when clicked, allows the user to rename a module.
//Input: internal, moduleTitle, modules, firebase, activeCourse
//Output: JSXElement
class RenameModule extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.clearField = this.clearField.bind(this);
        this.cancel = this.cancel.bind(this);
        this.state = {
            value: this.props.internal,
            active: false,
            newVal: "Enter new module name",
        };
    }

    cancel() {
        this.setState({
            active: false,
        });
    }

    clearField() {
        if (this.state.newVal==="Enter new module name") {
            this.setState({
                newVal: "",
            });
        }
    }

    onClick() {
        this.setState({
            active: true,
        });
    }

    handleChange(event) {    this.setState({newVal: event.target.value});  }

    handleSubmit(event) {
        this.setState({
            value: this.state.newVal,
            active: false,
        });

        // this will rename the current module
        const allCourses = secureStorage.getItem('courses');
        var courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                courseID = course.appID; // identifies current course child name to update
                break;
            }
        }
        const arrModules = this.props.modules;

        //check if we already have a module with that name
        let iteration;
        for (iteration in arrModules) {
            if (arrModules[iteration].title===this.state.newVal) {
                alert('You already have a module with that name!');
                return;
            }
        }

        const curModule = this.props.moduleTitle;
        for ( let i = 0; i < arrModules.length; ++i) {
            if ( arrModules[i].title === curModule) {
                arrModules[i].title = this.state.newVal; // sets the new name
            }
        }
        const newPush = this.props.modules; // push to firebase
        this.props.firebase.courses().child(courseID).update({
            modules: newPush.slice(),
        });

        event.preventDefault();
    }

    render() {
        var inside = (
            <input className="internaldeletion" type="submit" value="Rename" />
        );
        if (this.state.active) {
            inside = (
            <div className="bisplitwrap">
                <form onSubmit={this.cancel}>
                    <input className="whiteinternal" type="submit" value="Cancel" />
                </form>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        <input className="whiteinternal" type="text" value={this.state.newVal} onChange={this.handleChange} onClick={this.clearField}/>
                    </label>
                    <input className="whiteinternal" type="submit" value="Submit" />
                </form>
            </div>
            );
        }

        return (
            <div className={this.state.active ? "activerenameitem" : "renameitem"} onClick={() => this.onClick()}>
                {inside}
            </div>
        );
    }
}

//DOC: Component: Inline button that, when clicked, allows the user to delete a module.
//Input: internal, moduleTitle, modules, firebase, activeCourse
//Output: JSXElement
class DeleteModule extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.cancel = this.cancel.bind(this);
        this.state = {
            value: this.props.internal,
            active: false,
            newVal: this.props.internal,
        };
    }

    cancel() {
        this.setState({
            active: false,
        });
    }

    onClick() {
        this.setState({
            active: true,
        });
    }

    handleChange(event) {    this.setState({newVal: event.target.value});  }

    handleSubmit(event) {
        this.setState({
            value: this.state.newVal,
            active: false,
        });

        // this will rename the current module
        const allCourses = secureStorage.getItem('courses');
        var courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                courseID = course.appID; // identifies current course child name to update
                break;
            }
        }
        const arrModules = this.props.modules;

        const curModule = this.props.moduleTitle;
        for ( let i = 0; i < arrModules.length; ++i) {
            if ( arrModules[i].title === curModule) {
                arrModules[i].title = "DELETE THAT YOU HOT DOG"; // sets the new name to delete ot
            }
        }
        const newPush = this.props.modules; // push to firebase
        this.props.firebase.courses().child(courseID).update({
            modules: newPush.slice(),
        });

        event.preventDefault();
    }

    render() {
        var inside = (
            <input className="internaldeletion" type="submit" value="Delete" />
        );
        if (this.state.active) {
            inside = (
                <div className="bisplitwrap">
                    <form onSubmit={this.cancel}>
                        <input className="internaldeletion" type="submit" value="Cancel" />
                    </form>
                    <form onSubmit={this.handleSubmit}>
                        <input className="internaldeletion" type="submit" value="Confirm Deletion" />
                    </form>
                </div>
            );
        }

        return (
            <div className={this.state.active ? "activerenameitem" : "renameitem"} onClick={() => this.onClick()}>
                {inside}
            </div>
        );
    }
}

//DOC: Component: Inline button that, when clicked, allows the user to rename an item.
//Input: internal, moduleTitle, activeCourse, modules, itemName, vark, firebase
//Output: JSXElement
class RenameItem extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.clearField = this.clearField.bind(this);
        this.cancel = this.cancel.bind(this);
        this.state = {
            value: this.props.internal,
            active: false,
            newVal: "Enter new item name",
        };
    }

    cancel() {
        this.setState({
            active: false,
        });
    }

    clearField() {
        if (this.state.newVal==="Enter new item name")
            this.setState({newVal: ""});
    }

    onClick() {
        this.setState({
            active: true,
        });
    }

    handleChange(event) {    this.setState({newVal: event.target.value});  }

    handleSubmit(event) {

        this.setState({
            value: this.state.newVal,
            active: false,
        });

        const allCourses = secureStorage.getItem('courses');
        var courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                courseID = course.appID; // identifies current course child name to update
                break;
            }
        }
        const arrModules = this.props.modules;
        const curModule = this.props.moduleTitle;
        
        for ( let i = 0; i < arrModules.length; ++i) {
            var neededModule2;
            if ( arrModules[i].title === curModule) {
                neededModule2 = arrModules[i]; break; // finds needed module to edit
            }
        }

        const contents = neededModule2.contents;  // renames the corresponding item
        const vark = neededModule2.vark;

        let count = 0;
        for ( let i = 0; i < contents.length; ++i) { //check we're not duplicating item names
            let itemTemp = contents[i];
            
            if ( (itemTemp === this.state.newVal) /*&& (vark[i] === this.props.vark)*/) {
                alert('You already have an item with that name!');
                event.preventDefault();
                return;
            }
        }

        for ( let i = 0; i < contents.length; ++i) { //good, actually rename it now
            let itemTemp = contents[i];
            if ( (itemTemp === this.props.itemName) /*&& (vark[i] === this.props.vark)*/) {
                contents[i] = this.state.newVal;
            }
        }

        const newPush = this.props.modules; // record to database
        

        this.props.firebase.courses().child(courseID).update({
            modules: newPush.slice(),
        });

        event.preventDefault();
    }

    render() {
        var inside = (
            <input className="whiteinternaldeletion" type="submit" value="Rename" />
        );
        if (this.state.active) {
            inside = (
                <div className="bisplitwrap">
                    <form onSubmit={this.cancel}>
                        <input className="internal" type="submit" value="Cancel" />
                    </form>
                    <form onSubmit={this.handleSubmit}>
                        <label>
                            <input className="whiteinternal" type="text" value={this.state.newVal} onChange={this.handleChange} onClick={this.clearField}/>
                        </label>
                        <input className="internal" type="submit" value="Submit" />
                    </form>
                </div>
            );
        }

        return (
            <div className={this.state.active ? "activerenameitemblue" : "renameitemblue"} onClick={() => this.onClick()}>
                {inside}
            </div>
        );
    }
}

//DOC: Component: Inline button that, when clicked, allows the user to delete an item.
//Input: internal, moduleTitle, activeCourse, modules, itemName, vark, firebase
//Output: JSXElement
class DeleteItem extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.cancel = this.cancel.bind(this);
        this.state = {
            value: this.props.internal,
            active: false,
            newVal: this.props.internal,
        };
    }

    cancel() {
        this.setState({
            active: false,
        });
    }

    onClick() {
        this.setState({
            active: true,
        });
    }

    handleChange(event) {    this.setState({newVal: event.target.value});  }

    handleSubmit(event) {
        this.setState({
            value: this.state.newVal,
            active: false,
        });

        const allCourses = secureStorage.getItem('courses');
        var courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                courseID = course.appID; // identifies current course child name to update
                break;
            }
        }
        const arrModules = this.props.modules;
        const curModule = this.props.moduleTitle;
        
        for ( let i = 0; i < arrModules.length; ++i) {
            var neededModule2;
            if ( arrModules[i].title === curModule) {
                neededModule2 = arrModules[i]; break; // finds needed module to edit
            }
        }

        const contents = neededModule2.contents;  // renames the corresponding item
        const vark = neededModule2.vark;

        for ( let i = 0; i < contents.length; ++i) { //good, actually rename it now
            let itemTemp = contents[i];
            if ( (itemTemp === this.props.itemName) /*&& (vark[i] === this.props.vark)*/) {
                contents[i] = "DELETE THAT YOU HOT DOG";
            }
        }

        const newPush = this.props.modules; // record to database

        this.props.firebase.courses().child(courseID).update({
            modules: newPush.slice(),
        });

        event.preventDefault();
    }

    render() {
        var inside = (
            <input className="whiteinternaldeletion" type="submit" value="Delete" />
        );
        if (this.state.active) {
            inside = (
                <div className="bisplitwrap">
                    <form onSubmit={this.cancel}>
                        <input className="whiteinternaldeletion" type="submit" value="Cancel" />
                    </form>
                    <form onSubmit={this.handleSubmit}>
                        <input className="whiteinternaldeletion" type="submit" value="Confirm Deletion" />
                    </form>
                </div>
            );
        }

        return (
            <div className={this.state.active ? "activerenameitemblue" : "renameitemblue"} onClick={() => this.onClick()}>
                {inside}
            </div>
        );
    }
}

//DOC: Component: Inline button that, when clicked, allows the user to edit an item.
//Input: openModal
//Output: JSXElement
class EditItem extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.cancel = this.cancel.bind(this);
        this.openModal = this.openModal.bind(this);
        this.state = {
            active: false,
        };
    }

    cancel() {
        this.setState({
            active: false,
        });
    }

    onClick() {
        this.setState({
            active: true,
        });
    }

    shouldComponentUpdate(newProps, newState) {
        return (newState.active!==this.state.active);
    }

    openModal(name) {
        this.props.openModal(name, this.cancel); 
    }

    render() {
        var inside;
        
        if (this.state.active) {
            inside = (
                <div className="bisplitwrap">
                    <form onSubmit={this.cancel}>
                        <input className="whiteinternaldeletion" type="submit" value="Cancel" />
                    </form>

                    <button className="dropdownbuttons" onClick={() => {this.openModal('Video');}}>Video</button>
                    
                    <button className="dropdownbuttons" onClick={() => {this.openModal('Audio');}}>Audio</button>
                    
                    <button className="dropdownbuttons" onClick={() => {this.openModal('Document');}}>Document</button>
                    
                    <button className="dropdownbuttons" onClick={() => {this.openModal('Assessment')}}>Assessment</button>
                </div>
            );
        } else {
            inside = (
                <input className="whiteinternaldeletion" type="submit" value="Edit Item" />
            );
        }

        return (
            <div className={this.state.active ? "activerenameitemblue" : "renameitemblue"} onClick={() => this.onClick()}>
                {inside}
            </div>
        );
    }
}

//DOC: Component: A course item, that, when clicked, displays one of the course contents.
//Input: updateMap, varkStatus, instantOpen, name, vark, internal, addVarkClicks, teacherMode, moduleTitle, activeCourse, modules, firebase, evenodd, isMobile
//Output: JSXElement
class ModuleContentItem extends React.Component {
    constructor(props) {
        super(props);
        this.openModal = this.openModal.bind(this);
        this.getProgress = this.getProgress.bind(this);
        this.state = {
            progressMark: this.getProgress()
        }
    }

    getProgress() {
        //this.props.moduleTitle has the title of the current module
        //this.props.name has the name of the current item
        try{
            const usr = secureStorage.getItem('authUser');
            const listofstuff = Object.values(usr).slice()[5];
            const listofmodules = listofstuff[this.props.activeCourse];
            const listofitems = listofmodules[this.props.moduleTitle];
            const status = listofitems[this.props.name]
            const temp = status["status"];
            return temp;
        } catch (e){return false;}
    }

    markProgress = checked => {
        this.setState({
            progressMark: !(this.state.progressMark)
        });
        
        //this.props.moduleTitle has the title of the current module
        //this.props.name has the name of the current item
        const usr = secureStorage.getItem('authUser');
        this.props.firebase.user(Object.values(usr).slice()[0]).child('vcourseprogress')
        .child(this.props.activeCourse)
        .child(this.props.moduleTitle)
        .child(this.props.name).update({
            status: checked,
        });

        this.props.updateMap(this.props.name, checked);

        this.props.firebase.onAuthUserListener(
            authUser => {
                secureStorage.setItem('authUser', authUser);
            },
            () => { // callback
            },
        );
    }

    openModal(contentType, cancelFunc) { //this registers the click
        let teacherMode = !(contentType==="studentmode");
        if (this.props.varkStatus) {
            this.props.addVarkClicks(this.props.vark);
        }
        if (this.props.instantOpen) {
            window.open(this.props.internal, '_blank');
        }
        else {
            const header = this.props.name;
            ModalManager.open(<MyModal goNext={this.props.goNext} goBack={this.props.goBack} cancelFunc={cancelFunc} contentType={contentType} addItemMode={false} varkStatus={this.props.varkStatus} itemName={this.props.name} firebase={this.props.firebase} text={header} modules={this.props.modules} activeCourse={this.props.activeCourse} moduleTitle={this.props.moduleTitle} internal={this.props.internal} vark={this.props.vark} onRequestClose={() => true} teacherMode={teacherMode} />);
        }
    }

    render() {
        let precede = this.props.vark;
        // var attribute = precede+"modulecontentitem"
        var attribute = (this.props.evenodd) ? ("lightmodulecontentitem") : ("darkmodulecontentitem");
        if (this.props.isMobile==='medium') {
            attribute = "mobile"+attribute;
        } else {
            attribute = "lightmodulecontentitem";
        }

        var teacherMode = this.props.teacherMode;
        var renameDisplay = (
            <RenameItem
                internal={this.props.name}
                moduleTitle={this.props.moduleTitle}
                activeCourse={this.props.activeCourse}
                modules={this.props.modules}
                vark={this.props.vark}
                itemName={this.props.name}
                firebase={this.props.firebase}
            />
        );
        var deleteDisplay = (
            <DeleteItem
                internal={this.props.name}
                moduleTitle={this.props.moduleTitle}
                activeCourse={this.props.activeCourse}
                modules={this.props.modules}
                vark={this.props.vark}
                itemName={this.props.name}
                firebase={this.props.firebase}
            />
        );
        var editDisplay = (
            <EditItem
                openModal={this.openModal}
            />
        );

        var formatText=(this.state.progressMark) ? ("strikethrough") : ("normal");
        var formatText=("normal");

        var datacells = (
            <div className={attribute}>
                <div className="showflex" >
                    {this.props.isMobile==='medium' ? null : <label className={(this.state.progressMark) ? ('activeswitchcheck') : ('switchcheck')} onClick={() => this.markProgress(!(this.state.progressMark))} />}
                    <div className="showtext" onClick={() => {this.openModal('studentmode')}}>
                        <div className={formatText}>
                            {this.props.name}
                        </div>
                    </div>
                </div>
            </div>
        );
        //insert 5 lines below: onClick={() => {this.openModal('studentmode')}}
        if (teacherMode) {
            datacells = (
                <div className={"unresponsive"+attribute} >
                    <div className="editflex" >
                        <div className="editflextext">
                            {editDisplay}
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <div className={formatText}>
                                {this.props.name}
                            </div>
                        </div>
                        <div className="editflexicon">
                            {renameDisplay}
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            {deleteDisplay}
                        </div>
                    </div>
                    
                </div>
            );
        }

        return (
            <div>
                {datacells}
            </div>
        );
    }
}

//DOC: Component: A button that allows the user (assumedly a teacher) to add an item to the module.
//Input: moduleTitle, activeCourse, modules, firebase, varkStatus
//Output: JSXElement
class AddModuleContentItemItem extends React.Component {
    constructor(props) {
        super(props);
        this.openModal = this.openModal.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.clearField = this.clearField.bind(this);
        this.deactivate = this.deactivate.bind(this);
        this.activate = this.activate.bind(this);
        this.state = {
            active: 0,
            newVal: 'Enter item name',
        }
    }

    handleChange(event) {
        this.setState({
            newVal: event.target.value,
        });
    }

    clearField() {
        if (this.state.newVal==="Enter item name") {
            this.setState({
                newVal: "",
            });
        }
    }

    deactivate() {
        this.setState({
            active: 0,
        });
    }

    activate(step) {
        this.setState({
            active: step,
        });
    }

    openModal(contentType) { //this registers the click
        let vark = "";
        if (contentType==='Video') {
            vark = 'V';
        }
        if (contentType==="Audio") {
            vark = 'A';
        }
        if (contentType==='Document') {
            vark = 'R';
        }
        if (contentType==='Assessment') {
            vark = 'K';
        }
        
        ModalManager.open(<MyModal vark={vark} contentType={contentType} varkStatus={this.props.varkStatus} itemName={this.state.newVal} firebase={this.props.firebase} moduleTitle={this.props.moduleTitle} activeCourse={this.props.activeCourse} modules={this.props.modules} onRequestClose={() => true} teacherMode={true} addItemMode={true}/>);
    }

    render() {
        var dropdown = (this.state.active===2) ? (
            <>
                <br />
                <button className="dropdownbuttons" onClick={() => {this.deactivate(); this.openModal('Video');}}>Video</button>
                <br />
                <button className="dropdownbuttons" onClick={() => {this.deactivate(); this.openModal('Audio');}}>Audio</button>
                <br />
                <button className="dropdownbuttons" onClick={() => {this.deactivate(); this.openModal('Document');}}>Document</button>
                <br />
                <button className="dropdownbuttons" onClick={() => {this.deactivate(); this.openModal('Assessment')}}>Assessment</button>
            </>
        ) : (null);

        var form = (this.state.active===1) ? (
            <>
                <form onSubmit={() => this.activate(2)}>
                    <label>
                        <input id="darkinternal" type="text" value={this.state.newVal} onChange={this.handleChange} onClick={this.clearField}/>
                    </label>
                    <input className="darkinternaladd" type="submit" value="Submit" />
                </form>                
            </>
        ) : (null);

        return (
            <div className={"addmodulecontentitem"} >
                {(this.state.active!==0) ? (<><button className="dropdownbutton" onClick={() => this.deactivate()}>Cancel</button></>) : (<button className="dropdownbutton" onClick={() => this.activate(1)}>Add an Item</button>)}
                {form}
                {dropdown}
            </div>
        );
    }
}

//DOC: Component: A button that allows the user (assumedly a teacher) to add a module to the course.
//Input: internal, activeCourse, modules, firebase, changeActiveCourse
//Output: JSXElement
class AddModuleItem extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.clearField = this.clearField.bind(this);
        this.state = {
            value: this.props.internal,
            active: false,
            newVal: "Enter Module Name",
        };
    }

    clearField() {
        if (this.state.newVal==="Enter Module Name") {
            this.setState({
                newVal: "",
            });
        }
    }

    handleChange(event) {    this.setState({newVal: event.target.value});  }

    handleSubmit(event) {
        event.preventDefault();

        const allCourses = secureStorage.getItem('courses');
        var courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                courseID = course.appID; // identifies current course child name to update, courseID != classcode
                break;
            }
        }
        const arrModules = this.props.modules;
        const moduleTitle = this.state.newVal;

        //check if we already have a module with that name
        let iteration;
        for (iteration in arrModules) {
            if (arrModules[iteration].title===moduleTitle) {
                alert('You already have a module with that name!');
                return;
            }
        }
        
        const blankModule =  
        {
            title: moduleTitle,
            contents: ["DELETE THAT YOU HOT DOG",],
            vark: ['A',],
            internals: ["https://youtu.be/uWJtJYXtTKo",]
        } // creates example blank module using module title

        arrModules.push(blankModule);
            
        const newPush = arrModules.slice();

        this.props.firebase.courses().child(courseID).update({
            modules: newPush.slice(),
        });
    }
    
    render() {
        var inside = (null);
        if (this.state.active) {
            inside = (
                <div>
                    <form onSubmit={this.handleSubmit}>
                        <label>
                            <input id="lightinternal" type="text" value={this.state.newVal} onChange={this.handleChange} onClick={this.clearField}/>
                        </label>
                        <input className="internaladd" type="submit" value="Submit" />
                    </form>
                </div>
            ) 
        }

        var button = (this.state.active) ? 
        (<button className="internaladd" onClick={() => this.setState({active: false})}>Cancel</button>) : 
        (<button className="darkdropdownbutton" onClick={() => this.setState({active: true})}>Add a Module</button>);

        return (
            <div className="addmoduleitem">
                <div className="renameitem">
                    <div className="bisplit">
                        {button}
                        {inside}
                    </div>
                </div>
            </div>
        );
    }
}

function checkStrings(string_1, string_2) {
    let valid = true;
    for (var c=0; c<string_1.length; c++) {
        if (string_1.charCodeAt(c) != string_2.charCodeAt(c)) {
            // alert('c:'+c+' '+string_1.charCodeAt(c)+'!='+string_2.charCodeAt(c));
            valid = false;
        }
    }
    return valid;
}

//DOC: Component: Displays an entire module, including all of its content items.
//Input: isMobile, instantOpen, name, contents, vark, internals, active, username, addVarkClicks, varkMode, teacherMode, activeCourse, modules, firebase, showVark, varkStatus
//Output: JSXElement
function ModuleItem(props) {
    // let skippedIndices = [];
    // let cnt1 = 0;
    // for (cnt1 in props.contents) {
    //     if (props.contents[cnt1] === 'DELETE THAT YOU HOT DOG') {
    //         skippedIndices.push(cnt1);
    //     }
    // }
    // let i = 0;
    var localcontents = props.contents.slice();
    var localvark = props.vark.slice();
    var localinternals = props.internals.slice();
    // console.log(localinternals);
    // for (i in skippedIndices) {
    //     localcontents.splice(skippedIndices[i], 1);
    //     localvark.splice(skippedIndices[i], 1);
    //     localinternals.splice(skippedIndices[i], 1);
    // }
    // console.log(localvark);

    function openModal(newindex, localcontents, localinternals) { //this registers the click to skip to the next or prev item
        // console.log(newindex);
        let teacherMode = props.teacherMode; //should be false
        if (props.instantOpen) {
            window.open(localinternals[newindex], '_blank');
        }
        else {
            const header = localcontents[newindex];
            // ModalManager.close();
            ModalManager.open(<MyModal goNext={goNext} goBack={goBack} contentType={localvark[newindex]} addItemMode={false} varkStatus={props.varkStatus} itemName={props.contents[newindex]} firebase={props.firebase} text={header} modules={props.modules} activeCourse={props.activeCourse} moduleTitle={props.name} internal={localinternals[newindex]} vark={localvark[newindex]} onRequestClose={() => true} teacherMode={teacherMode} />);
        }
    }

    function getProgress(contentname) {
        //this.props.moduleTitle has the title of the current module
        //this.props.name has the name of the current item
        try{
            const usr = secureStorage.getItem('authUser');
            const listofstuff = Object.values(usr).slice()[5];
            const listofmodules = listofstuff[props.activeCourse];
            const listofitems = listofmodules[props.name];
            const status = listofitems[contentname]
            const temp = status["status"];
            return temp;
        } catch (e){return false;}
    }

    function goBack(currentItemName) {
        // console.log('I reached the goBack function!');
        // console.log(localcontents.length);
        // console.log(localinternals.length);
        // let index;
        // for (index in localcontents) {

        //     console.log(index);
        //     if (localcontents[index]===currentItemName) {
        //         console.log('I found the correct item and index in goBack! The index is ' + index);
        //         if (index==1) {
        //             console.log('Hey there');
        //             alert('This is the first item in the module.');
        //             return;
        //         }
        //         else {
        //             //open the modal with the new item whose name is listofitems[index-1]
        //             openModal(parseInt(index, 10)-1, localcontents, localinternals);
        //         }
        //     }
        // }
        var i;
        let stopBool = false;
        for (i = localcontents.indexOf(currentItemName); i >= 0; i--) {
            // console.log(localcontents[i]+'');
            var current = (localcontents[i].trim()).normalize("NFKC");
            // console.log(typeof current);
            if (stopBool) {
                // console.log(current);
                openModal(i, localcontents, localinternals);
                return;
            }
            if (i==0) {
                alert('This is the first item in the module.');
                return;
            }
            // console.log('I reached the thing');
            if (checkStrings(((localcontents[i-1].trim()).normalize("NFKC")),(('DELETE THAT YOU HOT DOG').normalize("NFKC")))) {
                // console.log('I recognized the thing');
                if (i==1) {
                    alert('This is the first item in the module.');
                    return;
                }
                else {
                    continue;
                }
            } else {
                // console.log('I failed to recognize the thing');
                stopBool = true;
                continue;
            }
        }
    }
    
    function goNext(currentItemName) {
        // console.log('I reached the goNext function!');
        // console.log(localcontents.length);
        // console.log(localinternals.length);
        // let index;
        // for (index in localcontents) {
        //     console.log(index);
        //     if (localcontents[index]===currentItemName) {
        //         console.log('I found the correct item and index in goNext! The index is ' + index);
        //         if (index==localcontents.length-1) {
        //             alert('This is the last item in the module.');
        //             return;
        //         }
        //         if (localcontents[index]==='DELETE THAT YOU HOT DOG') {

        //         }
        //         else {
        //             //open the modal with the new item whose name is listofitems[index+1]
        //             openModal(parseInt(index, 10)+1, localcontents, localinternals);
        //         }
        //     }
        // }
        var i;
        let stopBool = false;
        for (i = localcontents.indexOf(currentItemName); i < localcontents.length; i++) {
            // console.log(localcontents[i]+'');
            var current = (localcontents[i].trim()).normalize("NFKC");
            // console.log(typeof current);
            if (stopBool) {
                // console.log(current);
                openModal(i, localcontents, localinternals);
                return;
            }
            if (i==localcontents.length-1) {
                alert('This is the last item in the module.');
                return;
            }
            // console.log('I reached the thing');
            if (checkStrings(((localcontents[i+1].trim()).normalize("NFKC")),(('DELETE THAT YOU HOT DOG').normalize("NFKC")))) {
                // console.log('I recognized the thing');
                if (i==localcontents.length-1) {
                    alert('This is the last item in the module.');
                    return;
                }
                else {
                    continue;
                }
            } else {
                // console.log('I failed to recognize the thing');
                stopBool = true;
                continue;
            }
        }
    }

    // const active = 'active';

    const [active, setActive] = React.useState('active');

    const [showExpl, setShowExpl] = React.useState(false);

    let beginMap = new Map();
    props.contents.map(contentitem =>(
        beginMap.set(contentitem, getProgress(contentitem))
    ));

    const [map, setMap] = React.useState(beginMap);

    var attribute = 'active'+"moduleitem";

    if (props.isMobile==='medium') {
        attribute = "mobile"+attribute;
    }

    var teacherMode = props.teacherMode;

    function updateMap(key, value) {
        var newMap = new Map(map);
        newMap.set(key, value);
        setMap(newMap);
    }

    function areItemsAllComplete() {
        for (const v of map.values()) {
            if (!v) {
                return false;
            }
        }
        return true;
    }

    if (teacherMode) {
        attribute+="teacher";
    }

    var addCourseItemItem = (<div />);
    if (teacherMode) {
        addCourseItemItem = (
            <AddModuleContentItemItem
                varkStatus={props.varkStatus}
                moduleTitle={props.name}
                activeCourse={props.activeCourse}
                modules={props.modules}
                firebase={props.firebase}
            />
        );
    }

    var renameDisplay = (<div />);
    if (teacherMode) {
        renameDisplay = (
            <RenameModule
                internal={props.name}
                moduleTitle={props.name}
                activeCourse={props.activeCourse}
                modules={props.modules}
                firebase = {props.firebase}
            />
        );
    }

    var deleteDisplay = (<div />);
    if (teacherMode) {
        deleteDisplay = (
            <DeleteModule
                internal={props.name}
                moduleTitle={props.name}
                activeCourse={props.activeCourse}
                modules={props.modules}
                firebase = {props.firebase}
            />
        );
    }

    var topbar = (
        <div className="moduletitle" >
            <div className={("normal")}>
                <div className="bisplitbetween">
                    <div>
                        {props.name} 
                        {props.isMobile==='medium' ? null : <span class="collapsetext" onClick={active==='active' ? () => setActive('inactive') : () => setActive('active')}>{active==='active' ? "(collapse)" : "(expand)"}</span>}
                        {props.isMobile==='medium' ? null : (active==='active' ? <div className="tinyorangebreak" /> : null)}
                    </div>
                    <div className="bisplitbetweenright">
                        {/* <div className="expltext" onMouseOver={() => setShowExpl(true)} onMouseOut={() => setShowExpl(false)}>{(showExpl) ? ('Mark as Complete') : ('( ? )')}</div> */}
                        {/* <Line percent={progresspercentage+''} strokeWidth="4" strokeColor="#3DBB9F" /> */}
                    </div>
                </div>
            </div>
        </div>
    );
    if (teacherMode) {
        topbar = (
            <div className="titlemodulecontentitem" >
                <div className="editflex" >
                    <div className="editflextext">
                        {props.name}
                    </div>
                    <div className="editflexicon">
                        {renameDisplay}
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        {deleteDisplay}
                    </div>
                </div>
            </div>
        );
    }

    let evenodd = [];
    let cnt;
    let boolVal = false;
    for (cnt in props.contents) {
        if (props.contents[cnt]==='DELETE THAT YOU HOT DOG') {
            evenodd.push(boolVal);
            continue;
        }
        evenodd.push(boolVal);
        boolVal = !boolVal;
    }

    //evenodd[props.contents.indexOf(contentitem)]
    return (
        <div>
            <div className={attribute} >
                {topbar}
                <div className="modulecontents">
                    {(active==="active") ? (props.contents.map(
                        contentitem =>
                        (props.varkMode==="All" || props.varkMode===props.vark[props.contents.indexOf(contentitem)])
                        ? (
                            (contentitem!=="DELETE THAT YOU HOT DOG") ?
                            (<ModuleContentItem
                                goNext={goNext}
                                goBack={goBack}
                                updateMap={updateMap}
                                varkStatus={props.varkStatus}
                                instantOpen={props.instantOpen}
                                name={contentitem}
                                vark={(props.showVark) ? (props.vark[props.contents.indexOf(contentitem)]) : ("")}
                                internal={props.internals[props.contents.indexOf(contentitem)]}
                                addVarkClicks={props.addVarkClicks}
                                teacherMode={props.teacherMode}
                                moduleTitle={props.name}
                                activeCourse={props.activeCourse}
                                modules={props.modules}
                                firebase={props.firebase}
                                evenodd={evenodd[props.contents.indexOf(contentitem)]}
                                isMobile={props.isMobile}                         
                            />) : (null)
                        )
                        :
                        (<div />)
                    )) : (null)}
                    {(active==="active") ? (addCourseItemItem) : (null)}
                </div>
            </div>
        </div>
    );
}

//DOC: Component: Renders an edit course panel inside the course tab for teachers
//Input: activeCourse, handleSubmit, courseDescription
//Output: JSXElement
function EditCourseDescription(props) {
    function handleChangeArea(event) {
        setareavalue(event.target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();
        props.handleSubmit(areavalue, props.activeCourse);
    }

    const [areavalue, setareavalue] = React.useState(props.courseDescription);
    let areacharCount = 300-areavalue.length;

    return (
        <div className="linearmanagecontent">
            <br />
            <p className="infosectionheader">
                <b>Edit Course Description</b>
            </p>
            <div>
                <label>
                    <br />
                    <textarea className="textarea" type="text" value={areavalue} onChange={handleChangeArea} rows="5" cols="70"/>
                </label>
                <p className="reallysmallparagraph">{areacharCount} characters remaining</p>
                
                <form onSubmit={handleSubmit}>             
                    <input type="submit" value={("Submit")} />
                </form>
                <br />
            </div>            
        </div>
    );
}

//DOC: Component: Displays the entire VARK Profile.
//Input: Vcnt, Acnt, Rcnt, Kcnt
//Output: JSXElement
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
                        title: 'Video',
                        value: props.Vcnt,
                    },
                    {
                        color: 'blue',
                        title: 'Audio',
                        value: props.Acnt,
                    },
                    {
                        color: 'green',
                        title: 'Document',
                        value: props.Rcnt,
                    },
                    {
                        color: 'purple',
                        title: 'Assessment',
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

//DOC: Component: Allows the user to filter which VARK-type of items to display.
//Input: passState, default
//Output: JSXElement
class Select extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    state = {
      options: [
        {
            name: this.props.default,
            value: "All",
        },
        {
            name: 'Video',
            value: 'V',
        },
        {
            name: 'Audio',
            value: 'A',
        },
        {
            name: 'Document',
            value: 'R',
        },
        {
            name: 'Assessment',
            value: 'K',
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
          <div className="varkfilter">
            <React.Fragment>
                <select name="search_categories" id="search_categories" onChange={this.handleChange} value={value}>
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


//DOC: Component: Allows the user to select a subject for their course
//Input: passState
//Output: JSXElement
class SelectSubject extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    state = {
        options: [
            {
                name: "Select a Subject",
                value: "None",
            },
            {
                name: 'Anthropology',
                value: 'Anthropology',
            },
            {
                name: 'Astronomy',
                value: 'Astronomy',
            },
            {
                name: 'Biology',
                value: 'Biology',
            },
            {
                name: 'Chemistry',
                value: 'Chemistry',
            },
            {
                name: 'Computer Science',
                value: 'Computer Science'
            },
            {
                name: 'English',
                value: 'English',
            },
            {
                name: 'Economics',
                value: 'Economics',
            },
            {
                name: 'Earth Sciences',
                value: 'Earth Sciences',
            },
            {
                name: 'Environmental Sciences',
                value: 'Environmental Sciences',
            },
            {
                name: 'Government',
                value: 'Government',
            },
            {
                name: 'History',
                value: 'History'
            },
            {
                name: 'Language Other Than English',
                value: 'Language Other Than English',
            },
            {
                name: 'Linguistics',
                value: 'Linguistics',
            },
            {
                name: 'Mathematics',
                value: 'Mathematics',
            },
            {
                name: 'Music',
                value: 'Music',
            },
            {
                name: 'Philosophy',
                value: 'Philosophy',
            },
            {
                name: 'Physics',
                value: 'Physics',
            },
            {
                name: 'Performing Arts',
                value: 'Performing Arts',
            },
            {
                name: 'Psychology',
                value: 'Psychology',
            },
            {
                name: 'Sociology',
                value: 'Sociology',
            },
            {
                name: 'Statistics',
                value: 'Statistics',
            },
            {
                name: 'Other',
                value: 'Other',
            }
          ],
      value: '?',
    };

    handleChange = (event) => {
      this.props.passState(event.target.value);
      this.setState({ value: event.target.value });
      event.preventDefault();
    };

    render() {
      const { options, value } = this.state;

      return (
          <div className="varkfilter">
            <React.Fragment>
                <select name="search_categories" id="search_categories" onChange={this.handleChange} value={value}>
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

//DOC: Component: A simple element that renders a break across the Mainpanel page
//Input: None
//Output: JSXElement
function SectionBreak() {
    return (
        <div className="maxwidth">
            <hr />
        </div>
    );
}

//DOC: Component: The entire right half of the screen, which can change its display depending on whether we want to show the contents of the course, with all the modules; or the screen that lets us enroll in a course; or the screen that lets us create a course.
//Input: firebase, activeCourse, modules, removeCourse, addVarkClicks, email, instantOpen, isMobile, changeActiveCourse, showTour, description, instantOpen
//Output: JSXElement
class MainPanel extends React.Component {
    constructor (props){
        super(props);
        
        this.handleRemove = this.handleRemove.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.filterCallback = this.filterCallback.bind(this);
        this.getCurrentUserEmail = this.getCurrentUserEmail.bind(this);
        this.getTeacherEmail = this.getTeacherEmail.bind(this);
        this.getTeacherName = this.getTeacherName.bind(this);
        this.codeToName = this.codeToName.bind(this);
        this.isVarkEnabled = this.isVarkEnabled.bind(this);
        this.getStudentNameFromEmail = this.getStudentNameFromEmail.bind(this);
        this.toggleVisibility = this.toggleVisibility.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDeletion = this.handleDeletion.bind(this);
        this.isVisible = this.isVisible.bind(this);
        this.updateVisibility = this.updateVisibility.bind(this);
        this.showTour = this.showTour.bind(this);
        this.actuallyDelete = this.actuallyDelete.bind(this);
        this.getListOfTeacherEmails = this.getListOfTeacherEmails.bind(this);
        this.getListOfTeacherNames = this.getListOfTeacherNames.bind(this);
        this.addTeacher = this.addTeacher.bind(this);
        this.removeTeacher = this.removeTeacher.bind(this);
        this.handleteacheruidchange = this.handleteacheruidchange.bind(this);
        this.handlestudentuidchange = this.handlestudentuidchange.bind(this);
        this.enrollTeacher = this.enrollTeacher.bind(this);

        this.state = {
            varkselection: "All",
            copied: false,
            showVark: this.isVarkEnabled(),
            visible: this.isVisible(),
            teacheruid: '',
            studentuid: '',
            displayexpl: false,
            displayPayButton: true,
        };
    }

    onStripeUpdate(e) {
        this.stripeHandler.open({
            name: 'Koin Premium',
            description: 'Unlimited calling and course creation',
            panelLabel: 'Subscribe Now',
        });
        e.preventDefault();
    }

    showTour() {
        this.props.showTour();
    }

    updateVisibility() {
        if (this.state.visible !== this.isVisible()) {
            this.setState({
                visible: this.isVisible(),
            });
        }
    }

    isVisible() {
        let publicCourses = (getPublicCourses(this.props.firebase));
        let cnt = 0;
        for (cnt in publicCourses) {
            let course = publicCourses[cnt];
            if (course.joinCode===this.props.activeCourse) {
                return true;
            }
        }
        return false;
    }

    handleSubmit(newDescription, activeCourse) { 
        var courseID;
        const allCourses = secureStorage.getItem('courses');
            for (let i = 0, len = allCourses.length; i < len; ++i) {
                var course = allCourses[i];
                if (course.nclasscode === activeCourse) {
                    courseID = course.appID;
                }
            }
        this.props.firebase.course(courseID).update({
            courseDescription: newDescription,
        })
        this.setState({
            description: newDescription,
        }); 
    
    }

    getSubject() {
        //the currently active course is this.props.activeCourse
        const allCourses = secureStorage.getItem('courses');
            for (let i = 0, len = allCourses.length; i < len; ++i) {
                var course = allCourses[i];
                if (course.nclasscode === this.props.activeCourse) {
                    return course.osubject;
                }
            }
        
        return "Yeeted Course Type";
    }

    handleRemove(event) {
        ModalManager.open(
            <Modal
                className="modaldialog"
                effect={Effect.ScaleUp}
                style= {{
                    content: {
                        width: '20.5em',
                        height: 'fit-content',
                        borderRadius: '25px',
                    }
                }}
            >
                <div className="centerbuttons">
                    <center>
                    <div className="bisplit">
                        <button className="cancelremovecoursebutton" onClick={() => {ModalManager.close();}}>
                            Cancel
                        </button>
                        <button className="removecoursebutton" onClick={() => {ModalManager.close(); this.props.removeCourse(this.props.activeCourse);}}>
                            Confirm Unenroll
                        </button>
                    </div>
                    </center>
                </div>
            </Modal>
        );
    }

    handleFilter(theState) {
        this.setState({varkselection: theState}, () => this.filterCallback());
    }

    filterCallback() {
        this.render();
    }

    getTeacherEmail(nameOfCourse) { // use code here instead
        const allCourses = secureStorage.getItem('courses');
        var teacher;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === nameOfCourse) {
                teacher = course.nteacher;
            }
        }
        return teacher;
    }

    getTeacherName(teacherEmail) {
        const allCourses = secureStorage.getItem('courses');
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                return course.nteacherName;
            }
        }
        return "Example Teacher Name";
    }

    getCurrentUserEmail() {
        const usr = secureStorage.getItem('authUser');
        const curEmail = Object.values(usr).slice()[1]; // returns string of current user's email
        return curEmail;
    }

    codeToName(code) {
        const allCourses = secureStorage.getItem('courses');
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === code) {
                return course.CourseName;
            }
        }
    }

    getListOfStudents() {
        // This will return the list of students emails
        const allCourses = secureStorage.getItem('courses');
        var stulist;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                stulist = course.ostudentList; // identifies current course child name to update
                break;
            }
        }
        var stukeys = [];
        if ( stulist != undefined) {
            for (let [key, value] of Object.entries(stulist)) {
                if (key !== "exampleStudentEmail") {
                    if (value !== '') {
                        key = key.replace(/EMAILDOT/g, ".");
                        stukeys.push(key);
                    }
                }
            }
        }
        
        return stukeys; 
    }

    getListOfStudentKicks() {
        
        // This function needs to return an array of all the values (all the true/false strings)
        const allCourses = secureStorage.getItem('courses');
        var stulist;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                stulist = course.ostudentList; // identifies current course child name to update
                break;
            }
        }
        var stu = [];
        if ( stulist != undefined) {
            for (let [key, value] of Object.entries(stulist)) {
                if (key !== "exampleStudentEmail")
                    if (value !== '') stu.push(JSON.stringify(value));
                    
            }
        }
        
        return stu; 
    }

    setStudentKick(studentEmail, kickStatus) { //kickStatus is a string, studentEmail is a string
        studentEmail = studentEmail.replace(/\./g,'EMAILDOT');
        // Continuation of the in getListOfStudents:
        // This function needs to set the kickStatus(value) of the studentEmail(key) to what's been passed into this function
        const allCourses = secureStorage.getItem('courses');
        var stulist;
        var courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                stulist = course.ostudentList; // identifies current course child name to update
                courseID = course.appID;
                break;
            }
        }
        if ( stulist != undefined) {
            for (let key in stulist) {
                
                if (JSON.stringify(key).replace(/\"/g, '') == studentEmail){ 
                    
                    var newkick;
                    if (kickStatus === "false") 
                        newkick = false;
                    else
                        newkick = true;
                    stulist[studentEmail] = newkick;
                    
                    this.props.firebase.courses().child(courseID).update({
                        ostudentList: stulist,
                    });
                }
            }
        }
    }

    handleDeletion() { 
        ModalManager.open(
            <Modal
                className="modaldialog"
                effect={Effect.ScaleUp}
                style= {{
                    content: {
                        width: 'fit-content',
                        height: 'fit-content',
                        borderRadius: '10px',
                    }
                }}
            >
                <div className="centerbuttons">
                    <h3>You cannot undo this action!</h3>
                    <p className="dividertext"><br /><br /></p>
                    <div className="bisplit">
                        <button className="cancelremovecoursebutton" onClick={() => {ModalManager.close();}}>
                            Cancel
                        </button>
                        <button className="removecoursebutton" onClick={() => {ModalManager.close(); this.actuallyDelete();}}>
                            Confirm Course Deletion
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }

    actuallyDelete() {
        var courseID;
        const allCourses = secureStorage.getItem('courses');
            for (let i = 0, len = allCourses.length; i < len; ++i) {
                var course = allCourses[i];
                if (course.nclasscode === this.props.activeCourse) {
                    courseID = course.appID;
                }
            }
        this.props.firebase.course(courseID).update({
            CourseName: "DELETE THAT YOU HOT DOG",
        });
        this.props.changeActiveCourse("none");
    }

    toggleVisibility() {
        var courseID;
        const allCourses = secureStorage.getItem('courses');
            for (let i = 0, len = allCourses.length; i < len; ++i) {
                var course = allCourses[i];
                if (course.nclasscode === this.props.activeCourse) {
                    courseID = course.appID;
                }
            }
        var w;
        if ( !this.state.visible) w = "public";
        else w = "private";
        this.props.firebase.course(courseID).update({
            visibility: w,
        });
        this.setState({
            visible: !this.state.visible,
        });
    }

    getStudentNameFromEmail(email) { 
        const allCourses = secureStorage.getItem('courses');
            for (let i = 0, len = allCourses.length; i < len; ++i) {
                var course = allCourses[i];
                var uids;
                if (course.nclasscode === this.props.activeCourse) {
                    uids = course.studentUID;
                    break;
                }
            }
            const newemail = email.replace(/\./g,'EMAILDOT');
            const id = uids[newemail];
            var stuname;
            this.props.firebase.user(id).on('value', snapshot => {
                stuname = snapshot.val().username;
            })
            if ( stuname != null) return stuname;
        return "Name Unavailable";
    }

    isVarkEnabled() {
        const allCourses = secureStorage.getItem('courses');
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                return course.varkEnabled;
            }
        }
    }

    onChangeCheckbox(varkStatus) {
        // changes whether the course shows VARK or no
        const allCourses = secureStorage.getItem('courses');
        var courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                courseID = course.appID; // identifies current course child name to update
                break;
            }
        }
        this.props.firebase.courses().child(courseID).update({
            varkEnabled: varkStatus,
        });

        //this.setState({ [event.target.name]: event.target.checked }); //Keep this line of code
    };

    // getListOfTeacherNames() {
    //     // RETURN AN ARRAY OF TEACHER NAMES FROM DB
    //     //in firebase, the teachers are stored in one attribute as a comma separated string. for instance: nteacher: "dominum15@outlook.com, bob@gmail.com, joe@gmail.com"
    //     //just return an array version of this list
    //     //this.props.firebase contains firebase if you need that (but you can probably just rely on localstorage)
    //     return ["Daniel Wei", "Ryan Ma"];
    // }

    getListOfTeacherNames() {
        const allCourses = secureStorage.getItem('courses');
        var teacher;
        if (this.props.activeCourse=='none') return [];
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                teacher = course.nteacherName;
            }
        }
        if ((teacher.charAt(teacher.length-1)+'')===',') {
            teacher = teacher.substring(0, teacher.length);
        }
        let tlist = teacher.split(',').filter(x => x);
        return tlist;
    }

    // getListOfTeacherEmails() {
    //     // RETURN AN ARRAY OF TEACHER EMAILS FROM DB
    //     //in firebase, the teachers are stored in one attribute as a comma separated string. for instance: nteacher: "dominum15@outlook.com, bob@gmail.com, joe@gmail.com"
    //     //just return an array version of this list
    //     //this.props.firebase contains firebase if you need that (but you can probably just rely on localstorage)
    //     return ["dominum15@outlook.com", "goblinrum@gmail.com"];
    // }

    getListOfTeacherEmails() {
        const allCourses = secureStorage.getItem('courses');
        var teacher;
        if (this.props.activeCourse=='none') return [];
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                teacher = course.nteacher;
            }
        }
        let tlist = teacher.split(',').filter(x => x);
	    return tlist;
    }
    // addTeacher(uid) {
    //     // TURN THE UID INTO AN EMAIL USING getTeacherEmailFromUID, AND THEN ADD THE EMAIL TO THE END OF THE FIREBASE STRING, SEPARATED BY COMMAS
    //     //this.props.firebase contains firebase if you need that
    //     //if no teacher found, display an alert
    //     alert('Added teacher ' + uid);
    // }

    // enrollTeacher(userUID, courseToEnroll) {
    //     // ENROLL THE TEACHER WITH THAT USERUID IN THE COURSETOENROLL (THATS THE COURSE CODE)
    //     //To help: this.props.firebase contains firebase
    // }

    enrollTeacher(uid, courseCode) {
	
        this.props.firebase.user(uid).on('value', snapshot => {
                    let courses = snapshot.val().courses;
            let email = snapshot.val().email;
            if (!courses.includes(courseCode)) courses.push(courseCode);
            this.props.firebase.user(uid).update({ courses: courses,});
            const allCourses = secureStorage.getItem('courses');
                    var courseID;
                    for (let i = 0, len = allCourses.length; i < len; ++i) {
                        var course = allCourses[i];
                        var stuemails;
                        var stuIDs;
                        if (course.nclasscode === courseCode) {
                            courseID = course.appID; // identifies current course child name to update
                            stuemails = course.ostudentList;
                            stuIDs = course.studentUID;
                            const newemail = email.replace(/\./g,'EMAILDOT');
                            stuemails[newemail] = true;
                            stuIDs[newemail] = uid;
                            this.props.firebase.courses().child(courseID).update({
                                ostudentList: stuemails,
                                studentUID: stuIDs,
                            });
                            break;
                        }
                    }
            });
    
            
    
        this.props.firebase.onAuthUserListener(
                authUser => {
                    secureStorage.setItem('authUser', authUser);
                },
                () => { // callback
                },
            );	
    }

    addTeacher(uid) {
        this.setState({
            teacheruid: '',
        })

        const allCourses = secureStorage.getItem('courses');
        let teacher;
	    let tname;
	    let courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                    teacher = course.nteacher;
		            tname = course.nteacherName;
		            courseID = course.appID;
            }
        }
	
	
		this.props.firebase.user(uid).on('value', snapshot => {
            if (snapshot.val() == null) alert ("User does not exist!")
            else this.props.firebase.sub(uid).on('value', snapshot2 => {
                if (snapshot2.val().time === 1000000) alert('This user is not a Premium user yet!')
                else {
                    let name = snapshot.val().username;
			        let email = snapshot.val().email;
                    if (!teacher.includes(email)){
                        teacher += ("," + email);
                        tname += ("," + name);
                    }
                
                    
			        this.props.firebase.course(courseID).update({
				        nteacher: teacher,
				        nteacherName: tname,
                    });
                    this.enrollTeacher(uid, this.props.activeCourse);
                }
            })

        });
        
            
	}

    // addTeacher(uid) {
    //     const allCourses = secureStorage.getItem('courses');
    //     let teacher;
    //     let tname;
    //     let courseID;
    //         for (let i = 0, len = allCourses.length; i < len; ++i) {
    //             var course = allCourses[i];
    //             if (course.nclasscode === this.props.activeCourse) {
    //                 teacher = course.nteacher;
    //         tname = course.nteacherName;
    //         courseID = course.appID;
    //             }
    //         }
    //     this.props.firebase.user(uid).on('value', snapshot => {
    //                 let name = snapshot.val().username;
    //         let email = snapshot.val().email;
    //         teacher += ("," + email);
    //         tname += ("," + name);
    //         this.props.firebase.course(courseID).update({
    //             nteacher: teacher,
    //             nteacherName: tname,
    //         });
    //             });

    //     this.enrollTeacher(uid, this.props.activeCourse);
	  
    // }

    forceAddStudent(uid) {
        this.setState({
            studentuid: '',
        })
        this.enrollTeacher(uid, this.props.activeCourse);
    }

    removeTeacher(email) {
          // REMOVE THIS EMAIL FROM THE FIREBASE STRING, AS WELL AS THE APPROPRIATE COMMA
        //this.props.firebase contains firebase if you need that
        const allCourses = secureStorage.getItem('courses');
        let names = this.getListOfTeacherNames();
        let emails = this.getListOfTeacherEmails();
        let resEmail = '';
        let resName = '';
        for (let i = 0; i < names.length; i++) {
            if (email !== emails[i]) {
                    resEmail += emails[i] + ",";
                    resName += names[i] + ",";
            }
        }
        
        let courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
                var course = allCourses[i];
                if (course.nclasscode === this.props.activeCourse) {
                    courseID = course.appID;
                }
            }

        this.props.firebase.course(courseID).update({
            nteacher: resEmail,
            nteacherName: resName,
        });		
    }

    handleteacheruidchange(event) {
        let newString = event.target.value;
        this.setState({teacheruid: newString});  
    }

    handlestudentuidchange(event) {
        let newString = event.target.value;
        this.setState({studentuid: newString}); 
    }

    getStudentProgress(studentEmail, firebase, activeCourse) {
        // RETURN STUDENT PROGRESS AS 3D ARRAY
        const allCourses = secureStorage.getItem('courses');
        let students;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
                var course = allCourses[i];
                if (course.nclasscode === activeCourse) {
                    students = course.studentUID;
                }
        }
        const newemail = studentEmail.replace(/\./g,'EMAILDOT');
        const uid = students[newemail];
        let ret = [];
        firebase.user(uid).child('vcourseprogress').child(activeCourse).on('value', snapshot => {
            if (snapshot.val() == null ) console.log('No progress for this student'); // will return null if student has no progress
            else {
                for (let [key, value] of Object.entries(snapshot.val())) {
                    let moduleList = [];
                    for (let [key1, value1] of Object.entries(value)){
                        moduleList[key1] = Object.values(value1);
                    }
                    ret[key] = moduleList;
                }
            }
        });
        
        if (ret != null ) return ret;
        else return 'wait for return';
    }

    render() { //active: "" means the module is minimized, "active" means its expanded
        const { stripeLoading, loading } = this.state;
        var showModules = true;
        if (typeof this.props.modules === 'undefined') {
            showModules = false;
        }
        var showVarkProfile = true;

        var listOfStudents = this.getListOfStudents();
        var listOfStudentKicks = this.getListOfStudentKicks();

        var listOfTeacherEmails = this.getListOfTeacherEmails();
        var listOfTeacherNames = this.getListOfTeacherNames();

        var varkStatus = this.isVarkEnabled();

        var courseid = (this.props.activeCourse);

        var teacherMode = (this.getTeacherEmail(this.props.activeCourse)+'').includes(this.getCurrentUserEmail());

        var welcomeMsg;
        var unenroll;
        var joinCode;
        var filter;
        var teacherReveal;
        var subjectTag;
        var showRest = true;
        var teacherEmail = this.getTeacherEmail(this.props.activeCourse);
        if (this.props.activeCourse==="none") {
            welcomeMsg="No course selected.";
            // welcomeMsg = (
            //     <>
            //         No course selected.
            //         <br /><br />
            //         {/* <br /><br /><br />
            //         <p className="sharetext">Enjoying Modulus?
            //         Consider sharing!</p>
            //         <div className="bisplit">
            //             <div className="facebookicon"><iframe src="https://www.facebook.com/plugins/share_button.php?href=https%3A%2F%2Fwww.modulusedu.com%2F&layout=button&size=large&width=77&height=28&appId" width="77" height="28" style={{overflow:"hidden"}} scrolling="no" frameborder="0" allowTransparency="true" allow="encrypted-media"></iframe></div>
            //             <a href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" data-size="large" data-text="I found this really cool course sharing platform! Check it out!" data-url="https://www.modulusedu.com/" data-show-count="false"><img height="38px" src={twittericon} className="twittericon" /></a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
            //         </div> */}
            //     </>
            // );
            teacherReveal = "";
            joinCode = (
                null
            );
            unenroll = (
                null
            );
            showVarkProfile = false;
            filter = (
                null
            );
            showRest = false;
        }
        else {
            welcomeMsg = this.codeToName(this.props.activeCourse).substring(4); //CodeToName
            let subjectName=this.getSubject();
            subjectTag = (
                <div className="subjecttag">
                    {subjectName}
                </div>
            );
            let teachermsg = this.getTeacherName(this.getTeacherEmail(this.props.activeCourse));
            teacherReveal = teachermsg;
            unenroll = (
                <div className="linearmanagecontent">
                    <div className="removecoursebutton" onClick={this.handleRemove}>
                        Unenroll
                    </div>
                </div>
            );
            filter = (varkStatus) ? (<Select passState={this.handleFilter} default={"Show all content types"}/>) : (null);
            if (teacherMode) {
                joinCode = (
                    <div className="teachernotice">
                        <p><b>Join Course ID:&nbsp;&nbsp;&nbsp;</b> {courseid}</p>
                    </div>
                );
                unenroll = (
                    null
                );
            }
            if (welcomeMsg === "Welcome to Welcome") {
                welcomeMsg = "Select or add a course on the left to get started."
                showModules = false;
                unenroll = (
                    null
                );
                joinCode = (
                    null
                );
                showVarkProfile = false;
                showRest = false;
            }
        }

        var addModuleItem = (null);
        if (teacherMode) {
            addModuleItem = (
                <AddModuleItem
                    internal=""
                    activeCourse={this.props.activeCourse}
                    modules={this.props.modules}
                    firebase={this.props.firebase}
                    changeActiveCourse={this.props.changeActiveCourse}
                />
            );
        }

        var viewModuleList = (null);
        var editModuleList = (null);
        if (showModules) {
            viewModuleList = (
                <div className="modulelist">
                    <br/>
                    {
                        Object.values(this.props.modules).map(module =>
                            (module.title!=="DELETE THAT YOU HOT DOG") ? 
                            (<><ModuleItem
                                isMobile={this.props.isMobile}
                                varkStatus={varkStatus}
                                instantOpen={this.props.instantOpen}
                                name={module.title}
                                contents={module.contents}
                                vark={module.vark}
                                internals={module.internals}
                                active=""
                                addVarkClicks={this.props.addVarkClicks}
                                varkMode={this.state.varkselection}
                                teacherMode={false}
                                activeCourse={this.props.activeCourse}
                                modules={this.props.modules}
                                firebase={this.props.firebase}
                                showVark={varkStatus}
                            /></>) : (null)
                        )
                    }
                </div>
            );
            editModuleList = (
                <div className="modulelist">
                    {
                        Object.values(this.props.modules).map(module =>
                            (module.title!=="DELETE THAT YOU HOT DOG") ? 
                            (<ModuleItem
                                isMobile={this.props.isMobile}
                                varkStatus={varkStatus}
                                instantOpen={this.props.instantOpen}
                                name={module.title}
                                contents={module.contents}
                                vark={module.vark}
                                internals={module.internals}
                                active=""
                                addVarkClicks={this.props.addVarkClicks}
                                varkMode={this.state.varkselection}
                                teacherMode={true}
                                activeCourse={this.props.activeCourse}
                                modules={this.props.modules}
                                firebase={this.props.firebase}
                                showVark={varkStatus}
                            />) : (null)
                        )
                    }
                    {addModuleItem}
                </div>
            );
        }

        //counts the number of each vark item in modules
        // var Vcnt = 0;
        // var Acnt = 0;
        // var Rcnt = 0;
        // var Kcnt = 0;
        // var module;
        // var varkLetter;
        // for (module of this.props.modules) {
        //     for (varkLetter of module.vark) {
        //         if (varkLetter==="V") {
        //             Vcnt++;
        //         }
        //         if (varkLetter==="A") {
        //             Acnt++;
        //         }
        //         if (varkLetter==="R") {
        //             Rcnt++;
        //         }
        //         if (varkLetter==="K") {
        //             Kcnt++;
        //         }
        //     }
        // }

        // var varkProfile = (<div />);
        // if (showVarkProfile) {
        //     varkProfile = (
        //         <VarkProfile
        //             Vcnt={Vcnt}
        //             Acnt={Acnt}
        //             Rcnt={Rcnt}
        //             Kcnt={Kcnt}
        //         />
        //     );
        // }

        var mailtostring = "mailto:" + teacherEmail;



        var contactTeacher = (teacherMode) ? (null) : (
            <div className="linearmanagecontent">
                <p className="infosectionheader">
                    <b>Course Owner(s):</b> &nbsp;&nbsp; {teacherReveal}
                </p>
                <p className="smallparagraph">
                    <b>Email(s):</b> &nbsp;&nbsp;{teacherEmail}<br /><br />
                </p>
                {/* <a className="smalllinkbutton" href={mailtostring}>Contact</a> */}
            </div>
        );

        var viewClassCode = (teacherMode) ? (
            <div className="linearmanagecontent">
                    <br />
                    <p className="infosectionheader">
                        <b>Course Join Code</b>
                    </p>
                    <p className="mono">
                        {this.props.activeCourse}
                    </p>
            </div>
        ) : (null);

        var joinClassCode = (teacherMode) ? (
            <>
            <div className="linearmanagecontent">
                    <br />
                    <p className="infosectionheader">
                        <b>Share your Course Join Code</b>
                    </p>
                    <p className="smallparagraph">
                        Share your course's join code with your intended students.<br />
                        They can enroll in your course with this code.
                        <br /><br /><br />
                        The code for this course is:
                    </p>
                    <p className="mono">
                        {this.props.activeCourse}
                    </p>
                    <CopyToClipboard text={this.props.activeCourse} onCopy={() => this.setState({copied: true})}>
                        <a className="smalllinkbutton">{(this.state.copied) ? ("Copied!") : ("Copy to Clipboard")}</a>
                    </CopyToClipboard>
                    <br />
            </div>
            <br />
            <SectionBreak />
            <br />
            <div className="linearmanagecontent">
                <br />
                <p className="infosectionheader">
                    <b>Or, directly enroll a Student</b>
                </p>
                <p className="smallparagraph">Enter the student's UID (Unique Identifier) below.<br />The UID can be found in each user's account page.</p><br />
                <label>
                    <input type="text" value={this.state.studentuid} onChange={this.handlestudentuidchange} />   
                    <br /><br />
                    <form onSubmit={(event) => {event.preventDefault(); this.forceAddStudent(this.state.studentuid);}}>   
                        <input id="teachersubmitbutton" type="submit" value={'Add Student'} />
                    </form>
                </label> 
                <br /><br />
            </div>
            </>
        ) : (null);

        let theBool = false;
        let shade = [];
        let counter;
        for (counter in listOfStudents) {
            shade.push((theBool) ? ("shadedstudentrow") : ("studentrow"));
            theBool = !theBool;
        }

        var manageStudents = (teacherMode) ? (
            <div className="linearmanagecontent">
                <h3>Manage Students</h3>
                <p className="smallparagraph">By default, all enrolled students can view your course.<br />
                You can block individuals by flipping their switch off.<br /><br />Clicking on a student's name will allow you to see their progress in the course.</p><br />
                <div className="masterstudentrow">
                    <div className="studentcell"><p className="studentsmallparagraph"><b>Name</b></p></div>
                    <div className="studentcell"><p className="studentsmallparagraph"><b>Email</b></p></div>
                    <div className="studentcell"><p className="studentsmallparagraph"><b>Allowed</b></p></div>
                </div>
                {(listOfStudents.length<=1) ? (
                    <p className="smallparagraph">You don't have any students yet.</p>
                ) : listOfStudents.map(
                    student => (student===this.props.email) ? (null) : (
                        (listOfStudentKicks[listOfStudents.indexOf(student)]==="false") ? (
                            <div className={shade[listOfStudents.indexOf(student)]}>
                                <div className="studentcell" onMouseOver={() => this.setState({displayexpl: true})} onMouseOut={() => this.setState({displayexpl: false})} onClick={() => ModalManager.open(<ProgressModal modules={this.props.modules} firebase={this.props.firebase} activeCourse={this.props.activeCourse} studentName={this.getStudentNameFromEmail(student)} getStudentProgress={this.getStudentProgress} studentEmail={student} onRequestClose={() => true}/>)}>
                                    <p className="studentsmallparagraph">
                                        {/* {(this.state.displayexpl) ? ('Click to see my progress') : (this.getStudentNameFromEmail(student))} */}
                                        {(this.getStudentNameFromEmail(student))}
                                    </p>
                                </div>
                                <div className="studentcell">
                                    <p className="studentsmallparagraph">{student}</p>
                                </div>
                                <div className="studentcell">
                                    <label className="switch">
                                        <input
                                            name="studentswitch"
                                            type="checkbox"
                                            checked={false}
                                            onChange={() => this.setStudentKick(student, "true")}
                                        />
                                        <span class="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className={shade[listOfStudents.indexOf(student)]}>
                                <div className="studentcell" onMouseOver={() => this.setState({displayexpl: true})} onMouseOut={() => this.setState({displayexpl: false})}  onClick={() => ModalManager.open(<ProgressModal modules={this.props.modules} firebase={this.props.firebase} activeCourse={this.props.activeCourse} studentName={this.getStudentNameFromEmail(student)} getStudentProgress={this.getStudentProgress} studentEmail={student} onRequestClose={() => true}/>)}>
                                    <p className="studentsmallparagraph">
                                        {/* {(this.state.displayexpl) ? ('Click to see my progress') : (this.getStudentNameFromEmail(student))} */}
                                        {(this.getStudentNameFromEmail(student))}
                                    </p>
                                </div>
                                <div className="studentcell">
                                    <p className="studentsmallparagraph">{student}</p>
                                </div>
                                <div className="studentcell">
                                    
                                    <label className="switch">
                                        <input
                                            name="studentswitch"
                                            type="checkbox"
                                            checked={true}
                                            onChange={() => this.setStudentKick(student, "false")}
                                        />
                                        <span class="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        )
                    )
                )}
                <br /><br /><br />
            </div>
        ) : (null);


        var ModulesTab = (teacherMode) ? (<Tab><p className="tabtext">Preview as Student</p></Tab>) : (<Tab><p className="tabtext">Modules</p></Tab>);
        var EditModulesTab = (teacherMode) ? (<Tab><p className="tabtext">Edit Modules</p></Tab>) : (null);
        var OtherTab = (teacherMode) ? (<Tab onClick={() => window.dispatchEvent(new Event('resize'))}><p className="tabtext">Manage Students</p></Tab>) : (<Tab><p className="tabtext">Other</p></Tab>);
        var CourseInfoTab = (teacherMode) ? (<Tab onClick={this.updateVisibility}><p className="tabtext">Manage Teachers</p></Tab>) : (null);
        var TeacherInfoTab = (teacherMode) ? (<Tab><p className="tabtext">Other</p></Tab>) : (null);

        var ViewModulesPanel = (
            <div className="viewmodules">
                    {viewModuleList}
            </div>
        );

        var EditModulesPanel = (teacherMode) ? (
            <TabPanel>
                {filter}
                {editModuleList}
            </TabPanel>
        ) : (null);

        var CourseRosterPanel = (teacherMode) ? (
            <TabPanel>
                {joinClassCode}
                <br />
                <SectionBreak />
                <br />
                {manageStudents}
            </TabPanel>
        ) : (null);

        // var varkContent = null;
        // if (varkStatus && teacherMode) {
        //     varkContent = (
        //         <div className="varkcontent">
        //             <h3><br /> <br />Content Type Profile</h3> 
        //             <div>
        //                 <p>VARK is <b>Enabled</b></p>
        //                 <label className="switch">
        //                     <input
        //                         name="showVark"
        //                         type="checkbox"
        //                         checked={varkStatus}
        //                         onChange={(event) => this.onChangeCheckbox(event.target.checked)}
        //                     />
        //                     <span class="slider round"></span>
        //                 </label>
        //                 <br /><br /><br />
        //                 <hr />
        //             </div>
        //             <br /><br />
        //             <table className="offsetleft">
        //                 <tr>
        //                     <td>
        //                         {varkProfile}
        //                     </td>
        //                     <td>
        //                         <p className="smallparagraph" style={{color: "red"}}>Visual</p>
        //                         <p className="smallparagraph" style={{color: "blue"}}>Auditory</p>
        //                         <p className="smallparagraph" style={{color: "green"}}>Reading/Writing</p>
        //                         <p className="smallparagraph" style={{color: "purple"}}>Kinesthetic</p>
        //                     </td>
        //                 </tr>
        //             </table>
        //             <br /><br /><br />
        //         </div>
        //     );
        // } else if (!varkStatus && teacherMode) {
        //     varkContent = (
        //         <div className="varkcontent">
        //             <div className="managecontent">
        //                 <div>
        //                     <p>VARK is <b>Disabled</b></p>
        //                 </div>
        //                 <label className="switch">
        //                     <input
        //                         name="showVark"
        //                         type="checkbox"
        //                         checked={varkStatus}
        //                         onChange={(event) => this.onChangeCheckbox(event.target.checked)}
        //                     />
        //                     <span class="slider round"></span>
        //                 </label>
        //             </div>
        //             <br /><br /><br /><br />
        //         </div>
        //     );
        // } else if (varkStatus && !teacherMode) {
        //     varkContent = (
        //         <div className="managecontent">
        //             <center>
        //                 <h3><br /> <br />Course Content Type Profile</h3> 
        //                 <br /><br />
        //                 <table className="offsetleft">
        //                     <tr>
        //                         <td>
        //                             {varkProfile}
        //                         </td>
        //                         <td>
        //                             <p className="smallparagraph" style={{color: "red"}}>Video</p>
        //                             <p className="smallparagraph" style={{color: "blue"}}>Audio</p>
        //                             <p className="smallparagraph" style={{color: "green"}}>Document</p>
        //                             <p className="smallparagraph" style={{color: "purple"}}>Assessment</p>
        //                         </td>
        //                     </tr>
        //                 </table>
        //                 <br /><br /><br />
        //             </center>
        //         </div>
        //     );
        // } else if (!varkStatus && !teacherMode) {
        //     varkContent = null;
        // }
        let subjectName=this.getSubject();
        let courseDescription = (
            <div className="linearmanagecontent">
                <br />
                <p className="infosectionheader">
                    <b>Course Description</b>
                </p>
                <p className="smallparagraph">
                    {this.props.description}
                    <br />
                </p>
            </div>
        );

        let theBool2 = false;
        let shade2 = [];
        let counter2;
        for (counter2 in listOfTeacherEmails) {
            shade2.push((theBool2) ? ("shadedstudentrow") : ("studentrow"));
            theBool2 = !theBool2;
        }
        // console.log(listOfTeacherEmails);
        // console.log(listOfTeacherNames);
        let manageTeachers = (
            <div className="linearmanagecontent">
                <br />
                <h3>Add a Teacher</h3>
                <br />
                <p className="smallparagraph">Enter the teacher's UID (Unique Identifier) below.<br />The UID can be found in each user's account page.</p><br />
                <label>
                    <input type="text" value={this.state.teacheruid} onChange={this.handleteacheruidchange} />   
                    <br /><br />
                    <form onSubmit={(event) => {event.preventDefault(); this.addTeacher(this.state.teacheruid);}}>   
                        <input id="teachersubmitbutton" type="submit" value={'Add Teacher'} />
                    </form>
                </label> 
                <br /><br /><br />
                <SectionBreak />
                <br /><br />
                <h3>Manage Teachers</h3>
                <br />
                <div className="masterstudentrow">
                    <div className="studentcell"><p className="studentsmallparagraph"><b>Name</b></p></div>
                    <div className="studentcell"><p className="studentsmallparagraph"><b>Email</b></p></div>
                    <div className="studentcell"><p className="studentsmallparagraph"><b>Remove</b></p></div>
                </div>      
                {(listOfTeacherEmails.length<=1) ? (
                    <p className="smallparagraph">You don't have any other teachers yet.</p>
                ) : listOfTeacherEmails.map(
                    teacheremail => (teacheremail===this.props.email) ? (null) : (
                        <div className={shade2[listOfTeacherEmails.indexOf(teacheremail)]}>
                            <div className="studentcell">
                                <p className="studentsmallparagraph">{listOfTeacherNames[listOfTeacherEmails.indexOf(teacheremail)]}</p>
                            </div>
                            <div className="studentcell">
                                <p className="studentsmallparagraph">{teacheremail}</p>
                            </div>
                            <div className="studentcell">
                                <button className="removeteacherbutton" onClick={() => this.removeTeacher(teacheremail)}>
                                    &#x2715;
                                </button>
                            </div>
                        </div>
                    )
                )}
                <br /><br /><br />
            </div>
        )

        let viewCourseVisibility = (
            <div className="linearmanagecontent">
                <p className="infosectionheader">
                    <b>Course Visibility</b>
                </p>
                <p className="smallparagraph">
                    Public courses are free for anyone to join, and are published on our open library of courses.<br />
                    Students can only join private courses via the course code that you share with them.
                    <br />
                </p>
                <p className="smallparagraph">This course is <b>{(this.state.visible) ? ("public") : ("private")}</b></p>
                {/* <label className="switch">
                    <input
                        name="studentswitch"
                        type="checkbox"
                        checked={this.state.visible}
                        onChange={() => this.toggleVisibility()}
                    />
                    <span class="slider round"></span>
                </label>         
                <br />       */}
                <br /> 
            </div>
        );

        let deleteCourse = (
            <div className="linearmanagecontent">
                <div className="removecoursebutton" onClick={this.handleDeletion}>
                    Delete this Course
                </div>
            </div>            
        );

        var CourseInfoPanel = (teacherMode) ? (
            <TabPanel>
                {/* {viewClassCode}
                <br />
                <SectionBreak /> */}
                {/* <EditCourseDescription activeCourse={this.props.activeCourse} handleSubmit={this.handleSubmit} courseDescription={this.state.description} /> */}
                {/* {courseDescription}
                <br />
                <SectionBreak />
                <br />
                {viewCourseVisibility} */}
                {manageTeachers}
            </TabPanel>
        ) : (null);

        var TeacherInfoPanel = (teacherMode) ? (
            <TabPanel>
                <br />
                <p className="infosectionheader">
                    <b>Course Description</b>
                </p>
                <p className="smallparagraph">
                    {this.props.description}
                    <br />
                </p>
                <br />
                <SectionBreak />
                <br />
                {deleteCourse}
                <br /><br />
            </TabPanel>
        ) : (null);

        var ManagePanel = (!teacherMode) ? (
            <TabPanel>
                {courseDescription}
                <br />
                <SectionBreak />
                <br /><br />
            </TabPanel>
        ) : (null);

        var restOfPage = (showRest) ? (
            <>
                {ViewModulesPanel}
            </>
        ) : (<div><br /><br /><br /><br /><br /></div>);

        if (this.props.isMobile==='medium') {
            restOfPage= (
                <>
                    {ViewModulesPanel}
                </>
            );
        }

        let atmainpanel = (this.props.isMobile==="medium") ? ("mobile-mainpanel") : ("mainpanel");
        let atcourseheader = (this.props.isMobile==="medium") ? ("mobile-courseheader") : ("courseheader");

        if (listOfStudentKicks[listOfStudents.indexOf(this.props.email)]==="false") {
            welcomeMsg=("You've been removed from this course.");
            restOfPage=(null);
        }

        // if (this.props.isTimeUp()===0) { //if paywalled as a teacher
                      
        //     return (
        //         <Paywall />
        //     );

        // } else {
            return (
                <div>
                    <Helmet>
                        <script src="https://checkout.stripe.com/checkout.js" />
                    </Helmet>
                    <div className="paybackgroundstrip">
                        <div className="overviewheader">
                            <div className="parallelshift">
                                <br />
                                <p style={{cursor: "pointer"}} onClick={this.props.toggleHidden}>&#8249; Return to Dashboard</p>
                                {/* <br /> */}
                                <h1>{welcomeMsg}</h1>
                                {/* <br /> */}
                                {welcomeMsg==='No course selected.' ? (null) : <></>}
                            </div>
                        </div>
                    </div>
                    
                    <div className="parallelshift">
                        {restOfPage}
                    </div>
                    <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br />
                </div>
            );
        // }
    }
}

//DOC: Component: The form that allows you to create a class.
//Input: passState, courses, createCourse
//Output: JSXElement
class CreateForm extends React.Component {
    constructor(props) {
        super(props);
        if (props.isTimeUp()===1000000) { //if the user is only a student
            this.state = {
                value: '',
                areavalue: '',
                subjectVal: "None",
                visible: false,
                stage: -1, //display the page that tells them they're beginning a free trial
            };
        } else {
            this.state = {
                value: '',
                areavalue: '',
                subjectVal: "None",
                visible: false,
                stage: 0,
            };
        }
        
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeArea = this.handleChangeArea.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.passState = this.passState.bind(this);
        this.toggleVisibility = this.toggleVisibility.bind(this);
        this.goBack = this.goBack.bind(this);
        this.startFreeTrial = this.startFreeTrial.bind(this);
    }

    toggleVisibility() {
        this.setState({
            visible: !this.state.visible,
        });
    }

    passState(subject) {
        this.setState({
            subjectVal: subject,
        });
        this.props.passState(subject);
    }

    handleChange(event) {    
        let newString = event.target.value.substring(0, 40);
        this.setState({value: newString});  
    }

    handleChangeArea(event) {
        let newString = event.target.value.substring(0, 300);
        this.setState({areavalue: newString});  
    }

    goBack(event) {
        event.preventDefault();
        this.setState({
            stage: this.state.stage-1,
        }, () => this.render());
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.state.stage===0 || this.state.stage===1 || this.state.stage===2) {
            this.setState({
                stage: this.state.stage+1.
            });
        } else {
            if (this.state.subjectVal==="None") {
                alert('You need to select a subject!');
                return;
            }
            this.props.createCourse(this.state.value, this.state.visible, this.state.areavalue);
        }
    }

    startFreeTrial(event) {
        event.preventDefault(); 
        this.setState({
            stage: 0
        }, () => this.render());
    }

    render() {
        if (this.state.stage===-1) { //student only wall
            return (
                <div className="studentonlywall">
                    <h1>Creating a course is a Premium feature.</h1>
                    <h2>To proceed, you'll enter a Free Trial of Premium.</h2>
                    <h3>This unlocks all of our Premium features for 30 days.</h3>
                    <h3>After your Free Trial ends, each additional month will cost only $4.99.</h3>
                    <br /><br />
                    <h2><b>Ready to begin?</b></h2>
                    <br />
                    <form onSubmit={this.startFreeTrial}>             
                        <input type="submit" value="Start Free Trial" />
                    </form>
                </div>
            );
        }

        let charCount = 40-this.state.value.length;
        let areacharCount = 300-this.state.areavalue.length;

        let stage0 = (this.state.stage===0) ? (
            <div>
                <label>
                    Enter the name for your new course below
                    <br /><br />
                    <input type="text" value={this.state.value} onChange={this.handleChange} />
                </label>
                <p className="reallysmallparagraph">{charCount} characters remaining</p>
            </div>
        ) : (null);

        let stage1 = (this.state.stage===1) ? (
            <div>
                <label>
                    Briefly describe the course below
                    <br /><br />
                    <textarea className="textarea" type="text" value={this.state.areavalue} onChange={this.handleChangeArea} rows="4" cols="50"/>
                </label>
                <p className="reallysmallparagraph">{areacharCount} characters remaining</p>
            </div>
        ) : (null);

        let stage2 = (this.state.stage===2) ? (
            <div>
                Select Course Visibility 
                <br /><br />
                <p className="smallparagraph">Courses are private by default, which means only you can share the class code to join.<br />
                If you want, you can make it public. This will post your course on our open library of free, online courses.</p>
                <br /><br />
                <p className="smallparagraph">This course will be <b>{(this.state.visible) ? ("public") : ("private")}</b></p>
                <label className="switch">
                    <input
                        name="studentswitch"
                        type="checkbox"
                        checked={this.state.visible}
                        onChange={() => this.toggleVisibility()}
                    />
                    <span class="slider round"></span>
                </label>
            </div>
        ) : (null);

        let stage3 = (this.state.stage===3) ? (
            <div>
                Select a course subject
                <br /><br />
                {/* <p className="smallparagraph">This helps public courses gain visibility and lets students focus in on the correct field of study.</p> */}
                {/* <br /> */}
                <SelectSubject passState={this.passState} />
                <br /><br />
                <p className="smallparagraph">Once you click <i>Create Course</i>, you will be unable to modify any of these fields!</p>
            </div>
        ) : (null);

        return (
            <>
                {stage0}
                {stage1}
                {stage2}
                {stage3}
                {(this.state.stage===3) ? (null) : (<><br /><br /></>)}
                <div className="bisplit">
                    <form onSubmit={this.goBack}>
                        {(this.state.stage===0) ? (null) : (
                            <input className="backarrowbutton" type="submit" value="Back" />
                        )}
                    </form>
                    <form onSubmit={this.handleSubmit}>             
                        <input type="submit" value={(this.state.stage===3) ? ("Create Course") : ("Next")} />
                    </form>
                </div>
            </>
        );
    }
}

//DOC: Component: The form that allows you to enroll in a class.
//Input: courses, addCourse
//Output: JSXElement
class NameForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {    this.setState({value: event.target.value});  }

    handleSubmit(event) { //plugs into the backend to add the course, and passes the function on up for the main container to do the re-rendering
        let shouldAddCourse = false;

        //check that the course is available on the database. If not, throw an error to the user
        const allCourses = secureStorage.getItem('courses');
        var needed;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.state.value) {
                shouldAddCourse = true;
                needed = course.nclasscode;
            }
        }

        if (shouldAddCourse) {
            this.props.addCourse(needed);
        } else {
            alert('Sorry, class not found');
        }
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Enter the course code below<br /><br />
                    <input type="text" value={this.state.value} onChange={this.handleChange} /></label>
                <br /><br />
                <input type="submit" value="Submit" />
            </form>
        );
    }
}

//DOC: Component: A dropdown component that allows the user to search by a certain filter while browsing public courses
//Input: passState
//Output: JSXElement
class SearchSelect extends React.PureComponent {
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

//DOC: Function: Gets all the current public courses from Firebase
//Input: firebase
//Output: Array of JSON Objects, each one being a Course
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
        if (course.CourseName.substring(0, 3)===('YPP')) {
            publicItems.push({
                name: course.CourseName,
                teacher: course.nteacherName,
                joinCode: course.nclasscode,
                subject: course.osubject,
                courseDescription: course.courseDescription,
            });
        }
    }

    return publicItems;
}

//DOC: Component: The entire view for browsing public courses
//Input: addCourse, firebase
//Output: JSXElement
function PublicCourse(props) {
    let defaultPlaceholder = "Click to search";

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
        var allcourses = getPublicCourses(props.firebase);
        var cnt;
        for (cnt in allcourses) {
            if (filterFunction(allcourses[cnt], usertext)) {
                output.push(allcourses[cnt]);
            }
        }
        setPublicCourses(output);
    }

    function passState(value) {
        setFilter(value);
    }

    var bigModal = {
        content: {
            margin                  : '100px auto auto auto',
            width                   : '52em',
            height                  : '85%',
            textAlign               : 'center',
            borderRadius            : '0',
            overflowX               : 'hidden',
            // overflowY               : 'hidden',
        }
    };
    var returnToDashboard = null;
    if (props.isMobile==='medium') {
        bigModal = {
            content: {
                margin                  : '0 0 0 0',
                width                   : '100%',
                height                  : '100%',
                textAlign               : 'center',
                borderRadius            : '0',
                overflowX               : 'hidden',
                // overflowY               : 'hidden',
            }
        };
        returnToDashboard = <p style={{cursor: 'pointer', fontSize: 'large'}} onClick={props.closeCourseModal}>&#8249; Return to Dashboard</p>;
    }

    return (
        <Modal
            style= {bigModal}
            onRequestClose={props.closeCourseModal}
            effect={Effect.ScaleUp}
        >
        <div className={props.isMobile==='medium' ? "mobilemainpaneldialog" : "mainpaneldialog"}>
            <div className="addcourseview">
                {returnToDashboard}
                <div className="searchstrip">
                    <div className="searchflexsplit">
                        <label className={"searchbox"} >
                            <input id="rounded" type="text" value={value} onChange={handleChange} onClick={handleClick} />
                        </label>
                        {/* {props.isMobile==='medium' ? null : <SearchSelect passState={passState}/>} */}
                        <button className="clearfieldbutton" onClick={() => setValue('')}>Clear</button>
                    </div>
                </div>
                {
                    publicCourses.map(course => (course.name==="DELETE THAT YOU HOT DOG") ? (null) : (
                        props.isMobile==='medium' ? (
                            <div className="mobilestreamlinedlargecontent">
                                <br />
                                <h2>{(course.name+'').substring(4)}</h2>
                                <p>{course.courseDescription}</p>
                                <center>
                                    <br />
                                    <button onClick={() => {props.addCourse(course.joinCode); ModalManager.close();}}>
                                        Enroll
                                    </button>
                                </center>
                                <br />
                            </div>
                        ) : (
                            <div className="streamlinedlargecontent">
                                <div className="flexsplit">
                                    <div className="leftsplit">
                                        <br />
                                        <h2>{(course.name+'').substring(4)}</h2>
                                        <center>
                                            <br />
                                            <button onClick={() => {props.addCourse(course.joinCode); ModalManager.close();}}>
                                                Enroll
                                            </button>
                                        </center>
                                        <br />
                                    </div>
                                    <div className="moreflexsplit">
                                        <p>{course.courseDescription}</p>
                                    </div>
                                    
                                </div>
                            </div>
                        )
                    ))
                }
                <br /><br /><br /><br /><br />
            </div>
        </div>
        </Modal>
    );
}

//DOC: Component: The mainpanel view that allows you to create a class.
//Input: passState, currentCourses, createCourse
//Output: JSXElement
function CreateCoursePanel(props) {
    // if (props.isTimeUp()===0) {
    //     return (<Paywall />);
    // }
    // else {
        return (
            <div className="mainpaneldialog">
                <div className="addcourseview">
                    <div className="addcoursetitle">
                        <b>Create a course</b>
                    </div>
                    <CreateForm isTimeUp={props.isTimeUp} courses={props.courses} createCourse={props.createCourse} passState={props.passState} />
                </div>
            </div>
        );
    // }
}

//DOC: Component: The mainpanel view that allows you to add a class.
//Input: currentCourses, addCourse
//Output: JSXElement
function AddCoursePanel(props) {
    return (
        <div className="mainpaneldialog">
            <div className="addcourseview">
                <div className="addcoursetitle">
                    <b>Enroll in a course</b>
                </div>
                <NameForm courses={props.courses} addCourse={props.addCourse}/>
            </div>
        </div>
    );
}

//DOC: Component: The main container for everything on the screen, that also stores most global data in its state.
//Input: name, firebase, varkClicks, courses, email, isMobile, updateCourses
//Output: JSXElement
class Container extends React.Component { 
    constructor(props) {
        super(props);

        //bind the state setting functions to the current class
        this.changeActiveCourse = this.changeActiveCourse.bind(this);
        this.addCourseMode = this.addCourseMode.bind(this);
        this.createCourseMode = this.createCourseMode.bind(this);
        this.browseCourseMode = this.browseCourseMode.bind(this);
        this.toggleHidden = this.toggleHidden.bind(this);
        this.passState = this.passState.bind(this);
        this.getCourseDescription = this.getCourseDescription.bind(this);
        this.getCoursePublicity = this.getCoursePublicity.bind(this);
        this.getTeacherEmail = this.getTeacherEmail.bind(this);
        this.showTour = this.showTour.bind(this);
        this.closeTour = this.closeTour.bind(this);
        this.isTimeUp = this.isTimeUp.bind(this);

        this.state = {
            arrCourses: props.courses,
            courseSubject: "None",
            activeCourse: "none", //to be updated with the current open course code
            username: props.name,
            mainPanelMode: 0, //0 means modules view (default), 1 means add-course view, 2 means create-course view
            varkClicks: props.varkClicks,
            hidden: false,
            description: '',
            isTourOpen: false,
        }
    }

    closeTour() {
        this.setState({
            isTourOpen: false,
        });
        this.changeActiveCourse("none");
    }

    showTour() {
        this.setState({
            isTourOpen: true,
        });
        this.changeActiveCourse("000000");
    }

    getTeacherEmail(nameOfCourse) { // use code here instead
        const allCourses = secureStorage.getItem('courses');
        var teacher;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === nameOfCourse) {
                teacher = course.nteacher;
            }
        }
        // should be returning correct email. If not, try Object.values(course.nteacher) instead
        return teacher;
    }

    getCoursePublicity(courseCode) { 
        const allCourses = secureStorage.getItem('courses');
            for (let i = 0, len = allCourses.length; i < len; ++i) {
                var course = allCourses[i];
                if (course.nclasscode === courseCode) {
                    return course.visibility;
                }
            }
        
        return "Yeeted Course Publicity";
    }

    getCourseDescription(courseCode) {
        const allCourses = secureStorage.getItem('courses');
            for (let i = 0, len = allCourses.length; i < len; ++i) {
                var course = allCourses[i];
                if (course.nclasscode === courseCode) {
                    return course.courseDescription;
                }
            }
        return "Copypasta might have started out as a real post somewhere, but people might have found the story so stupid or amusing that they post the exact thing years later to mess with people. It's much like a group of friends getting together to mock what another person said in the past and laughing about it.";
    }

    changeActiveCourse(courseCode) {
        this.setState({
            mainPanelMode: 0,
            activeCourse: courseCode,
            description: this.getCourseDescription(courseCode),
            visible: this.getCoursePublicity(courseCode),
            hidden: true,
        }, () => {
            this.render();
        });
    }

    addCourseMode() { //switches main panel view to addCourseMode
        this.setState({
            mainPanelMode: 1
        });
        this.render(); //force React to rerender
    }

    createCourseMode() { //switches main panel view to createCourseMode
        this.setState({
            mainPanelMode: 2
        });
        this.render(); //force React to rerender
    }

    browseCourseMode() { //switches main panel view to browseCourseMode
        // this.setState({
        //     mainPanelMode: 3,
        //     hidden: true,
        // });
        ModalManager.open(<PublicCourse isMobile={this.props.isMobile} addCourse={this.addCourse} firebase={this.props.firebase} closeCourseModal={() => {ModalManager.close(); this.setState({mainPanelMode: 0})}}/>);
        this.render(); //force React to rerender
    }

    addCourse = (courseCode) => { //actually adds the course
        var actionStr = "" + this.state.username + " enrolled in " + courseCode;
        ReactGA.event({
            category: "Course Enrolled",
            action: actionStr,
        });

        var newCourses = this.state.arrCourses.slice();
        if (newCourses.includes(courseCode)) {
            alert("You've already enrolled in this course!");
        }
        else {
            newCourses.push(courseCode);
            this.setState({
                arrCourses: newCourses.slice(),
            }, () => {
                this.props.updateCourses(newCourses.slice());
                this.changeActiveCourse(courseCode); 
            });
            const usr = secureStorage.getItem('authUser');
           
           
            this.props.firebase.users().child(Object.values(usr).slice()[0]).update({
                courses: newCourses.slice(),
            });
            // adds user to teacher's view
            const allCourses = secureStorage.getItem('courses');
            var courseID;
            for (let i = 0, len = allCourses.length; i < len; ++i) {
                var course = allCourses[i];
                var stuemails;
                var stuIDs;
                if (course.nclasscode === courseCode) {
                    courseID = course.appID; // identifies current course child name to update
                    stuemails = course.ostudentList;
                    stuIDs = course.studentUID;
                    const newemail = Object.values(usr).slice()[1].replace(/\./g,'EMAILDOT');
                    stuemails[newemail] = true;
                    stuIDs[newemail] = Object.values(usr).slice()[0]
                    this.props.firebase.courses().child(courseID).update({
                        ostudentList: stuemails,
                        studentUID: stuIDs,
                    });
                    break;
                }
            }

        }

        this.props.firebase.onAuthUserListener(
            authUser => {
                secureStorage.setItem('authUser', authUser);
            },
            () => { // callback
            },
        );
    }

    createCourse = (nameOfCourse, courseVisibility, courseDescription) => { //actually adds the course
        if (this.isTimeUp()===1000000) { //DEPRECATED
            const usr = secureStorage.getItem('authUser');
            const uid = Object.values(usr).slice()[0];
            const days = this.isTimeUp(); //DEPRECATED
            let set;
            if ( days === 1000000)
                set = 7;
            else 
                set = days + 30;
            this.props.firebase.sub(uid).update({
                time: set,
                id: uid,
            }, () => {
                const usr = secureStorage.getItem('authUser');
        const email = Object.values(usr).slice()[1].toString();
        const username = Object.values(usr).slice()[4];
        var hash1 = 0;
        var hash2 = 0;
        for (let i = 0; i < email.length; i++) {
            const char = email.charCodeAt(i);
            hash1 = ((hash1 << 5) - hash1) + char;
            hash1 = hash1 & hash1;
        }
        for (let i = 0; i < nameOfCourse.length; i++) {
            const char = nameOfCourse.charCodeAt(i);
            hash2 = ((hash2 << 5) - hash2) + char;
            hash2 = hash2 & hash2;
        }
        const rand = Math.round(Math.random()*10000);
        var classCode = hash1 + "" + hash2 + rand; // <-- set this to the class code

        const modulesT = this.getModules(-1);
        const tempName = username + nameOfCourse + classCode;
        const tempStudents = {
            "exampleStudentEmail": true,
        }
        const tempID = {
            "exampleStudentEmail" : "id",
        }
        var vis;
        if (courseVisibility === true) 
            vis = "public";
        else
            vis = "private";
        this.props.firebase.course(tempName).update({
            CourseName: nameOfCourse,
            modules: modulesT,
            nclasscode: classCode,
            nteacher: email,
            nteacherName: username,
            ostudentList: tempStudents,
            osubject: this.state.courseSubject,
            varkEnabled: true,
            visibility: vis,
            courseDescription: courseDescription,
            studentUID: tempID,
        })

            this.addCourse(classCode);
            });
        }
        else {
        //also set the courseVisibility
        //courseVisibility as passed in is a boolean, either true or false, indicating public or private, respectively
        //set the database structure to match

        // generate classcode, make the course with nameOfCourse, add it to the db
        // use getModules(nameOfCourse) to get arbitrary items
        const usr = secureStorage.getItem('authUser');
        const email = Object.values(usr).slice()[1].toString();
        const username = Object.values(usr).slice()[4];
        var hash1 = 0;
        var hash2 = 0;
        for (let i = 0; i < email.length; i++) {
            const char = email.charCodeAt(i);
            hash1 = ((hash1 << 5) - hash1) + char;
            hash1 = hash1 & hash1;
        }
        for (let i = 0; i < nameOfCourse.length; i++) {
            const char = nameOfCourse.charCodeAt(i);
            hash2 = ((hash2 << 5) - hash2) + char;
            hash2 = hash2 & hash2;
        }
        const rand = Math.round(Math.random()*10000);
        var classCode = hash1 + "" + hash2 + rand; // <-- set this to the class code

        const modulesT = this.getModules(-1);
        const tempName = username + nameOfCourse + classCode;
        const tempStudents = {
            "exampleStudentEmail": true,
        }
        const tempID = {
            "exampleStudentEmail" : "id",
        }
        var vis;
        if (courseVisibility === true) 
            vis = "public";
        else
            vis = "private";
        this.props.firebase.course(tempName).update({
            CourseName: nameOfCourse,
            modules: modulesT,
            nclasscode: classCode,
            nteacher: email,
            nteacherName: username,
            ostudentList: tempStudents,
            osubject: this.state.courseSubject,
            varkEnabled: true,
            visibility: vis,
            courseDescription: courseDescription,
            studentUID: tempID,
        })

        this.addCourse(classCode);
        }
    }

    addVarkClicks = (varkCharacter) => {
        var newVark = this.state.varkClicks.slice();
        newVark.push(varkCharacter);
        this.setState({
            varkClicks: newVark.slice(),
        });
        const usr = secureStorage.getItem('authUser');
        
        
        this.props.firebase.users().child(Object.values(usr).slice()[0]).update({
            wvarkclicks: newVark.slice(),
        });
    }

    removeCourse = (courseCode) => {
        var newCourses = this.state.arrCourses.slice();
        var newnewCourses = [];
        newCourses.forEach(element => {
            if (!(element===courseCode)) {
                newnewCourses.push(element);
            }
        });
        newCourses = newnewCourses.slice();
        this.setState({
            arrCourses: newCourses.slice(),
        }, () => {this.props.updateCourses(newCourses.slice()); this.changeActiveCourse("none"); });
        const usr = secureStorage.getItem('authUser');
        const email = Object.values(usr).slice()[1];
        const newemail = email.replace(/\./g,'EMAILDOT');
        const allCourses = secureStorage.getItem('courses');
        let courseID;
        let uids;
        let list;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === courseCode) {
                courseID = course.appID; // identifies current course child name to update
                uids = course.studentUID;
                list = course.ostudentList;
                break;
            }
        }
        uids[newemail] = '';
        list[newemail] = '';
        this.props.firebase.course(courseID).update({
            ostudentList: list,
            studentUID: uids,
        });
        
        this.props.firebase.users().child(Object.values(usr).slice()[0]).update({
            courses: newCourses.slice(),
        });

        this.props.firebase.onAuthUserListener(
            authUser => {
                secureStorage.setItem('authUser', authUser);
            },
            () => { // callback
            },
        );

        setTimeout(function(){ window.location.reload(true);} , 2000);
    }

    getModules(name) {
        if (name===-1) {
            return [
                {
                    title: "DELETE THAT YOU HOT DOG",
                    contents: ["DELETE THAT YOU HOT DOG",],
                    vark: ['V',],
                    internals: ["https://youtu.be/uWJtJYXtTKo",]
                },
            ];
        }
        const allCourses = secureStorage.getItem('courses'); // here is a parsed json of the course list
        if ( name === "none")
            return []

        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];


            if ( course.nclasscode === name) { //now we've retrieved the correct course to display
                //here we need to return all of the modules in that course in an array

                var arrayOfModules = (Object.values(course.modules));
                for (let j = 0, len2 = arrayOfModules.length; j<len2; ++j) {
                    arrayOfModules[j].contents = (Object.values(arrayOfModules[j].contents));
                    arrayOfModules[j].vark = (Object.values(arrayOfModules[j].vark));
                    arrayOfModules[j].internals = (Object.values(arrayOfModules[j].internals));
                }
                return arrayOfModules;
            }
        }
    }

    getStudentNameFromEmail(email) { 
        const allCourses = secureStorage.getItem('courses');
            for (let i = 0, len = allCourses.length; i < len; ++i) {
                var course = allCourses[i];
                var uids;
                if (course.nclasscode === this.props.activeCourse) {
                    uids = course.studentUID;
                    break;
                }
            }
            const newemail = email.replace(/\./g,'EMAILDOT');
            const id = uids[newemail];
            var stuname;
            this.props.firebase.user(id).on('value', snapshot => {
                stuname = snapshot.val().username;
            })
            if ( stuname != null) return stuname;
        return "Name Unavailable";
    }

    isTimeUp() {
        
        // const usr = secureStorage.getItem('authUser');
        // const uid = Object.values(usr).slice()[0];
        // // console.log(uid);
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

        //TODO: return true if in the database, the current course hasn't been paid for yet. return false if the course is paid for, and we shouldn't display a paywall
        //to help, this.props.courseCode has been passed in

        const usr = secureStorage.getItem('authUser');
        var courses = Object.values(usr).slice()[2];
        
        var cnt;
        for (cnt in courses) {
            var courseNameInDB = courses[cnt];
            console.log(courseNameInDB)
            if (courseNameInDB.includes("PAIDFOR")) {
                var firstPart = courseNameInDB.substring(0, courseNameInDB.length-7);
                console.log(firstPart);
                console.log(this.state.activeCourse);
                if (firstPart===this.state.activeCourse) {
                    return false;
                    console.log('matched!');
                }
            }
        }
        console.log('unmatched!');
        return true;
    }

    toggleHidden() {
        this.setState({
            hidden: !this.state.hidden,
        });
    }

    passState(subject) {
        this.setState({
            courseSubject: subject,
        });
    }

    getStudentProgress(studentEmail, firebase, activeCourse) {
        // RETURN STUDENT PROGRESS AS 3D ARRAY
        const allCourses = secureStorage.getItem('courses');
        let students;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
                var course = allCourses[i];
                if (course.nclasscode === activeCourse) {
                    students = course.studentUID;
                }
        }
        const newemail = studentEmail.replace(/\./g,'EMAILDOT');
        const uid = students[newemail];
        let ret = [];
        firebase.user(uid).child('vcourseprogress').child(activeCourse).on('value', snapshot => {
            if (snapshot.val() == null ) console.log('No progress for this student'); // will return null if student has no progress
            else {
                for (let [key, value] of Object.entries(snapshot.val())) {
                    let moduleList = [];
                    for (let [key1, value1] of Object.entries(value)){
                        moduleList[key1] = Object.values(value1);
                    }
                    ret[key] = moduleList;
                }
            }
        });
        
        if (ret != null ) return ret;
        else return 'wait for return';
    }

    render() {
        if (!window.location.href.includes('loaded')) {
            setTimeout(() => {
                if (!window.location.href.includes('loaded')) {
                    window.location.href=window.location.href+'#loaded';
                }
                window.dispatchEvent(new Event('resize'));
            }, 1500);
        }

        var instantOpen = false;
        if (this.props.isMobile==="small") {
            return (
                <div>
                    <center>
                        <br /><br /><br /><br />
                        <img src={deviceicon} width="100px" alt="Phone rotation prompt image"/>
                        <br /><br />
                        <h3>Please rotate your device to landscape</h3>
                        <br /><br /><br /><br />
                    </center>
                </div>
            );
        } else if (this.props.isMobile==="medium") {
            instantOpen = true;
        }

        var mainpanel;
        if (this.state.mainPanelMode===0) {
            mainpanel = <MainPanel toggleHidden={this.toggleHidden} isTimeUp={this.isTimeUp} changeActiveCourse={this.changeActiveCourse} showTour={this.showTour} description={this.state.description} instantOpen={instantOpen} isMobile={this.props.isMobile} firebase={this.props.firebase} email={this.props.email} activeCourse={this.state.activeCourse} modules={this.getModules(this.state.activeCourse)} removeCourse={this.removeCourse} addVarkClicks={this.addVarkClicks}/>
            
        } else if (this.state.mainPanelMode===1) {
            mainpanel = <AddCoursePanel currentCourses={this.state.arrCourses} addCourse={this.addCourse}/>
        } else if (this.state.mainPanelMode===2) {
            mainpanel = <CreateCoursePanel isTimeUp={this.isTimeUp} passState={this.passState} currentCourses={this.state.arrCourses} createCourse={this.createCourse}/>
        } else if (this.state.mainPanelMode===3) {
                        
        }

        const usr = secureStorage.getItem('authUser');
        const email = Object.values(usr).slice()[1].toString();

        var leftelementattribute = (this.state.hidden) ? ("invisible") : ((!(this.props.isMobile==="medium")) ? ("left-element") : ("mobile-left-element"));
        // console.log(this.state.arrCourses);
        let counter;
        for (counter in this.state.arrCourses) {
            // console.log(this.getTeacherEmail(this.state.arrCourses[counter]));
            // console.log((this.getTeacherEmail(this.state.arrCourses[counter])+'').includes(email));
        }
        // console.log(email);
        var leftelement = (
            <div className={leftelementattribute}>
                {(this.props.isMobile==='medium') ? (
                    <div className="paybackgroundstrip">
                        <div className="mobileoverviewheader">
                                <p className="introhead">Hi, {this.state.username}</p>
                                <br /><br />
                                <a href="https://discord.gg/dvJXfWh" className="mobilediscordbutton">{"Go to Discord"}</a>
                        </div>
                        {/* <span><a href="https://modulusedu.com/">Powered by Modulus</a></span> */}
                    </div>
                ) : (
                    <div className="paybackgroundstrip">
                        <div className="overviewheader">
                            <div className="leftsideofheader">
                                <h1 id="headerlarge">Hi, {this.state.username}</h1>
                                <Link id="removeformat" to={ROUTES.ACCOUNT}><p>{email}
                                &nbsp;&nbsp;<img id="smalloffset" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAABQElEQVQ4jZWVz0rDQBDGJyUSbyVXT+LB1gpe+gJCizRIfCfpKb35KE0PCupdQRQ8+wZWwQeoPw/Z4Ha6f8h3ys5+++03mckkkQiAXESOzPIjSZKf2JmY4A3/qGL8nkOgADIrNLKezyxeBsxibubGyRswAi6AL8vhGpgAJ8CriV37xKZs4xc/9N7EJZgCTwERH16APZ/LYcSZxgY4DhXlUEQSFVuKSCkiVyKyUns9ETnQrnKa1nhguwAAS0cWteKsgXujkQswDqR06RAsA/zxTh86UtLQr2Tnxj5QAXfGvo3awV8pzqc5WwF9TZ450qhNmqVDDOA85PaU7m0z9IllNJ9cV7wD+y7BQhFDTjdqXfhctsPhGRjQDIdv62A7HAaGAzAPFb0dEqm1frQEb614CkyDYp4L7AG7iPHDTSrdfwF/1pEFwN+QFT0AAAAASUVORK5CYII="></img>
                                </p></Link><br />
                                {/* <Link className="accountsettingsbutton" to={ROUTES.ACCOUNT}>
                                        Go to Account Settings
                                </Link> */}
                            </div>
                        </div>
                        {/* <span><a href="https://modulusedu.com/">Powered by Modulus</a></span> */}
                    </div>
                )}
                <div className="sidebar">
                    <div className="courselist">
                        {(this.props.isMobile==='medium') ? (null) : (<h1>My Courses</h1>)}
                        {/* <BrowseCourseItem browseCourseMode={this.browseCourseMode} /> */}
                        {/* <div className="threewaysplit">
                            {(this.props.isMobile==='large') ? (<BrowseCourseItem browseCourseMode={this.browseCourseMode} />) : (null)}
                            <AddCourseItem isMobile={this.props.isMobile} addCourseMode={this.addCourseMode}/>
                            {(this.props.isMobile==='large') ? (<CreateCourseItem createCourseMode={this.createCourseMode}/>) : (null)}
                        </div> */}
                        {/* {(this.props.isMobile==='large') ? (<><br /><hr /></>) : (null)}
                        {(this.props.isMobile==='large') ? (<><ReallySmallBreak text="COURSES OWNED" />
                        <center>
                            {(this.state.arrCourses.length<=1) ? (
                                <p className="smallemptytext">You don't teach any courses yet.</p>
                            ) : (
                                this.state.arrCourses.map
                                (course => (
                                    ((course==="000000") || (isUserBlocked(this.props.email, this.state.activeCourse)==="false")) ? (
                                        (
                                            (course==="000000" && this.state.isTourOpen) ? (
                                                <CourseListItem 
                                                    name={course} 
                                                    active={"active"} 
                                                    changeActiveCourse={this.changeActiveCourse}
                                                    id="welcomecourse"
                                                />
                                            ) : (
                                                null
                                            )
                                        )
                                    ) : 
                                    (
                                        ((this.getTeacherEmail(course)+'').includes(email)) ? (
                                            <CourseListItem 
                                                name={course} 
                                                active={(this.state.activeCourse===course ? "active" : "")} 
                                                changeActiveCourse={this.changeActiveCourse}
                                            />
                                        ) : (null)
                                    )
                                ))
                            )}
                        </center>
                        <ReallySmallBreak text="COURSES ENROLLED" /></>) : (null)} */}
                        {/* {(this.state.arrCourses.length<=1) ? (
                                <div className="coursechunks"><InlineBrowseCourseItem browseCourseMode={this.browseCourseMode} /> </div>
                            ) : null} */}
                        {(this.state.arrCourses.length<=1) ? (null) : (
                        <div className="coursechunks">
                            {(this.state.arrCourses.length<=1) ? (
                                // <InlineBrowseCourseItem browseCourseMode={this.browseCourseMode} /> 
                                <></>
                            ) : 
                                this.state.arrCourses.map(course => (
                                    (course==="000000") ? (
                                        // <InlineBrowseCourseItem browseCourseMode={this.browseCourseMode} />
                                        <></>
                                    ) : 
                                    (
                                        (!((this.getTeacherEmail(course)+'').includes(email))) ? (
                                            <CourseListItem 
                                                name={course} 
                                                getCourseDescription={this.getCourseDescription}
                                                active={(this.state.activeCourse===course ? "active" : "")} 
                                                changeActiveCourse={this.changeActiveCourse}
                                                percentage={getStudentProgressPercentage(this.props.email, this.props.firebase, course, this.getModules(course))}
                                            />
                                        ) : (null)
                                    )
                                )
                            )}
                        </div>)}
                        <br />
                        {/* <a style={{textAlign: 'left', marginLeft: '15%'}} className="smallparagraph" href="https://modulusedu.com/">Course content served by Modulus</a> */}
                        <br /><br /><br />
                    </div>
                </div>
            </div>
        );

        var button = null;

        if (this.props.isMobile==='medium') {
            button = (this.state.hidden) ? (
                // <button className={(!(this.props.isMobile==="medium")) ? ("smallsidebartoggle") : ("mobile-smallsidebartoggle")} onClick={this.toggleHidden}>
                //     <img src={backarrow} height="20px" />
                // </button>
                null
            ) : (
                // <button className={(!(this.props.isMobile==="medium")) ? ("sidebartoggle") : ("mobile-sidebartoggle")} onClick={this.toggleHidden}>
                //     <img className={("")} src={menuicon} width="12px" alt="Sidebar Toggle"/> 
                // </button>
                null
            );
        } else {
            button = (this.state.hidden) ? (null
                // <button className={(!(this.props.isMobile==="medium")) ? ("smallsidebartoggle") : ("mobile-smallsidebartoggle")} onClick={this.toggleHidden}>
                //     Return to Dashboard
                // </button>
            ) : (
                // <button className={(!(this.props.isMobile==="medium")) ? ("sidebartoggle") : ("mobile-sidebartoggle")} onClick={this.toggleHidden}>
                //     <img className={("")} src={backarrow} width="12px" alt="Sidebar Toggle"/> 
                // </button>
                null
            );
        }

         

        var rightelement;
        
        if (this.props.isMobile==="medium") {
            if (this.state.hidden) {
                rightelement = (
                    <div className="right-element">
                        {mainpanel}
                    </div>
                );
            } else {
                rightelement = (null);
            }
        } else {
            rightelement = (
                <div className="right-element">
                    {mainpanel}
                </div>
            );
        }

        const steps = [
            {
                selector: '#account',
                content: 'This lets you edit your account settings, such as your password.',
            },
            {
                selector: '#dashboard',
                content: 'This is the page you\'re currently on! It contains all your courses and lets you view the contents of each course.',
            },
            {
                selector: '.left-element',
                content: 'This is the sidebar, where you can view the courses you\'re enrolled in, or that you teach You can hide it, or show it.',
            },
            {
                selector: '.threewaysplit',
                content: 'Using these buttons, you can browse our library of free, open courses; enroll in a course using the code provided by your teacher; or create a course of your own.',
            },
            {
                selector: '.sidebartoggle',
                content: 'You can hide or show the sidebar with this button.',
            },
            {
                selector: '.tablist',
                content: 'Using these tabs, you can navigate around the course, including viewing the course contents and unenrolling. If you\'re a teacher, you can also edit the course, as well as invite and block students.', 
            },
            {
                selector: '.viewmodules',
                content: 'Courses are organized into modules, which can be expanded to show individual content items. Content items are one of four types: Video, Audio, Document, and Assessment. You can filter which type to view using the filter button in the top left.'
            }
        ]

        return (
            <div className="App">
                <div className="container">
                    {this.state.hidden ? null : leftelement}
                    {button}
                    {!this.state.hidden ? null : rightelement}
                </div>
                <Tour
                    showNumber={false}
                    rounded={10}
                    accentColor={"#003459"}
                    steps={steps}
                    isOpen={this.state.isTourOpen}
                    onRequestClose={this.closeTour} 
                />
            </div>
        );
    }
}

//DOC: Component: Renders and returns a Container, and initializes it with proper defaults.
//Input: firebase
//Output: JSXElement
class Home extends React.Component {
    constructor(props) {
        super(props);
        this.props.firebase.onAuthUserListener(
            authUser => {
                secureStorage.setItem('authUser', authUser);
            },
            () => { // callback
            },
        );

        const usr = secureStorage.getItem('authUser');
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.updateCourses = this.updateCourses.bind(this);

        var courses = Object.values(usr).slice()[2];
        var cnt;
        for (cnt in courses) {
            if (courses[cnt].includes("PAIDFOR")) {
                var firstPart = courses[cnt].substring(0, courses[cnt].length-7);
                courses[cnt] = firstPart;
            }
        }

        this.state = {
            username: Object.values(usr).slice()[4],
            email: Object.values(usr).slice()[1],
            courses: courses,
            varkClicks: Object.values(usr).slice()[6],
            isMobile: "large", //either large, medium or small
        }
    }

    updateCourses(newCourses) {
        this.setState({
            courses: newCourses
        });
    }

    componentDidMount() {
        const advancedMatching = { em: 'kelly8hu@gmail.com' }; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/advanced/advanced-matching
        const options = {
            autoConfig: true, // set pixel's autoConfig
            debug: false, // enable logs
        };
        ReactPixel.init('913473442493570', advancedMatching, options);
        ReactPixel.pageView();

        //update window size
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.props.firebase.doChangePersist();
        //pull data from firebase
        const usr = secureStorage.getItem('authUser');
        this.props.firebase.courses().on('value', snapshot => {
            const coursesObject = snapshot.val();
            const coursesList = Object.keys(coursesObject).map(key => ({
                ...coursesObject[key],
                appID: key,
            }));
            
            secureStorage.setItem('courses', coursesList);
            // console.log(secureStorage.getItem('courses'))

            this.setState({
                username: Object.values(usr).slice()[4],
                email: Object.values(usr).slice()[1],
                courses: Object.values(usr).slice()[2],

            });
        });

        //initialize google analytics
        ReactGA.initialize('UA-171719940-1');
        ReactGA.set({
            username: Object.values(usr).slice()[4],
            email: Object.values(usr).slice()[1],
            // any data that is relevant to the user session
            // that you would like to track with google analytics
        })
    }
      
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
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

    render() {
        return ( //when login is implemented, it should create an app with the appropriate username passed in
            <Container updateCourses={this.updateCourses} name={this.state.username} email={this.state.email} courses={this.state.courses} firebase={this.props.firebase} varkClicks={this.state.varkClicks} isMobile={this.state.isMobile}/>
        );
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Home);