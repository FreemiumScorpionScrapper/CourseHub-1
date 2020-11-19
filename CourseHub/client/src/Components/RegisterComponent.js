import React, { useState } from 'react';
import { withRouter } from 'react-router';
import AuthService from '../Services/AuthService';
import { motion } from 'framer-motion';
import { PageTransition, PageVariants } from "../Services/AnimationService";

function Register(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [isValid, setIsValid] = useState({ value: false, msg: '' });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isValid.value) {
            AuthService.register({
                name: name.trim(),
                email: email,
                username: username,
                password: password
            }).then(data => {
                if (data.message.msgError) {
                    setRegisterError(data.message.msgBody);
                }
                else {
                    setRegisterError('')
                    props.history.push('/authorize');
                }
            })
        }
    }

    const handleChange = (e) => {
        if (e.target.name === "username") {
            setUsername(e.target.value.trim());
        } else if (e.target.name === "password") {
            setPassword(e.target.value);
        } else if (e.target.name === "name") {
            setName(e.target.value);
        } else if (e.target.name === "email") {
            setEmail(e.target.value);
        } else if (e.target.name === "confirmPassword") {
            setConfirmPassword(e.target.value);
        }
    }

    const handleBlur = (e) => {
        validate(e.target.name, e.target.value)
        e.target.addEventListener('change', (e) => {
            validate(e.target.name, e.target.value)
        })
    }


    const validate = (type, value) => {
        const string = value.trim();
        if (type === 'username') {
            if (string.length > 16 || string.length < 3) {
                setIsValid({ value: false, msg: "Username must be greater than 3 characters and less than 16 characters" });
                return false;
            }
            else {
                setIsValid({ value: false, msg: "" });
                return true;
            }
        }
        if (type === 'email') {
            if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{1,4}$/i.test(value) === false) {
                setIsValid({ value: false, msg: "\nEnter a Valid Email" })
                return false;
            }
            else {
                setIsValid({ value: true, msg: '' })
            }
        }

        if (type === "confirmPassword") {
            if (value !== password) {
                setIsValid({ value: false, msg: "Password Does Not Match" })
                return false;
            }
            else {
                setIsValid({ value: true, msg: "" })
                return true;
            }
        }
    }

    return (
        <motion.div
            exit='out'
            initial='out'
            animate='in'
            variants={PageVariants}
            transition={PageTransition}
            className="form-page">
            <div className="form-card register-card">
                <div className="form-heading">Register</div>
                <div>
                    <form onSubmit={handleSubmit}>
                        <input required={true} type="text" placeholder="Name" value={name} name="name" onChange={handleChange} onBlur={handleBlur} />
                        <input required={true} type="email" placeholder="Email" value={email} name="email" onChange={handleChange} onBlur={handleBlur} />
                        <input required={true} type="text" placeholder="Username" value={username} name="username" onChange={handleChange} onBlur={handleBlur} />
                        <input required={true} type="password" placeholder="Password" value={password} name="password" onChange={handleChange} onBlur={handleBlur} />
                        <input required={true} type="password" placeholder="Confirm Password" value={confirmPassword} name="confirmPassword" onChange={handleChange} onBlur={handleBlur} />
                        {registerError === '' ? <div></div> : <div className="form-error">{registerError}</div>}
                        {isValid.value === false ? <div className="form-error">{isValid.msg}</div> : <div></div>}
                        <button className="register-button" type="submit">Register</button>
                    </form>
                </div>
            </div>
        </motion.div>
    )
}

export default withRouter(Register);