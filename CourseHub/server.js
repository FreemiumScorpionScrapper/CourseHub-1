const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const User = require('./user');
const JWT = require('jsonwebtoken');
const passportConfig = require('./passportConfig');
const Coursera = require('./coursera');
const metaphone = require('metaphone');

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
        secret: 'secretcode',
        resave: false,
        saveUninitialized: false,
    }));

app.use(cookieParser('secretcode'))
app.use(passport.initialize())
app.use(passport.session())


// app.post('/login', (req, res, next) => {
//     passport.authenticate('local', (err, user, info) => {
//         if (err)
//             throw err;
//         if (!user)
//             res.send("No User Exists");
//         else {
//             req.logIn(user, err => {
//                 if (err) throw err;
//                 else {
//                     res.send(user)
//                     console.log(user)
//                 }
//             })
//         }
//     })(req, res, next);
// })

const signToken = userID => {
    return JWT.sign({
        iss: "Tanishq",
        sub: userID
    }, "secretcode", { expiresIn: "1h" });
}

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

    console.log()
    Coursera.find({ 'slug': { "$in": req.body.slug } }, (err, doc) => {
        if (err) {
            console.log(err);
        }
        else {
            res.status(200).json({ course: doc });
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
            console.log(courses, "courses\n")
            console.log(removedCourses, "removed")

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
        const regex = new RegExp(escapeRegex(metaphone(req.body.keyword)), 'gi');
        Coursera.find({ "metaphoneName": req.body.keyword }, (err, result) => {
            if (err) {
                console.log(err);
            }
            else {

                if (result.length < 2) {
                    Coursera.find({ 'metaphoneDescription': regex }, (err, result2) => {
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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


app.listen(4000, () => {
    console.log('Listening at port 4000');
});

