# Welcome to Modulus



# ![Modulus Logo][logo]



[logo]: https://raw.githubusercontent.com/Nano1337/modulus/master/src/components/Navigation/moduluslogo.png



This is the code for the Modulus web app, which you can view at http://app.modulusplatform.site/



We have a separate repository for the landing page: http://modulusplatform.site/

You can view that code at https://github.com/epicdragon44/moduluswebsite.



## Flowchart of components

https://app.lucidchart.com/documents/view/12e9a358-6152-4630-9d61-8f33eee10b23/0_0



# Component Documentation









## codeToName
_Function_
```javascript
function codeToName(classcode) 
```

This function takes Converts the class code passed into the function into the actual English name of the course

**Input:** classcode

**Output:** String





## isUserBlocked
_Function_
```javascript
function isUserBlocked(username, activeCourse) 
```

Determines whether the user is blocked from the activeCourse

**Input:** username activeCourse

**Output:** boolean





## getPublicCourses
_Function_
```javascript
function getPublicCourses(firebase) 
```

Gets all the current public courses from Firebase

**Input:** firebase

**Output:** Array of JSON Objects each one being a Course





## MainPanel
_Component_
```javascript
class MainPanel extends React.Component 
```

The entire right half of the screen, which can change its display depending on whether we want to show the contents of the course, with all the modules; or the screen that lets us enroll in a course; or the screen that lets us create a course.

**Input:** firebase activeCourse modules removeCourse addVarkClicks email instantOpen isMobile changeActiveCourse showTour description instantOpen

**Output:** JSXElement

Contains: 
[codeToName](#codeToName)
[getPublicCourses](#getPublicCourses)
[codeToName](#codeToName)
[VarkProfile](#VarkProfile)
[VarkProfile](#VarkProfile)
[codeToName](#codeToName)
[Select](#Select)
[Select](#Select)
[VarkProfile](#VarkProfile)
[ModuleItem](#ModuleItem)
[ModuleItem](#ModuleItem)
[AddModuleItem](#AddModuleItem)
[ModuleItem](#ModuleItem)
[ModuleItem](#ModuleItem)
[ModuleItem](#ModuleItem)
[VarkProfile](#VarkProfile)
[VarkProfile](#VarkProfile)
[SectionBreak](#SectionBreak)
[SectionBreak](#SectionBreak)
[EditCourseDescription](#EditCourseDescription)
[SectionBreak](#SectionBreak)
[SectionBreak](#SectionBreak)
[SectionBreak](#SectionBreak)
[SectionBreak](#SectionBreak)




## Container
_Component_
```javascript
class Container extends React.Component 
```

The main container for everything on the screen, that also stores most global data in its state.

**Input:** name firebase varkClicks courses email isMobile updateCourses

**Output:** JSXElement

Contains: 
[MainPanel](#MainPanel)
[AddCoursePanel](#AddCoursePanel)
[CreateCoursePanel](#CreateCoursePanel)
[PublicCourse](#PublicCourse)
[BrowseCourseItem](#BrowseCourseItem)
[AddCourseItem](#AddCourseItem)
[CreateCourseItem](#CreateCourseItem)
[ReallySmallBreak](#ReallySmallBreak)
[isUserBlocked](#isUserBlocked)
[CourseListItem](#CourseListItem)
[CourseListItem](#CourseListItem)
[ReallySmallBreak](#ReallySmallBreak)
[isUserBlocked](#isUserBlocked)
[CourseListItem](#CourseListItem)




## ModuleContentItem
_Component_
```javascript
class ModuleContentItem extends React.Component 
```

A course item, that, when clicked, displays one of the course contents.

**Input:** updateMap varkStatus instantOpen name vark internal addVarkClicks teacherMode moduleTitle activeCourse modules firebase evenodd isMobile

**Output:** JSXElement

Contains: 
[MyModal](#MyModal)
[RenameItem](#RenameItem)
[DeleteItem](#DeleteItem)
[EditItem](#EditItem)




## ModuleItem
_Component_
```javascript
function ModuleItem(props) 
```

Displays an entire module, including all of its content items.

**Input:** isMobile instantOpen name contents vark internals active username addVarkClicks varkMode teacherMode activeCourse modules firebase showVark varkStatus

**Output:** JSXElement

Contains: 
[ModuleContentItem](#ModuleContentItem)
[RenameModule](#RenameModule)
[DeleteModule](#DeleteModule)
[ModuleContentItem](#ModuleContentItem)




## PublicCourse
_Component_
```javascript
function PublicCourse(props) 
```

The entire view for browsing public courses

**Input:** addCourse firebase

**Output:** JSXElement

Contains: 
[getPublicCourses](#getPublicCourses)
[getPublicCourses](#getPublicCourses)
[PublicCourse](#PublicCourse)
[Select](#Select)




## MyModal
_Component_
```javascript
class MyModal extends React.Component 
```

Displays a popup dialog.

**Input:** cancelFunc (optional) contentType itemName firebase text modules activeCourse moduleTitle internal vark onRequestClose teacherMode addItemMode (optional) varkStatus

**Output:** JSXElement

Contains: 
[Select](#Select)
[Select](#Select)
[Select](#Select)




## CreateForm
_Component_
```javascript
class CreateForm extends React.Component 
```

The form that allows you to create a class.

**Input:** passState courses createCourse

**Output:** JSXElement

Contains: 
[Select](#Select)
[Select](#Select)
[Select](#Select)




## CourseListItem
_Component_
```javascript
function CourseListItem(props) 
```

This component renders a single course button in the sidebar that, when clicked, changes the main panel to display that course.

**Input:** name active changeActiveCourse id (optional)

**Output:** JSXElement

Contains: 
[codeToName](#codeToName)




## AddModuleContentItemItem
_Component_
```javascript
class AddModuleContentItemItem extends React.Component 
```

A button that allows the user (assumedly a teacher) to add an item to the module.

**Input:** moduleTitle activeCourse modules firebase varkStatus

**Output:** JSXElement

Contains: 
[MyModal](#MyModal)




## SelectSubject
_Component_
```javascript
class SelectSubject extends React.PureComponent 
```

Allows the user to select a subject for their course

**Input:** passState

**Output:** JSXElement

Contains: 
[Select](#Select)




## CreateCoursePanel
_Component_
```javascript
function CreateCoursePanel(props) 
```

The mainpanel view that allows you to create a class.

**Input:** passState currentCourses createCourse

**Output:** JSXElement

Contains: 
[CreateForm](#CreateForm)




## AddCoursePanel
_Component_
```javascript
function AddCoursePanel(props) 
```

The mainpanel view that allows you to add a class.

**Input:** currentCourses addCourse

**Output:** JSXElement

Contains: 
[NameForm](#NameForm)




## Home
_Component_
```javascript
class Home extends React.Component 
```

Renders and returns a Container, and initializes it with proper defaults.

**Input:** firebase

**Output:** JSXElement

Contains: 
[Container](#Container)




## BrowseCourseItem
_Component_
```javascript
function BrowseCourseItem(props) 
```

Displays a single button in the sidebar, that, when clicked, changes the main panel to allow you to enroll in a course

**Input:** browseCourseMode

**Output:** JSXElement





## AddCourseItem
_Component_
```javascript
function AddCourseItem(props) 
```

Displays a single button in the sidebar, that, when clicked, changes the main panel to allow you to enroll in a course

**Input:** addCourseMode isMobile

**Output:** JSXElement





## CreateCourseItem
_Component_
```javascript
function CreateCourseItem(props) 
```

Displays a single button in the sidebar, that, when clicked, changes the main panel to allow you to create a course

**Input:** createCourseMode

**Output:** JSXElement





## ReallySmallBreak
_Component_
```javascript
function ReallySmallBreak(props) 
```

Displays a break for the sidebar that lets us put headers within it

**Input:** text

**Output:** JSXElement





## RenameModule
_Component_
```javascript
class RenameModule extends React.Component 
```

Inline button that, when clicked, allows the user to rename a module.

**Input:** internal moduleTitle modules firebase activeCourse

**Output:** JSXElement





## DeleteModule
_Component_
```javascript
class DeleteModule extends React.Component 
```

Inline button that, when clicked, allows the user to delete a module.

**Input:** internal moduleTitle modules firebase activeCourse

**Output:** JSXElement





## RenameItem
_Component_
```javascript
class RenameItem extends React.Component 
```

Inline button that, when clicked, allows the user to rename an item.

**Input:** internal moduleTitle activeCourse modules itemName vark firebase

**Output:** JSXElement





## DeleteItem
_Component_
```javascript
class DeleteItem extends React.Component 
```

Inline button that, when clicked, allows the user to delete an item.

**Input:** internal moduleTitle activeCourse modules itemName vark firebase

**Output:** JSXElement





## EditItem
_Component_
```javascript
class EditItem extends React.Component 
```

Inline button that, when clicked, allows the user to edit an item.

**Input:** openModal

**Output:** JSXElement





## AddModuleItem
_Component_
```javascript
class AddModuleItem extends React.Component 
```

A button that allows the user (assumedly a teacher) to add a module to the course.

**Input:** internal activeCourse modules firebase changeActiveCourse

**Output:** JSXElement





## EditCourseDescription
_Component_
```javascript
function EditCourseDescription(props) 
```

Renders an edit course panel inside the course tab for teachers

**Input:** activeCourse handleSubmit courseDescription

**Output:** JSXElement





## VarkProfile
_Component_
```javascript
function VarkProfile(props) 
```

Displays the entire VARK Profile.

**Input:** Vcnt Acnt Rcnt Kcnt

**Output:** JSXElement





## Select
_Component_
```javascript
class Select extends React.PureComponent 
```

Allows the user to filter which VARK-type of items to display.

**Input:** passState default

**Output:** JSXElement





## SectionBreak
_Component_
```javascript
function SectionBreak() 
```

A simple element that renders a break across the Mainpanel page

**Input:** None

**Output:** JSXElement





## NameForm
_Component_
```javascript
class NameForm extends React.Component 
```

The form that allows you to enroll in a class.

**Input:** courses addCourse

**Output:** JSXElement





## SearchSelect
_Component_
```javascript
class SearchSelect extends React.PureComponent 
```

A dropdown component that allows the user to search by a certain filter while browsing public courses

**Input:** passState

**Output:** JSXElement





