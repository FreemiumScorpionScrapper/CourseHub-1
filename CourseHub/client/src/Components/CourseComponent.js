import React, { useContext } from "react";
import { withRouter } from "react-router-dom";

import { AuthContext } from '../Context/AuthContext'
import AuthService from '../Services/AuthService'
import { motion } from 'framer-motion'
import { courseCardTransition as PageTransition, courseCardVariants as PageVariants } from "../Services/AnimationService";

const CourseCard = (props) => {

    let courseUrl = '';
    let selected = false;
    let selectedClass = ''
    if (props.isAuthenticated) {
        props.selectedCourses.map(course => {
            if (props.data.slug === course) {
                selected = true;
                selectedClass = 'selected-btn';

            }
        })

    }

    if (props.data.courseProvider === "Coursera") {
        courseUrl = `https://www.coursera.org/learn/${props.data.slug}`;
    }
    else if (props.data.courseProvider === 'Udacity') {
        courseUrl = props.data.slug;
    }
    return (
        <div className="course-card">
            <a target='_blank' href={courseUrl}><h2>{props.data.name}</h2></a>
            <p className='course-description'>{props.data.description}</p>
            <div className='course-footer'>
                <p className='course-provider'>{props.data.courseProvider}</p>
                {props.isAuthenticated && <button
                    className={`add-to-fav-btn ${selectedClass}`}
                    value={`${props.data.slug}`}
                    disabled={selected === true ? true : false}
                    onClick={props.selectCourse}>{selected ? 'Added' : 'Add to favourites'}</button>}
            </div>
        </div>
    )
}

function Course(props) {



    const authContext = useContext(AuthContext);
    const RenderCourseCard = ({ selectCourse, selectedCourses, isAuthenticated }) => {
        return props.data.map((course, index) => {
            return (
                <CourseCard key={index} data={course} selectCourse={selectCourse} selectedCourses={selectedCourses} isAuthenticated={isAuthenticated} />
            )
        })
    }

    const selectCourse = (e) => {
        e.target.classList.add('button-disabled');
        e.currentTarget.innerText = "Added";
        e.currentTarget.disabled = true;

        const selectCourseData = {
            _id: authContext.user._id,
            selectedCourse: e.target.value
        }
        fetch('/selectCourse', {
            method: 'post',
            body: JSON.stringify(selectCourseData),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.body)
            .then(data => {

            });
    }


    return (
        <motion.div
            exit='out'
            initial='out'
            animate='in'
            variants={PageVariants}
            transition={PageTransition} className='result-container'>
            <RenderCourseCard selectCourse={selectCourse} selectedCourses={authContext.user.selectedCourses} isAuthenticated={authContext.isAuthenticated} />
        </motion.div>
    )
}

export default withRouter(Course);