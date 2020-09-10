var HTMLParser = require('node-html-parser');
const axios = require('axios');
const extractAllQuestionsAndAnswersSectionLink = (htmlcontent) => {
    
    const root = HTMLParser.parse(htmlcontent);
    
    const q_a_div = root.querySelector('.cdQuestionLazySeeAll').toString();
    const q_a_div_child=HTMLParser.parse(q_a_div);
    q_a_a_tag = q_a_div_child.querySelector('a');
    link = q_a_a_tag.getAttribute("href");
    return link;
}
const extractQuestionAndAnswerLinks = async(baseUrl,htmlcontent) => {

    let root = HTMLParser.parse(htmlcontent);
    const Contained_links = [];
    let nextPageLink;
    do{
        nextPageLink=null
        const q_a_div = root.querySelector('.askTeaserQuestions').toString();
        const q_a_div_child=HTMLParser.parse(q_a_div);
        links_elements = q_a_div_child.querySelectorAll('a');

        for (let link_element of links_elements) {
            link = link_element.getAttribute("href");
            const fullUrl=baseUrl+link
            if(link.startsWith('/ask/questions/') && !Contained_links.includes(fullUrl)) {
                Contained_links.push(fullUrl);
            }
        }
        if(root.querySelector('.a-last').childNodes[0].rawAttrs){
            nextPageLink = root.querySelector('.a-last').childNodes[0].getAttribute('href');
            nextPageLink = baseUrl+nextPageLink;
            htmlcontent= await axios.get(nextPageLink);
            root = HTMLParser.parse(htmlcontent.data);
        }
    }while(nextPageLink)

    return Contained_links;
}

const extractQuestionAndAnswers = async(baseUrl,htmlcontent) => {

    let root = HTMLParser.parse(htmlcontent);

    const q_p = root.querySelectorAll('.askAnswersAndComments')[0].toString();
    const q_p_child=HTMLParser.parse(q_p);
    const questionString = q_p_child.querySelector('span').rawText;
    const questionDate = root.querySelectorAll('.a-spacing-top-mini')[1].rawText.replace('asked on ','');
    // console.log(ask_date_p)
    let answersStrings=[];
    let nextPageLink;
    do{
        nextPageLink= null;
        //if there is answers
        if(root.querySelectorAll('.askAnswersAndComments').length >= 2){
                const answers_div = root.querySelectorAll('.askAnswersAndComments')[1].childNodes;
            let answers=[]
            for(let i of answers_div){
                if(i.tagName=="div") answers.push(i)
            }
            
            for(let i of answers){
                for(let child of i.childNodes){
                    if(child.tagName=="span" && child.getAttribute('class')!=="noScriptDisplayLongText") 
                        answersStrings.push(child.rawText.split("\r").join("").split("\n").join(" ").trim())
                }
            }
            if(root.querySelector('.a-last').childNodes[0].rawAttrs){
                nextPageLink = root.querySelector('.a-last').childNodes[0].getAttribute('href');
                nextPageLink = baseUrl+nextPageLink;
                htmlcontent= await axios.get(nextPageLink);
                root = HTMLParser.parse(htmlcontent.data);
            }
        }

    }while(nextPageLink)
    return {question:questionString,questionDate,answers:answersStrings}
}

const extractFirstProductFromSearcPage = (baseUrl,htmlcontent) => {
    let root = HTMLParser.parse(htmlcontent);
    const firstProductLink = baseUrl + root.querySelectorAll('.s-no-outline')[1].getAttribute('href');
    return firstProductLink;
}

exports.extractAllQuestionsAndAnswersSectionLink = extractAllQuestionsAndAnswersSectionLink;
exports.extractQuestionAndAnswerLinks = extractQuestionAndAnswerLinks;
exports.extractQuestionAndAnswers = extractQuestionAndAnswers;
exports.extractFirstProductFromSearcPage = extractFirstProductFromSearcPage;