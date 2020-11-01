const { default: Axios } = require('axios');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const Coursera = require('./coursera');
const metaphone = require('metaphone');
const cheerio = require('cheerio');


mongoose.connect('mongodb://localhost/coursehub', { useNewUrlParser: true });

mongoose.connection.once('open', () => {
    console.log("connected to mongodb");
}).on('error', (err) => {
    console.log('connection error:', err)
});



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







(async () => {
    const udacity = "https://www.udacity.com/courses/all"
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(udacity, { waitUntil: "networkidle2" });
    const data = await page.$$('.catalog-component');

    for (const d of data) {
        // console.log(d);
        const department = await d.$eval('.card__title__school', school => school.innerText).catch(err => {
            return ("");
        });
        const name = await d.$eval('.card__title__nd-name', name => name.innerText).catch(err => {
            return ("");
        });
        const skills = await d.$eval('p.text-content__text', skill => skill.innerText).catch(err => {
            return ("");
        })


        const midContents = await d.$('.card__text-content');
        const midContentsInner = await midContents.$$('section');
        const collab = midContentsInner[1] ? await midContentsInner[1].$eval('p.text-content__text', (data) => data.innerText).catch(err => {
            console.log(err);
            return ('');
        }) : '';

        const detailContainer = await d.$('.details__layout');
        const description = await detailContainer.$eval('p', (des) => des.innerText);

        const difficulty = await d.$eval('small', small => small.innerText);

        const courseLink = await d.$eval('.card__top', a => a.href);


        const newUdacity = new Coursera({
            courseProvider: 'Udacity',
            courseType: '',
            partnerLogo: collab ? collab : '',
            description: description ? description : '',
            domainTypes: [{ subdomainId: '', domainId: '' }],
            photoUrl: '',
            categories: skills ? [skills] : [],
            courseId: courseLink ? courseLink : '',
            slug: courseLink ? courseLink : '',
            name: name ? name : '',
            instructorIds: [],
            partnerIds: collab ? [collab] : [],
            specializations: [],
            workload: difficulty ? difficulty : '',
            primaryLanguages: ['en'],
            metaphoneDescription: metaphone(skills),
            metaphoneName: metaphone(name)
        });
        await newUdacity.save(err => {
            if (err) {
                console.log(err);
            }
            else {
                console.log("\ndone", name);
            }
        })







        // let imgContainer = await d.$eval('.card__image', img => {
        //     return img.style.backgroundImage;
        // });




        // const collab = midContents[1] ? await midContents[1].$eval('p.text-content__text', collab => collab.innerText).catch(err => {
        //     return ("");
        // }) : '';

    }

    await browser.close();
})();

// Axios.get('https://www.udacity.com/courses/all').then(data => data).then(data => data).then(data => {
//     return JSON.parse(data);

// }).then(data => {
//     console.log(data)
// })

// const $ = cheerio.load('https://www.udacity.com/courses/all');
// const dataa = $('.catalog-component');

// console.log(dataa.children);
