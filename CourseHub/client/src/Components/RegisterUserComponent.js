import React, { Component, useContext, useState } from "react";
import Axios from 'axios';
import { Redirect, withRouter } from "react-router";
import { AuthContext } from "../Context/AuthContext";
import AuthService from "../Services/AuthService";


function User(props) {

    const authContext = useContext(AuthContext);


    // initialize state
    const [isValid, setIsValid] = useState({ value: false, msg: '' });
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [registerSuccess, setRegisterSuccess] = useState('');

    const handleBlur = (e) => {
        validate(e.target.name, e.target.value)
        e.target.addEventListener('change', (e) => {
            validate(e.target.name, e.target.value)
        })
    }


    const validate = (type, value) => {
        const string = value.trim();
        if (type === 'registerUsername') {
            if (string.length > 16 || string.length < 3) {
                setIsValid({ value: false, msg: "Username must be greater than 3 characters and less than 16 characters" });
                return false;
            }
            else {
                setIsValid({ value: false, msg: "" });

                return true;
            }
        }
        if (type === 'registerEmail') {
            if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{1,4}$/i.test(value) === false) {
                setIsValid({ value: false, msg: "\nEnter a Valid Email" })
                return false;
            }
            else {
                setIsValid({ value: true, msg: '' })

            }
        }

        if (type === "registerConfirmPassword") {
            if (value !== registerPassword) {
                setIsValid({ value: false, msg: "Password Does Not Match" })
                return false;
            }
            else {
                setIsValid({ value: true, msg: "" })

                return true;
            }
        }
    }

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.name === 'registerUsername') {
            setRegisterUsername(e.target.value.trim());
        }
        else if (e.target.name === 'registerName')
            setRegisterName(e.target.value);
        else if (e.target.name === 'registerEmail') {
            setRegisterEmail(e.target.value);


        }
        else if (e.target.name === 'registerPassword')
            setRegisterPassword(e.target.value);
        else if (e.target.name === 'registerConfirmPassword')
            setRegisterConfirmPassword(e.target.value);
        else if (e.target.name === 'loginUsername')
            setLoginUsername(e.target.value);
        else if (e.target.name === 'loginPassword') {
            setLoginPassword(e.target.value);
        }
    }

    const register = (e) => {
        e.preventDefault();
        if (true) {

            AuthService.register({
                name: registerName.trim(),
                email: registerEmail,
                username: registerUsername,
                password: registerPassword
            }).then(data => {
                if (data.message.msgError) {
                    setRegisterSuccess('');
                    setRegisterError(data.message.msgBody);
                }
                else {
                    setRegisterError('')
                    setRegisterSuccess(data.message.msgBody);
                }
            })
        }
    }

    const login = (e) => {
        e.preventDefault();
        AuthService.login({
            username: loginUsername,
            password: loginPassword
        }).then(data => {
            const { isAuthenticated, user, message } = data;
            if (isAuthenticated) {
                authContext.setUser(user);
                authContext.setIsAuthenticated(isAuthenticated);
                console.log(authContext.isAuthenticated)
                props.history.push('/dashboard');
            }
            else {
                setLoginError("Username/Password Incorrect");
            }

        })

    }


    return (
        <div className='registration-container'>
            <div className='form registration-form'>
                <h1>Register</h1>
                <div >
                    <form onSubmit={register}>
                        <input
                            onBlur={handleBlur}
                            required={true}
                            name='registerName'
                            placeholder='Name'
                            type='text'
                            value={registerName}
                            onChange={handleChange}
                        />
                        <input
                            onBlur={handleBlur}
                            required={true}
                            name='registerUsername'
                            placeholder='Username'
                            type='text'
                            value={registerUsername}
                            onChange={handleChange} />
                        <input
                            onBlur={handleBlur}
                            required={true}
                            name='registerEmail'
                            placeholder='Email'
                            type='email'
                            value={registerEmail}
                            onChange={handleChange}
                        />
                        <input
                            onBlur={handleBlur}
                            required={true}
                            name='registerPassword'
                            placeholder='Password'
                            type='password'
                            value={registerPassword}
                            onChange={handleChange}
                        />
                        <input
                            onBlur={handleBlur}
                            required={true}
                            name='registerConfirmPassword'
                            placeholder='Confirm Password'
                            type='password'
                            value={registerConfirmPassword}
                            onChange={handleChange}
                        />
                        {(isValid.value === false && isValid.msg !== "") ? <div className='message error-message'> {isValid.msg} </div> : null}
                        {registerError && <div className='message error-message'>{registerError}</div>}
                        {registerSuccess && <div className='message success-message'> {registerSuccess} </div>}
                        <button type='submit'>Register</button>
                    </form>
                </div>
            </div>
            <hr />
            <div className='form login-form'>
                <h1>Login</h1>
                <div >
                    <form onSubmit={login}>
                        <input
                            required={true}
                            minLength='3'
                            name='loginUsername'
                            placeholder='Username'
                            type='text'
                            value={loginUsername}
                            onChange={handleChange} />

                        <input
                            required={true}
                            name='loginPassword'
                            placeholder='Password'
                            type='password'
                            value={loginPassword}
                            onChange={handleChange}
                        />
                        {loginError === '' ? null : <div className="message error-message">{loginError}</div>}

                        <button type="submit">Login</button>
                    </form>
                </div>
            </div>


        </div>
    )

}


export default withRouter(User);


















// { isAuthenticated, user, setIsAuthenticated, setUser } = useContext(AuthContext);




// class RegisterUser extends Component {
//     constructor(props) {

//         super(props);
//         this.state = {
//             registerName: '',
//             registerEmail: '',
//             registerUsername: '',
//             registerPassword: '',
//             confirmPassword: '',
//             loginUsername: '',
//             loginPassword: ''
//         }
//     }

//     register = () => {
//         AuthService.register({
//             name: this.state.registerName,
//             email: this.state.registerEmail,
//             username: this.state.registerUsername,
//             password: this.state.registerPassword
//         }).then(data => {
//             console.log(data);
//         })


//     }

//     login = () => {
//         AuthService.login({
//             username: this.state.loginUsername,
//             password: this.state.loginPassword
//         }).then(data => {
//             this.props.setIsAuthenticated(data.isAuthenticated);
//             this.props.setUser(data.user);
//         })

//     }

//     handleChange = (e) => {
//         this.setState({ [e.target.name]: e.target.value });

//     }

//     render() {
//         return (
//             <div className='registration-container'>
//                 <div className='form registration-form'>
//                     <h1>Register</h1>
//                     <div >
//                         <input
//                             name='registerName'
//                             placeholder='Name'
//                             type='text'
//                             value={this.state.registerName}
//                             onChange={this.handleChange}
//                         />
//                         <input
//                             name='registerUsername'
//                             placeholder='Username'
//                             type='text'
//                             value={this.state.registerUsername}
//                             onChange={this.handleChange} />
//                         <input
//                             name='registerEmail'
//                             placeholder='Email'
//                             type='email'
//                             value={this.state.registerEmail}
//                             onChange={this.handleChange}
//                         />
//                         <input
//                             name='registerPassword'
//                             placeholder='Password'
//                             type='password'
//                             value={this.state.registerPassword}
//                             onChange={this.handleChange}
//                         />
//                         <input
//                             name='confirmPassword'
//                             placeholder='Confirm Password'
//                             type='password'
//                             value={this.state.confirmPassword}
//                             onChange={this.handleChange}
//                         />
//                         <button onClick={this.register}>Register</button>
//                     </div>
//                 </div>
//                 <hr />
//                 <div className='form login-form'>
//                     <h1>Login</h1>
//                     <div >

//                         <input
//                             name='loginUsername'
//                             placeholder='Username'
//                             type='text'
//                             value={this.state.loginUsername}
//                             onChange={this.handleChange} />

//                         <input
//                             name='loginPassword'
//                             placeholder='Password'
//                             type='password'
//                             value={this.state.loginPassword}
//                             onChange={this.handleChange}
//                         />

//                         <button onClick={this.login}>Login</button>
//                     </div>
//                 </div>


//             </div>
//         )
//     }
// }
