const HTMLParser = require('node-html-parser');
const axios = require('axios');
const constants = require('./utils/constants');

// gets the link to All product Q&A
const extractAllQuestionsAndAnswersSectionLink = (htmlcontent) => {
    try {
        const root = HTMLParser.parse(htmlcontent);
        const q_a_div = root.querySelector('.cdQuestionLazySeeAll').toString();
        const q_a_div_child = HTMLParser.parse(q_a_div);
        q_a_a_tag = q_a_div_child.querySelector('a');
        link = q_a_a_tag.getAttribute("href");
        return link;
    } catch (err) {
        console.error(err.toString());
        return err;
    };
}
// get All questions links
const extractQuestionsLinks = async ( htmlcontent) => {

    let root = HTMLParser.parse(htmlcontent);
    const result = []
    result.push(...extractQuestionLink( htmlcontent));

    const pagesContent = [];
    const pagesLinks = getPagesLinks( root);
    // get pages content asynchronous way
    for (let pageLink of pagesLinks) {
        pagesContent.push(axios.get(pageLink));
    }
    let contents;
    await Promise.all(pagesContent).then(result => contents = result)
    for (let content of contents) {
        result.push(...extractQuestionLink(content.data));
    }
    return result
}
// get for question page the question and answers includes
const extractQuestionAndAnswers = async (htmlcontent) => {

    let root = HTMLParser.parse(htmlcontent);
    const questionString = getQuestionString(root)
    const questionDate = getQuestionDate(root);

    const answers = [];
    answers.push(...getAnswersListfromPage(root));

    const pagesContent = [];
    const pagesLinks = getPagesLinks( root);
    // get pages content asynchronous way
    for (let pageLink of pagesLinks) {
        pagesContent.push(axios.get(pageLink));
    }
    let contents;
    await Promise.all(pagesContent).then(result => contents = result)
    for (let content of contents) {
        root = HTMLParser.parse(content.data);
        answers.push(...getAnswersListfromPage(root));
    }

    return { question: questionString, questionDate, answers: answers }
}
// get questions links from one page content
const extractQuestionLink = (htmlcontent) => {
    try {
        const root = HTMLParser.parse(htmlcontent);
        if (!root.querySelector('.askTeaserQuestions')) return [];
        const q_a_div = root.querySelector('.askTeaserQuestions').toString();
        const q_a_div_child = HTMLParser.parse(q_a_div);
        const links_elements = q_a_div_child.querySelectorAll('a');
        const Contained_links = [];
        for (let link_element of links_elements) {
            let q_link = link_element.getAttribute("href");
            const fullUrl = constants.baseUrl + q_link
            if (q_link.startsWith('/ask/questions/') && !Contained_links.includes(fullUrl)) {
                Contained_links.push(fullUrl);
            }
        }

        return Contained_links;
    } catch (err) { return err }
}
// get the question from one question page content
const getQuestionString = (root) => {
    const q_p = root.querySelectorAll('.askAnswersAndComments')[0].toString();
    const q_p_child = HTMLParser.parse(q_p);
    const questionString = q_p_child.querySelector('span').rawText;
    return questionString;
}
// get the question date from one question page content
const getQuestionDate = (root) => {
    const questionDate = root.querySelectorAll('.a-spacing-top-mini')[1].rawText.replace('asked on ', '');
    return questionDate;
}
// get the answuers from one answers page content
const getAnswersListfromPage = (root) => {
    let answersStrings = [];
    if (root.querySelectorAll('.askAnswersAndComments').length >= 2) {
        const answers_div = root.querySelectorAll('.askAnswersAndComments')[1].childNodes;
        let answers = []
        for (let i of answers_div) {
            if (i.tagName == "div") answers.push(i)
        }

        for (let i of answers) {
            for (let child of i.childNodes) {
                if (child.tagName == "span" && child.getAttribute('class') !== "noScriptDisplayLongText")
                    answersStrings.push(child.rawText.split("\r").join("").split("\n").join(" ").trim())
            }
        }
    }
    return answersStrings;
}
// get list of pages links
const getPagesLinks = (root) => {
    try {
        let aNormalList = root.querySelectorAll('.a-normal')
        if (aNormalList && aNormalList.length) {
            let numberOfPages = aNormalList[aNormalList.length - 1].childNodes[0].rawText;
            lastPageLink = aNormalList[aNormalList.length - 1].childNodes[0].getAttribute('href');
            let splitedLink = lastPageLink.split(`/${numberOfPages}`);
            let before = splitedLink[0];
            const links = [];
            for (let i = 1; i <= numberOfPages; i++) {
                links.push(`${constants.baseUrl}${before}/${i + 1}`)
            }
            return links
        }
        return []
    } catch (err) { return [] }
}
//get amazons product link 
const extractFirstProductFromSearchPage = ( htmlcontent) => {
    let root = HTMLParser.parse(htmlcontent);
    const firstProductLink = constants.baseUrl + root.querySelectorAll('.s-no-outline')[1].getAttribute('href');
    return firstProductLink;
}


exports.extractAllQuestionsAndAnswersSectionLink = extractAllQuestionsAndAnswersSectionLink;
exports.extractQuestionsLinks = extractQuestionsLinks;
exports.extractQuestionAndAnswers = extractQuestionAndAnswers;
exports.extractFirstProductFromSearchPage = extractFirstProductFromSearchPage;