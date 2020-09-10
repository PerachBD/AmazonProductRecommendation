const axios = require('axios');
const { extractAllQuestionsAndAnswersSectionLink,extractQuestionAndAnswerLinks,extractQuestionAndAnswers,extractFirstProductFromSearcPage } = require('./htmlParser');

const handleJob = async (productLink) => {
    try{
        const respProductLink = await axios.get(productLink);
        const AllquestionsAndAnswersLink = extractAllQuestionsAndAnswersSectionLink(respProductLink.data);
        
        const respAllquestionsAndAnswersLink = await axios.get(AllquestionsAndAnswersLink);
        const questionAndAnswersLinks = await extractQuestionAndAnswerLinks(get_base_url(AllquestionsAndAnswersLink),respAllquestionsAndAnswersLink.data);
        const questionsAndAnswers=[];
        for(let questionAndAnswerLink of questionAndAnswersLinks){
            const respQuestionsAndAnswersLink = await axios.get(questionAndAnswerLink);
            questionsAndAnswers.push(await extractQuestionAndAnswers(get_base_url(AllquestionsAndAnswersLink),respQuestionsAndAnswersLink.data))
        }


        return questionsAndAnswers;
        // Error while accessing url
    }catch(err){
        console.error(err.toString());
        return err;
    };
}

const getProductLink = async (productStr) => {
    productStr=productStr.split(" ").join("+");
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