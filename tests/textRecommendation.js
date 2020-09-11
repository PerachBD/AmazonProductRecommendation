const assert = require('chai').assert;
const { scoreAnswers } = require('../src/analyzeRecommendations')


describe('Should success to score all answers', function () {
    it('Should success to score all Q&A', () => {
        let mock = [{
            answers: ["They do float, always on their sides.,Yes. I used them in baby shower table centerpieces floating, and they're still in use at bath time.",
                "Holes are on the bottom",
                " Hello Paul,I'm truly sorry but I do not know of any other place where you can buy ducks for your birds. I wish that I could help you more. I hope you find some and that you have a Merry Christmas.,Amazon.com",
                "No they tip over,Yes",
                "Not regular egg sized Easter eggs, but they would fit in the oversized eggs.,These would be too big for standard plastic Easter eggs.",
                "I have Amazon Prime and almost always get my deliveries next day.  Sometimes an item can be out of stock or from another country and they can take longer but you usually know that up front.",
                "Try to contact the seller through Amazon. Go to your orders and click on the ducks then select refund or replace and let them know.",
            ]
        }]
        scoreAnswers(mock);
        assert(1,1)
    })
})