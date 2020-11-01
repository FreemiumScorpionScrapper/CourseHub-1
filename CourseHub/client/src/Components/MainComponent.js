import React, { Component, useContext, useState } from 'react';
import Search from "./SearchComponent";
import Dashboard from './DashboardComponent'
import Login from './LoginRegisterComponent'
import RegisterUser from './RegisterUserComponent';
import { Switch, Route, BrowserRouter as Router, Redirect, withRouter } from "react-router-dom";
import Menu from './MenuComponent';
import Course from "./CourseComponent";


import { AuthContext } from '../Context/AuthContext'
import AuthService from '../Services/AuthService'


const PrivateRoute = ({ component: Component, ...rest }) => {
    return (
        <Route {...rest} render={(props) => {
            return (
                rest.isAuthenticated
                    ? <Component {...props} />
                    : <Redirect to='/authorize' />
            )
        }} />
    )

}


function Main(props) {
    const authContext = useContext(AuthContext);
    const [courseData, setCourseData] = useState({});

    return (
        <>
            <div>
                <Menu />
            </div>
            <Switch>
                <Route exact path='/' >
                    <Search setCourseData={setCourseData} />
                </Route>
                <PrivateRoute path='/dashboard' component={Dashboard} isAuthenticated={authContext.isAuthenticated} />
                <Route path='/authorize'>
                    <RegisterUser />
                </Route>
                <Route path='/courses/:course' >
                    <Course courseData={courseData} />
                </Route>

                <Redirect to='/' />
            </Switch>
        </>
    )
}


export default withRouter(Main);