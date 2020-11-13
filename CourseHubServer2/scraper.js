const { default: Axios } = require('axios');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const Coursera = require('./coursera');
const Udemy = require('./udemy');
const metaphone = require('metaphone');
const cheerio = require('cheerio');


mongoose.connect('mongodb://localhost/coursehub', { useNewUrlParser: true });

mongoose.connection.once('open', () => {
    console.log("connected to mongodb");
}).on('error', (err) => {
    console.log('connection error:', err)
});



const subCategories =
    ["3D & Animation", "Accounting & Bookkeeping", "Advertising", "Affiliate Marketing", "Apple", "Architectural Design", "Arts & Crafts", "Beauty & Makeup", "Branding", "Business Analytics & Intelligence", "Business Law", "Business Strategy", "Career Development", "Commercial Photography", "Communications", "Compliance", "Content Marketing", "Creativity", "Cryptocurrency & Blockchain", "Dance", "Data Science", "Database Design & Development", "Design Thinking", "Design Tools", "Development Tools", "Dieting", "Digital Marketing", "Digital Photography", "E-Commerce", "Economics", "Engineering", "Entrepreneurship", "Esoteric Practices", "Essential Tech Skills", "Fashion Design", "Finance", "Finance Cert & Exam Prep", "Financial Modeling & Analysis", "Fitness", "Food & Beverage", "Game Design", "Game Development", "Gaming", "General Health", "Google", "Graphic Design & Illustration", "Growth Hacking", "Happiness", "Hardware", "Home Improvement", "Human Resources", "Humanities", "Industry", "Influence", "Instruments", "Interior Design", "Investing & Trading", "IT Certification", "Language", "Leadership", "Management", "Marketing Analytics & Automation", "Marketing Fundamentals", "Math", "Media", "Meditation", "Memory & Study Skills", "Mental Health", "Microsoft", "Mobile Development", "Money Management Tools", "Motivation", "Music Fundamentals", "Music Production", "Music Software", "Music Techniques", "Network & Security", "No-Code Development", "Nutrition", "Online Education", "Operating Systems", "Operations", "Oracle", "Other Business", "Other Design", "Other Finance & Accounting", "Other Health & Fitness", "Other IT & Software", "Other Lifestyle", "Other Marketing", "Other Music", "Other Office Productivity", "Other Personal Development", "Other Photography & Video", "Other Teaching & Academics", "Parenting & Relationships", "Personal Brand Building", "Personal Growth & Wellness", "Personal Productivity", "Personal Transformation", "Pet Care & Training", "Photography", "Photography Tools", "Portrait Photography", "Product Marketing", "Productivity & Professional Skills", "Programming Languages", "Project Management", "Public Relations", "Real Estate", "Religion & Spirituality", "Safety & First Aid", "Sales", "SAP", "Science", "Search Engine Optimization", "Self Defense", "Self Esteem & Confidence", "Social Media Marketing", "Social Science", "Software Engineering", "Software Testing", "Sports", "Stress Management", "Taxes", "Teacher Training", "Test Prep", "Travel", "User Experience Design", "Video & Mobile Marketing", "Video Design", "Vocal", "Vodafone", "Web Design", "Web Development", "Yoga"];
let total = 0;
subCategories.map((sub, i) => {

    Axios.get(`https://www.udemy.com/api-2.0/courses/?page=1&page_size=1000&price=price_paid&subcategory=${sub}&fields[course]=title,headline,url,avg_rating,image_100x100`,
        {
            auth: {
                username: "h91IMbyufj4boQkW4opzYCoomhqahViQ2q39R8p6",
                password: "fS4y5IVcJNLQLykt20qnC3jcOgxwmsc48fJG28lsgCb0CjM2ygzkcyyv8YwNG7kfVBhkVUMWGepA6rZinHXNDKLJQlkhr6RALaq0hRYYihV46KGdRvYv19A1sle19rlb"

            }
        })
        .then(async res => res.data)
        .then(async (data) => {
            if (data.count !== 0) {
                nextLink = data.next;

                await data.results.map(async (course, index) => {
                    const newUdemy = new Udemy({
                        courseProvider: 'Udemy',
                        courseType: course._class,
                        description: course.headline ? course.headline : '',
                        subCategory: sub,
                        photoUrl: course.image_100x100,
                        courseId: course.id ? course.id : '',
                        url: course.url ? 'https://www.udemy.com' + course.url : '',
                        name: course.title ? course.title : '',
                        avgRating: course.avg_rating,
                        relevancyScore: course.relevancy_score,
                        metaphoneDescription: metaphone(course.headline),
                        metaphoneName: metaphone(course.title),
                    });
                    await newUdemy.save(err => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("\ndone", (i + index), "   ", course.title);
                        }
                    })
                })
                getNext(data.next, sub);
            }
        })



})

function getNext(link, sub) {
    if (link !== null) {
        Axios.get(link,
            {
                auth: {
                    username: "h91IMbyufj4boQkW4opzYCoomhqahViQ2q39R8p6",
                    password: "fS4y5IVcJNLQLykt20qnC3jcOgxwmsc48fJG28lsgCb0CjM2ygzkcyyv8YwNG7kfVBhkVUMWGepA6rZinHXNDKLJQlkhr6RALaq0hRYYihV46KGdRvYv19A1sle19rlb"

                }
            })
            .then(res => res.data).then(async (data) => {
                if (data.count !== 0) {

                    data.results.map(async (course, i) => {

                        const newUdemy = new Udemy({
                            courseProvider: 'Udemy',
                            courseType: course._class,
                            description: course.headline ? course.headline : '',
                            subCategory: sub,
                            photoUrl: course.image_100x100,
                            courseId: course.id ? course.id : '',
                            url: course.url ? 'https://www.udemy.com' + course.url : '',
                            name: course.title ? course.title : '',
                            avgRating: course.avg_rating,
                            relevancyScore: course.relevancy_score,
                            metaphoneDescription: metaphone(course.headline),
                            metaphoneName: metaphone(course.title),
                        });
                        await newUdemy.save(err => {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                console.log("\nDone Next", i, course.title);
                            }
                        })
                    })
                    getNext(data.next)
                }
            })
    }
    else {
        console.log('next is null');
    }
}






// Axios.get('https://api.coursera.org/api/courses.v1?limit=5203&fields=instructorIds,partnerIds,specializations,domainTypes,categories,description,workload,primaryLanguages,partnerLogo,photoUrl')
//     .then(res => res.data)
//     .then(async (data) => {
//         data.elements.map(async (d, index) => {
//             const newCoursera = new Coursera({
//                 courseProvider: 'Coursera',
//                 courseType: d.courseType ? d.courseType : '',
//                 partnerLogo: d.partnerLogo ? d.partnerLogo : '',
//                 description: d.description ? d.description : '',
//                 domainTypes: d.domainTypes ? d.domainTypes : [{ subdomainId: '', domainId: '' }],
//                 photoUrl: d.photoUrl ? d.photoUrl : '',
//                 categories: d.categories ? d.categories : [],
//                 courseId: d.id ? d.id : '',
//                 slug: d.slug ? d.slug : '',
//                 name: d.name ? d.name : '',
//                 instructorIds: d.instructorIds ? d.instructorIds : [],
//                 partnerIds: d.partnerIds ? d.partnerIds : [],
//                 specializations: d.specializations ? d.specializations : [],
//                 workload: d.workload ? d.workload : '',
//                 primaryLanguages: d.primaryLanguages ? d.primaryLanguages : [],
//                 metaphoneDescription: metaphone(d.description),
//                 metaphoneName: metaphone(d.name)
//             });
//             await newCoursera.save(err => {
//                 if (err) {
//                     console.log(err);
//                 }
//                 else {
//                     console.log("\ndone", index);
//                 }
//             })
//         })
//     })







//     (async () => {
//         const udacity = "https://www.udacity.com/courses/all"
//         const browser = await puppeteer.launch({ headless: true });
//         const page = await browser.newPage();

//         await page.goto(udacity, { waitUntil: "networkidle2" });
//         const data = await page.$$('.catalog-component');

//         for (const d of data) {
//             // console.log(d);
//             const department = await d.$eval('.card__title__school', school => school.innerText).catch(err => {
//                 return ("");
//             });
//             const name = await d.$eval('.card__title__nd-name', name => name.innerText).catch(err => {
//                 return ("");
//             });
//             const skills = await d.$eval('p.text-content__text', skill => skill.innerText).catch(err => {
//                 return ("");
//             })


//             const midContents = await d.$('.card__text-content');
//             const midContentsInner = await midContents.$$('section');
//             const collab = midContentsInner[1] ? await midContentsInner[1].$eval('p.text-content__text', (data) => data.innerText).catch(err => {
//                 console.log(err);
//                 return ('');
//             }) : '';

//             const detailContainer = await d.$('.details__layout');
//             const description = await detailContainer.$eval('p', (des) => des.innerText);

//             const difficulty = await d.$eval('small', small => small.innerText);

//             const courseLink = await d.$eval('.card__top', a => a.href);


//             const newUdacity = new Coursera({
//                 courseProvider: 'Udacity',
//                 courseType: '',
//                 partnerLogo: collab ? collab : '',
//                 description: description ? description : '',
//                 domainTypes: [{ subdomainId: '', domainId: '' }],
//                 photoUrl: '',
//                 categories: skills ? [skills] : [],
//                 courseId: courseLink ? courseLink : '',
//                 slug: courseLink ? courseLink : '',
//                 name: name ? name : '',
//                 instructorIds: [],
//                 partnerIds: collab ? [collab] : [],
//                 specializations: [],
//                 workload: difficulty ? difficulty : '',
//                 primaryLanguages: ['en'],
//                 metaphoneDescription: metaphone(skills),
//                 metaphoneName: metaphone(name)
//             });
//             await newUdacity.save(err => {
//                 if (err) {
//                     console.log(err);
//                 }
//                 else {
//                     console.log("\ndone", name);
//                 }
//             })







            // let imgContainer = await d.$eval('.card__image', img => {
            //     return img.style.backgroundImage;
            // });




            // const collab = midContents[1] ? await midContents[1].$eval('p.text-content__text', collab => collab.innerText).catch(err => {
            //     return ("");
            // }) : '';

//         }

// await browser.close();
//     }) ();

// Axios.get('https://www.udacity.com/courses/all').then(data => data).then(data => data).then(data => {
//     return JSON.parse(data);

// }).then(data => {
//     console.log(data)
// })

// const $ = cheerio.load('https://www.udacity.com/courses/all');
// const dataa = $('.catalog-component');

// console.log(dataa.children);




// data.elements.map(async (d, index) => {
//     const newCoursera = new Coursera({
//         courseProvider: 'Coursera',
//         courseType: d.courseType ? d.courseType : '',
//         partnerLogo: d.partnerLogo ? d.partnerLogo : '',
//         description: d.description ? d.description : '',
//         domainTypes: d.domainTypes ? d.domainTypes : [{ subdomainId: '', domainId: '' }],
//         photoUrl: d.photoUrl ? d.photoUrl : '',
//         categories: d.categories ? d.categories : [],
//         courseId: d.id ? d.id : '',
//         slug: d.slug ? d.slug : '',
//         name: d.name ? d.name : '',
//         instructorIds: d.instructorIds ? d.instructorIds : [],
//         partnerIds: d.partnerIds ? d.partnerIds : [],
//         specializations: d.specializations ? d.specializations : [],
//         workload: d.workload ? d.workload : '',
//         primaryLanguages: d.primaryLanguages ? d.primaryLanguages : [],
//         metaphoneDescription: metaphone(d.description),
//         metaphoneName: metaphone(d.name)
//     });
//     await newCoursera.save(err => {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             console.log("\ndone", index);
//         }
//     })
// })






