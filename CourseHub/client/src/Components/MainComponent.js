import React, { Component, useContext, useState } from 'react';
import Search from "./SearchComponent";
import Dashboard from './DashboardComponent'
import Login from './LoginComponent'
import Register from './RegisterComponent'
import { Switch, Route, BrowserRouter as Router, Redirect, withRouter, useLocation } from "react-router-dom";
import Menu from './MenuComponent';
import Course from "./CourseComponent";
import { AnimatePresence, motion } from 'framer-motion';


import { AuthContext } from '../Context/AuthContext'
import AuthService from '../Services/AuthService'


const PrivateRoute = (props) => {
    const { component: Component, ...rest } = props;
    // props.history.push('/dashboard');

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
    const location = useLocation();
    const authContext = useContext(AuthContext);
    const [courseData, setCourseData] = useState({});

    return (
        <div style={{ overflowX: 'hidden', height: '100vh' }}>
            <div>
                <Menu />
            </div>
            <AnimatePresence exitBeforeEnter >
                <Switch location={location} key={location.pathname}>
                    <Route exact path='/' >
                        <Search setCourseData={setCourseData} />
                    </Route>
                    <PrivateRoute path='/dashboard' component={Dashboard} isAuthenticated={authContext.isAuthenticated} history={props.history} />
                    <Route path='/authorize'>
                        <Login />
                    </Route>
                    <Route path='/register' >
                        <Register />
                    </Route>
                    <Route path='/courses/:course' >
                        <Course courseData={courseData} />
                    </Route>

                    <Redirect to='/' />
                </Switch>
            </AnimatePresence>

        </ div>
    )
}


export default withRouter(Main);