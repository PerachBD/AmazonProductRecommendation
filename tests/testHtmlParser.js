const fs = require('fs');
const path = require('path');
const assert = require('chai').assert;
const { extractAllQuestionsAndAnswersSectionLink,extractQuestionAndAnswerLinks,extractQuestionAndAnswers,extractFirstProductFromSearcPage } = require('../src/htmlParser');

describe('Should success to extract link of QandA from html page', function() {
    const sec = 1000;
    const min = 60 * sec;
    this.timeout(3 * min);
    it('Should success to get a link', () => {
        htmlFilePath = path.join(__dirname, 'fixture', 'EchoDotAmazonPage.txt');
        const html = fs.readFileSync(htmlFilePath).toString();
        const result = extractAllQuestionsAndAnswersSectionLink(html);
        assert(link,"https://www.amazon.com/ask/questions/asin/B07FZ8S74R/ref=cm_cd_dp_lla_ql_ll")
    })
    it('Should success to get a All Q&A links', async() => {
        htmlFilePath = path.join(__dirname, 'fixture', 'WhiteBoardAmazonAllQ&A.txt');
        const html = fs.readFileSync(htmlFilePath).toString();
        const results = await extractQuestionAndAnswerLinks("https://www.amazon.com",html);
        assert(results.length,29)
    })
    it('Should success to get a specific Q&A data', async() => {
        htmlFilePath = path.join(__dirname, 'fixture', 'EchoDotAmazonQ&A.txt');
        const html = fs.readFileSync(htmlFilePath).toString();
        const results = await extractQuestionAndAnswers("https://www.amazon.com",html);
        assert(results.answers.length,19)
        assert(results.question,'Any accessory recommend for echo dot 3rd?')
        assert(results.questionDate,'August 3, 2019')
        
    })
    it('Should success to get firstProduct', async() => {
        htmlFilePath = path.join(__dirname, 'fixture', 'IrobotRoombaSearchPage.txt');
        const html = fs.readFileSync(htmlFilePath).toString();
        const results = await extractFirstProductFromSearcPage("https://www.amazon.com",html);
        assert(results,'https://www.amazon.com/gp/slredirect/picassoRedirect.html/ref=pa_sp_atf_aps_sr_pg1_1?ie=UTF8&adId=A09520392GA8QN7SSMSVP&url=%2FCoredy-Vacuuming-Sweeping-Controls-Supported%2Fdp%2FB085L6K7RV%2Fref%3Dsr_1_1_sspa%3Fdchild%3D1%26keywords%3Dirobot%2Broomba%26qid%3D1599738675%26sr%3D8-1-spons%26psc%3D1&qualifier=1599738675&id=4376292356824159&widgetName=sp_atf')
    })
})