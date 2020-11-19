require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require("nodemailer");
const cors = require('cors');
const metaphone = require('metaphone');
const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const JWT = require('jsonwebtoken');
const passportConfig = require('./passportConfig');

const User = require('./user');
const Coursera = require('./coursera');
const Udemy = require('./udemy');

mongoose.connect('mongodb://localhost/coursehub', { useNewUrlParser: true });

mongoose.connection.once('open', () => {
    console.log("connected to mongodb");
}).on('error', (err) => {
    console.log('connection error:', err)
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))
app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
    }));

app.use(cookieParser(process.env.SECRET))
app.use(passport.initialize())
app.use(passport.session())

const signToken = userID => {
    return JWT.sign({
        iss: "Tanishq",
        sub: userID
    }, process.env.SECRET, { expiresIn: "1h" });
}



app.post('/sendmail', async (req, res) => {
    let receiverEmail = '';
    let receiverName = '';
    let selectedCourses = [];
    let results = [];
    let selectedCourseHTML = ``;
    User.findOne({ _id: req.body.id }, async (err, doc) => {
        if (err) {
            console.log(err);
        } else {
            receiverEmail = doc.email;
            receiverName = doc.name;
            selectedCourses = selectedCourses.concat(doc.selectedCourses);


            Udemy.find({ 'url': { "$in": selectedCourses } }, (err, doc) => {
                if (err) {
                    console.log(err);
                } else {
                    results = results.concat(doc);
                    Coursera.find({ 'slug': { "$in": selectedCourses } }, async (err, doc) => {
                        if (err) {
                            console.log(err);
                        } else {
                            results = results.concat(doc);

                            results.map(result => {
                                let url = ''
                                if (result.courseProvider === 'Coursera') {
                                    url = `https://www.coursera.org/learn/${result.slug}`;
                                }
                                else if (result.courseProvider === 'Udacity') {
                                    url = result.slug
                                }
                                else {
                                    url = result.url
                                }
                                selectedCourseHTML = selectedCourseHTML + `<li><a href="${url}">${result.name}</a></li>`;
                            })



                            let transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: process.env.EMAIL,
                                    pass: process.env.PASSWORD,
                                },
                            });


                            const msg = {
                                from: '"CourseHub" <ziontrav@gmail.com>', // sender address
                                to: receiverEmail, // list of receivers
                                subject: "Courses You are Interested in", // Subject line
                                text: "CourseHub", // plain text body
                                html: `<h1>Hi ${receiverName}!</h1>
                                    <h2>You have Selected the following courses on CourseHub</h2>
                                    <ul>
                                        ${selectedCourseHTML}
                                    </ul>
                                        `, // html body
                            }
                            // send mail with defined transport object
                            let info = await transporter.sendMail(msg);

                            console.log("Message sent: %s", info.messageId);
                            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                            // Preview only available when sending through an Ethereal account
                            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                            res.status(200).json({ message: { msgBody: 'Mail Sent Successfully!', msgError: false } });

                            // res.status(200).json({ course: results });
                        }
                    })
                }
            })
        }
    })
})

app.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
    if (req.isAuthenticated()) {
        const { name, email, _id, username, selectedCourses } = req.user;
        const token = signToken(_id);
        res.cookie('access_token', token, { httpOnly: true, sameSite: true });
        res.status(200).json({ isAuthenticated: true, user: { name, email, _id, username, selectedCourses } });

    }

})

app.get('/logout', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.clearCookie("access_token");
    res.json({ user: { username: "", email: "" }, success: true });
})

app.post('/register', (req, res) => {
    User.findOne({ username: req.body.username }, async (err, doc) => {
        if (err)
            res.status(500).json({ message: { msgBody: 'Error has occured', msgError: true } });
        if (doc)
            res.status(400).json({ message: { msgBody: 'Username is already taken', msgError: true } });
        if (!doc) {
            const hashedPass = await bcrypt.hash(req.body.password, 10);
            const newUser = new User({
                username: req.body.username,
                password: hashedPass,
                email: req.body.email,
                name: req.body.name,
                selectedCourses: [],
                interests: []

            });
            await newUser.save(err => {
                if (err) {
                    res.status(500).json({ message: { msgBody: 'Error has occured', msgError: true } });
                }
                else {
                    res.status(201).json({ message: { msgBody: 'Account successfully created', msgError: false } });
                }
            });

        }


    })
})

app.post('/selectCourse', (req, res) => {
    const _id = req.body._id;
    User.findOne({ _id: _id }, async (err, user) => {
        if (err) {
            console.log(err);
            res.status(500).send();
        }
        else {
            user.selectedCourses.push(req.body.selectedCourse);
            user.save((err, updated) => {
                if (err) {
                    res.status(500).send();
                }
                else {
                    res.status(200).send(' Course Added successfully');
                }
            })
        }
    })
})

app.get('/authenticated', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { name, email, _id, username, selectedCourses } = req.user;
    res.status(200).json({ isAuthenticated: true, user: { name, email, _id, username, selectedCourses } });
});

app.post('/getcourse', (req, res) => {
    if (req.body.courseName) {
        Coursera.find({ 'name': req.body.courseName }, (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                res.status(200).json({ courseData: result });
            }
        })
    }
})

app.post('/getselected', (req, res) => {
    let results = []
    Udemy.find({ 'url': { "$in": req.body.slug } }, (err, doc) => {
        if (err) {
            console.log(err);
        } else {
            results = results.concat(doc);
            Coursera.find({ 'slug': { "$in": req.body.slug } }, (err, doc) => {
                if (err) {
                    console.log(err);
                } else {
                    results = results.concat(doc)
                    console.log(results.length)
                    console.log(req.body.slug)
                    res.status(200).json({ course: results });
                }
            })

        }

    })




})

app.post('/removeselected', (req, res) => {
    User.findOne({ _id: req.body.user }, async (err, doc) => {
        if (err) {
            console.error(err);
        } else {
            const courses = doc.selectedCourses;
            const removedCourses = courses.filter(course => (course !== req.body.remove));

            doc.selectedCourses = removedCourses;

            await doc.save((err, mess) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully Deleted");
                    res.status(200).json({ message: "successfully Deleted" })
                }
            })

        }
    })
})

app.post('/suggestions', (req, res) => {
    if (req.body.keyword) {
        const regex = new RegExp(escapeRegex(metaphone(req.body.keyword)), 'gi');
        Coursera.find({ "metaphoneName": req.body.keyword }, null, { limit: 10 }, (err, result) => {
            if (err) {
                console.log(err);
            }
            else {

                if (result.length < 2) {
                    Coursera.find({ 'metaphoneDescription': regex }, null, { limit: 10 }, (err, result2) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            res.status(200).json({ result: result2 })
                        }
                    })

                }
                else {
                    res.status(200).json({ result: result });
                }
            }
        })
    }
    // else {
    //     res.status(200).json({ result: [] });
    // }
})


app.post('/search', (req, res) => {
    if (req.body.keyword) {
        let results = [];
        const regex = new RegExp(escapeRegex(metaphone(req.body.keyword)), 'gi');
        const regexName = new RegExp(escapeRegex(req.body.keyword), 'gi');
        Udemy.find({ "metaphoneName": regex }, (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                results = results.concat(result);
                if (result.length === 0) {
                    Udemy.find({ 'metaphoneDescription': regex }, (err, result2) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            results = results.concat(result2);
                            if (results.length === 0) {
                                Udemy.find({ 'name': regexName }, (err, result3) => {
                                    if (err) {
                                        console.log(err)
                                    }
                                    else {
                                        results = results.concat(result3);
                                        Coursera.find({ "metaphoneName": regex }, (err, result) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                            else {
                                                results = results.concat(result);

                                                if (result.length === 0) {
                                                    Coursera.find({ 'metaphoneDescription': regex }, (err, result2) => {
                                                        if (err) {
                                                            console.log(err);
                                                        }
                                                        else {
                                                            results = results.concat(result2);
                                                            if (results.length === 0) {
                                                                Coursera.find({ 'name': regexName }, (err, result3) => {
                                                                    if (err) {
                                                                        console.log(err)
                                                                    }
                                                                    else {
                                                                        results = results.concat(result3);
                                                                        res.status(200).json({ result: results })
                                                                    }
                                                                })
                                                            }
                                                            else {
                                                                res.status(200).json({ result: results })
                                                            }
                                                        }
                                                    })

                                                }
                                                else {
                                                    res.status(200).json({ result: results });
                                                }
                                            }
                                        })
                                    }
                                })
                            }
                            else {
                                Coursera.find({ "metaphoneName": regex }, (err, result) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        results = results.concat(result);

                                        if (result.length === 0) {
                                            Coursera.find({ 'metaphoneDescription': regex }, (err, result2) => {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                else {
                                                    results = results.concat(result2);
                                                    if (results.length === 0) {
                                                        Coursera.find({ 'name': regexName }, (err, result3) => {
                                                            if (err) {
                                                                console.log(err)
                                                            }
                                                            else {
                                                                results = results.concat(result3);
                                                                res.status(200).json({ result: results })
                                                            }
                                                        })
                                                    }
                                                    else {
                                                        res.status(200).json({ result: results })
                                                    }
                                                }
                                            })

                                        }
                                        else {
                                            res.status(200).json({ result: results });
                                        }
                                    }
                                })
                            }
                        }
                    })

                }
                else {

                    Coursera.find({ "metaphoneName": regex }, (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            results = results.concat(result);

                            if (result.length === 0) {
                                Coursera.find({ 'metaphoneDescription': regex }, (err, result2) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        results = results.concat(result2);
                                        if (results.length === 0) {
                                            Coursera.find({ 'name': regexName }, (err, result3) => {
                                                if (err) {
                                                    console.log(err)
                                                }
                                                else {
                                                    results = results.concat(result3);
                                                    res.status(200).json({ result: results })
                                                }
                                            })
                                        }
                                        else {
                                            res.status(200).json({ result: results })
                                        }
                                    }
                                })

                            }
                            else {
                                res.status(200).json({ result: results });
                            }
                        }
                    })
                }
            }
        });
    }
    // else {
    //     res.status(200).json({ result: [] });
    // }
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


app.listen(4000, () => {
    console.log('Listening at port 4000');
});

