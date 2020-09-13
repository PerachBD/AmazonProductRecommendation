const axios = require('axios');
const pLimit = require('p-limit');
const { extractAllQuestionsAndAnswersSectionLink, extractQuestionAndAnswerLinks, extractQuestionAndAnswers, extractFirstProductFromSearcPage } = require('./htmlParser');
const { scoreAnswers } = require('./analyzeRecommendations');
const limit = pLimit(30);

const handleJob = async (productLink) => {
    console.log("starting working on job");
    try {
        const respProductLink = await axios.get(productLink);
        const AllquestionsAndAnswersLink = extractAllQuestionsAndAnswersSectionLink(respProductLink.data);

        const respAllquestionsAndAnswersLink = await axios.get(AllquestionsAndAnswersLink);
        const questionAndAnswersLinks = await extractQuestionAndAnswerLinks(get_base_url(AllquestionsAndAnswersLink), respAllquestionsAndAnswersLink.data);
        const questionsAndAnswersPromises = [];
        for (let questionAndAnswerLink of questionAndAnswersLinks) {
            questionsAndAnswersPromises.push(limit(()=>axios.get(questionAndAnswerLink)));
        }
        const questionsAndAnswers = [];
        await Promise.all(questionsAndAnswersPromises).then(async(results) => {
            for (let result of results) {
                questionsAndAnswers.push(await extractQuestionAndAnswers(get_base_url(AllquestionsAndAnswersLink), result.data))
            }
        })
        const score = scoreAnswers(questionsAndAnswers);
        const msg = {
            command: "searchResult",
            data: { productLink: productLink, allQAndA: questionsAndAnswers, score: score }
        }
        console.log("finish working on job");
        return msg
        // Error while accessing url
    } catch (err) {
        console.error(err.toString());
        const msg = {
            command: "errorOccurred",
            data: { error: err }
        }
        return msg;
    };
}

const getProductLink = async (productStr) => {
    productStr = productStr.split(" ").join("+");
    const baseUrl = 'https://www.amazon.com'
    const searchLink = `${baseUrl}/s?k=${productStr}`
    const searchPage = await axios.get(searchLink);
    const productLink = extractFirstProductFromSearcPage(baseUrl, searchPage.data);
    return productLink;
}


function get_base_url(link) {
    const baseUrlArr = link.split('/');
    baseUrlArr.splice(3);
    return baseUrlArr.join('/');
}
exports.handleJob = handleJob;
exports.getProductLink = getProductLink;