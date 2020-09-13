const Sentiment = require('sentiment');

const scoreAnswers = (allQAndA) => {
    var sentiment = new Sentiment();

    let Qresult;
    let allQresult = 0
    if (allQAndA.length) {
        for (let i of allQAndA) {
            Qresult = 0;
            if (i.answers.length) {
                for (let sentence of i.answers) {
                    Qresult += sentiment.analyze(sentence).score;
                }
                // Average between the number of answers
                allQresult += (Qresult / i.answers.length);
            }
        }
        // Average between the number of questions
        // Changing the scale from (-4)-(+5) to 0-10
        return ((allQresult / allQAndA.length)+5)
    }
    return 0;
}

exports.scoreAnswers = scoreAnswers;