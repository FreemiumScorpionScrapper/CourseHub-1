
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Results from './CourseComponent'
import { motion } from 'framer-motion'
import { PageTransition, PageVariants } from "../Services/AnimationService";


function Search(props) {
    const [keyword, setKeyword] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    const handleChange = (e) => {
        setKeyword(e.target.value);
        if (e.target.value.length === 0) {
            suggestionsBlur();
        }
        else {
            const data = { keyword: e.target.value.trim() }
            fetch('/suggestions',
                {
                    method: 'post',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then((res) => res.json()).then(data => {
                    setSuggestions(data.result);
                })
        }

    }

    const RenderSuggestions = () => {
        if (suggestions.length === 0)
            return null;
        else {

            return (suggestions.map((suggestion, index) => {
                let courseUrl = '';
                if (suggestion.courseProvider === "Coursera") {
                    courseUrl = `https://www.coursera.org/learn/${suggestion.slug}`;
                }
                else if (suggestion.courseProvider === 'Udacity') {
                    courseUrl = props.data ? props.data.slug : '';
                }
                return (
                    <a target='_blank' key={index} href={courseUrl}>
                        <div
                            className={`suggestion-item ${suggestion.courseProvider}`}
                        >
                            {suggestion.name}
                        </div>
                    </a>
                )


            }))
        }

    }
    const suggestionsBlur = (e) => {
        setTimeout(() => {
            setSuggestions([]);
        }, 100)
    }
    const handleSubmit = (e) => {

        const data = { keyword: keyword.trim() }
        e.preventDefault();
        fetch('/search',
            {
                method: 'post',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((res) => res.json()).then(data => {
                setSearchResults(data.result);
                setSuggestions([]);
            })
    }
    return (
        <>
            <motion.div
                exit='out'
                initial='out'
                animate='in'
                variants={PageVariants}
                transition={PageTransition} className="main-search"
            >
                <h1 className="brand-huge">CourseHub</h1>
                <div className='search-box-container'>
                    <form onSubmit={handleSubmit} className="search-box-form" >
                        <div autoFocus >
                            <input className="search-box" type="text" placeholder="Let's Find Your Next Course!" autoFocus onChange={handleChange} onBlur={suggestionsBlur} />
                            <div className="suggestions">
                                <RenderSuggestions />
                            </div>
                        </div>
                        <button type='submit' className="search-button">
                            <i className="fa fa-search fa-lg" aria-hidden="true"></i>
                        </button>
                    </form>
                </div>
            </motion.div>
            {searchResults.length !== 0 ?
                <Results data={searchResults} />

                : null}

        </>
    )
}

export default Search;