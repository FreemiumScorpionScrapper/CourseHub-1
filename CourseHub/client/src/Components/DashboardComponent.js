import React, { useContext, useState, useEffect, Component } from "react";
import { withRouter } from "react-router";
import Card from './ReusableCard';
import { AuthContext } from "../Context/AuthContext";
import AuthService from "../Services/AuthService";
import { motion } from 'framer-motion';

import { PageTransition, PageVariants, courseCardTransition, courseCardVariants } from "../Services/AnimationService";

function Dashboard(props) {

    const authContext = useContext(AuthContext);
    const selectedCourseList = authContext.user.selectedCourses;
    const [courseData, setCourseData] = useState([]);




    useEffect(() => {


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
        <>

            <motion.div
                exit='out'
                initial='out'
                animate='in'
                variants={PageVariants}
                transition={PageTransition}
                className='dashboard-sidebar'>
                <div className='dashboard-avatar'></div>
                <div className='dashboard-logout' onClick={logoutHandler}>
                    <i className="fa fa-sign-out fa-lg" aria-hidden="true"></i>
                </div>
            </motion.div>
            <motion.div
                exit='out'
                initial='out'
                animate='in'
                variants={PageVariants}
                transition={PageTransition}
                className='dashboard-container'>

                <div className='dashboard-main'>
                    <div className='search-box-container'>
                        <input className="search-box" type="text" placeholder="Search Up!" autoFocus />
                        <button className="search-button">
                            <i className="fa fa-search fa-lg" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div className='dashboard-welcome-message'>
                        {courseData.length === 0 ? `Hi ${authContext.user.name}, you have not selected any courses yet` : `Hi ${authContext.user.name}, these are the courses you added eariler...`}
                    </div>
                    <div className='dashboard-recommendations'>
                        <Card courseData={courseData} />
                    </div>
                    <div className='dashboard-below-recommendations'>

                    </div>
                </div>
            </motion.div>

        </>
    )

}

export default withRouter(Dashboard);