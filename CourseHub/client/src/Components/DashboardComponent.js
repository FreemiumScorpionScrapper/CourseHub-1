import React, { useContext, useState, useEffect, Component } from "react";
import { withRouter } from "react-router";
import Card from './ReusableCard';
import { AuthContext } from "../Context/AuthContext";
import AuthService from "../Services/AuthService";



function Dashboard(props) {

    const authContext = useContext(AuthContext);
    const selectedCourseList = authContext.user.selectedCourses;
    const [courseData, setCourseData] = useState([]);




    useEffect(() => {
        AuthService.isAuthenticated().then(data => {
            authContext.setUser(data.user);
            authContext.setIsAuthenticated(data.isAuthenticated);
        });

        const list = { slug: selectedCourseList };
        fetch('/getselected', {
            method: 'post',
            body: JSON.stringify(list),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(data => {
            setCourseData(data.course);
        })

    }, []);

    const logoutHandler = (e) => {
        AuthService.logout();
        authContext.setUser({ name: "", email: "" });
        authContext.setIsAuthenticated(false);
        props.history.push('/');
    }
    return (
        <div className='dashboard-container'>
            <div className='dashboard-sidebar'>
                <div className='dashboard-avatar'></div>
                <div className='dashboard-logout' onClick={logoutHandler}>
                    <i className="fa fa-sign-out fa-lg" aria-hidden="true"></i>
                </div>
            </div>
            <div className='dashboard-main'>
                <div className='search-box-container'>
                    <input className="search-box" type="text" placeholder="Search Up!" autoFocus />
                    <button className="search-button">
                        <i className="fa fa-search fa-lg" aria-hidden="true"></i>
                    </button>
                </div>
                <div className='dashboard-welcome-message'>
                    Hi {authContext.user.name}, these are the courses you added eariler...
                </div>
                <div className='dashboard-recommendations'>
                    <Card courseData={courseData} />
                </div>
                <div className='dashboard-below-recommendations'>

                </div>
            </div>
        </div>
    )

}

export default withRouter(Dashboard);