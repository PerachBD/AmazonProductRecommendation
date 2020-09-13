const axios = require('axios');
const pLimit = require('p-limit');
const { extractAllQuestionsAndAnswersSectionLink, extractQuestionsLinks, extractQuestionAndAnswers, extractFirstProductFromSearchPage } = require('./htmlParser');
const { scoreAnswers } = require('./analyzeRecommendations');
const constants = require('./utils/constants');
const limit = pLimit(30);

const handleJob = async (productLink) => {
    console.log("starting working on job");
    try {
        // get product page content
        const respProductLink = await axios.get(productLink);
        // gets the link to All product Q&A
        const AllquestionsAndAnswersLink = extractAllQuestionsAndAnswersSectionLink(respProductLink.data);

        // get All Q&A page content
        const respAllquestionsAndAnswersLink = await axios.get(AllquestionsAndAnswersLink);
        // get All questions links
        const questionAndAnswersLinks = await extractQuestionsLinks(respAllquestionsAndAnswersLink.data);
        const questionsAndAnswersPromises = [];
        // get pages content asynchronous way
        for (let questionAndAnswerLink of questionAndAnswersLinks) {
            questionsAndAnswersPromises.push(limit(()=>axios.get(questionAndAnswerLink)));
        }
        const questionsAndAnswers = [];
        await Promise.all(questionsAndAnswersPromises).then(async(results) => {
            for (let result of results) {
                // get for question page the question and answers includes
                questionsAndAnswers.push(await extractQuestionAndAnswers(result.data))
            }
        })
        // get score that represents the positivity of the answers
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

//return amazon product link by its name
const getProductLink = async (productStr) => {
    productStr = productStr.split(" ").join("+");
    const searchLink = `${constants.baseUrl}/s?k=${productStr}`
    const searchPage = await axios.get(searchLink);
    const productLink = extractFirstProductFromSearchPage(searchPage.data);
    return productLink;
}
exports.handleJob = handleJob;
exports.getProductLink = getProductLink;