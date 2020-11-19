import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from "../Context/AuthContext";
import AuthService from "../Services/AuthService";
import { motion } from 'framer-motion';
import { courseCardTransition, courseCardVariants } from "../Services/AnimationService";

function Card(props) {
    const [courseData, setCourseData] = useState([]);
    const authContext = useContext(AuthContext);

    useEffect(() => {
        setCourseData(props.courseData);
    }, [props])
    const handleClick = (e) => {

        console.log("Udemy", e.currentTarget.value)
        const remove = {
            remove: e.currentTarget.value,
            user: authContext.user._id
        }
        fetch('/removeselected', {
            method: 'post',
            body: JSON.stringify(remove),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(data => data.json())
            .then(data => {

                const removed = courseData.filter(course => {
                    if (course.courseProvider === "Udemy") {
                        return course.url !== remove.remove
                    }
                    else {
                        return course.slug !== remove.remove
                    }
                });
                console.log(removed);
                setCourseData(removed);
                console.log(courseData)
            })
    }
    const RenderCards = (props) => {
        return props.courseData.map((d, i) => {
            let courseUrl = '';
            let deleteValue = '';
            if (d.courseProvider === "Coursera") {
                courseUrl = `https://www.coursera.org/learn/${d.slug}`;
                deleteValue = d.slug;
            }
            else if (d.courseProvider === 'Udacity') {
                courseUrl = d.slug ? d.slug : '';
                deleteValue = d.slug;
            }
            else if (d.courseProvider === 'Udemy') {
                courseUrl = d.url ? d.url : '';
                deleteValue = d.url;
            }

            return (

                <motion.div
                    exit='out'
                    initial='out'
                    animate='in'
                    variants={courseCardVariants}
                    transition={courseCardTransition}
                    key={i} className="reusable-card"  >
                    <img src={d.photoUrl} />
                    <a target="_blank" href={courseUrl}><h2 className='reusable-card-heading'>{d.name}</h2></a>
                    <p className='reusable-card-body' >{d.description.substring(0, 300)}. . .</p>
                    <button className='remove-button' value={deleteValue} onClick={handleClick}  ><i className="fa fa-times fa-lg" aria-hidden="true"  ></i></button>
                </motion.div>

            )
        })

    }

    return (
        <RenderCards courseData={courseData} />
    )
}

export default Card;