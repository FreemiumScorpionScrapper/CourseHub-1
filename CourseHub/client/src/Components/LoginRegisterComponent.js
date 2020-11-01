import React, { Component, useContext } from "react";
import AuthService from "../Services/AuthService";
class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            registerUsername: '',
            registerPassword: '',
            loginUsername: '',
            loginPassword: '',
        }

    }

    register = () => {

    }
    login = () => {

    }
    getUser = () => {

    }

    render() {

        return (
            <div>
                <div>
                    <h1>Register</h1>
                    <input placeholder="Username" onChange={(e) => { this.setState({ registerUsername: e.target.value }) }} />
                    <input placeholder="Password" onChange={(e) => { this.setState({ registerPassword: e.target.value }) }} />
                    <button onClick={this.register}>Submit</button>
                </div>
                <div>
                    <h1>Login</h1>
                    <input placeholder="Username" onChange={(e) => { this.setState({ loginUsername: e.target.value }) }} />
                    <input placeholder="Password" onChange={(e) => { this.setState({ loginPassword: e.target.value }) }} />
                    <button onClick={this.login}>Submit</button>
                </div>
                <div>
                    <h1>Get User</h1>
                    <button onClick={this.getUser}>Submit</button>
                </div>
            </div>
        )
    }
}

export default Login;