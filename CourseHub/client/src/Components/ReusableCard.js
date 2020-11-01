import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from "../Context/AuthContext";
import AuthService from "../Services/AuthService";


function Card(props) {
    const [courseData, setCourseData] = useState([]);
    const authContext = useContext(AuthContext);

    useEffect(() => {
        setCourseData(props.courseData);
    }, [props])
    const handleClick = (e) => {
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
                const removed = courseData.filter(course => course.slug !== remove.remove);
                console.log(removed);
                setCourseData(removed);
                console.log(courseData)
            })
    }
    const RenderCards = (props) => {
        return props.courseData.map((d, i) => {
            let courseUrl = '';
            if (d.courseProvider === "Coursera") {
                courseUrl = `https://www.coursera.org/learn/${d.slug}`;
            }
            else if (d.courseProvider === 'Udacity') {
                courseUrl = d.slug ? d.slug : '';
            }
            return (

                <div key={i} className="reusable-card"  >
                    <img src={d.photoUrl} />
                    <a href={courseUrl}><h2 className='reusable-card-heading'>{d.name}</h2></a>
                    <p className='reusable-card-body' >{d.description.substring(0, 300)}. . .</p>
                    <button className='remove-button' value={d.slug} onClick={handleClick}  ><i className="fa fa-times fa-lg" aria-hidden="true"  ></i></button>
                </div>

            )
        })

    }

    return (
        <RenderCards courseData={courseData} />
    )
}

export default Card;