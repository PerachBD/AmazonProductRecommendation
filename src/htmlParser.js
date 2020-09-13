const HTMLParser = require('node-html-parser');
const axios = require('axios');

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
const extractQuestionAndAnswerLinks = async (baseUrl, htmlcontent) => {

    let root = HTMLParser.parse(htmlcontent);
    const result = []
    result.push(...extractQuestionLink(baseUrl, htmlcontent));

    const pagesContent = [];
    const pagesLinks = getPagesLinks(baseUrl, root);
    for (let pageLink of pagesLinks) {
        pagesContent.push(axios.get(pageLink));
    }
    let contents;
    await Promise.all(pagesContent).then(result => contents = result)
    for (let content of contents) {
        result.push(...extractQuestionLink(baseUrl, content.data));
    }
    return result
}

const extractQuestionAndAnswers = async (baseUrl, htmlcontent) => {

    let root = HTMLParser.parse(htmlcontent);
    const questionString = getQuestionString(root)
    const questionDate = getQuestionDate(root);

    const answers = [];
    answers.push(...getAnswersListfromPage(root));

    const pagesContent = [];
    const pagesLinks = getPagesLinks(baseUrl, root);
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

const extractQuestionLink = (baseUrl, htmlcontent) => {
    try {
        const root = HTMLParser.parse(htmlcontent);
        if (!root.querySelector('.askTeaserQuestions')) return [];
        const q_a_div = root.querySelector('.askTeaserQuestions').toString();
        const q_a_div_child = HTMLParser.parse(q_a_div);
        const links_elements = q_a_div_child.querySelectorAll('a');
        const Contained_links = [];
        for (let link_element of links_elements) {
            let q_link = link_element.getAttribute("href");
            const fullUrl = baseUrl + q_link
            if (q_link.startsWith('/ask/questions/') && !Contained_links.includes(fullUrl)) {
                Contained_links.push(fullUrl);
            }
        }

        return Contained_links;
    } catch (err) { return err }
}

const getQuestionString = (root) => {
    const q_p = root.querySelectorAll('.askAnswersAndComments')[0].toString();
    const q_p_child = HTMLParser.parse(q_p);
    const questionString = q_p_child.querySelector('span').rawText;
    return questionString;
}
const getQuestionDate = (root) => {
    const questionDate = root.querySelectorAll('.a-spacing-top-mini')[1].rawText.replace('asked on ', '');
    return questionDate;
}
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

const getPagesLinks = (baseUrl, root) => {
    try {
        let aNormalList = root.querySelectorAll('.a-normal')
        if (aNormalList && aNormalList.length) {
            let numberOfPages = aNormalList[aNormalList.length - 1].childNodes[0].rawText;
            lastPageLink = aNormalList[aNormalList.length - 1].childNodes[0].getAttribute('href');
            let splitedLink = lastPageLink.split(`/${numberOfPages}`);
            let before = splitedLink[0];
            const links = [];
            for (let i = 1; i <= numberOfPages; i++) {
                links.push(`${baseUrl}${before}/${i + 1}`)
            }
            return links
        }
        return []
    } catch (err) { return [] }
}

const extractFirstProductFromSearcPage = (baseUrl, htmlcontent) => {
    let root = HTMLParser.parse(htmlcontent);
    const firstProductLink = baseUrl + root.querySelectorAll('.s-no-outline')[1].getAttribute('href');
    return firstProductLink;
}


exports.extractAllQuestionsAndAnswersSectionLink = extractAllQuestionsAndAnswersSectionLink;
exports.extractQuestionAndAnswerLinks = extractQuestionAndAnswerLinks;
exports.extractQuestionAndAnswers = extractQuestionAndAnswers;
exports.extractFirstProductFromSearcPage = extractFirstProductFromSearcPage;