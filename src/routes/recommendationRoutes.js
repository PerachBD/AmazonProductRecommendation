const { handleJob, getProductLink } = require('../handleJob');

module.exports = app => {
    /**
     * @swagger
     * /recommend:
     *  get:
     *    description: Use to return product recommendations
     *  parameters:
     *    - search: /recommend
     *      in: query
     *      description: name of a product or link to amazon product
     *      required: true
     *      schema:
     *        type: string
     *        format: string
     *  responses:
     *    '200':
     *      description: A successful response
     */

    app.get('/recommend', async (req, res) => {
        let productLink;
        //if search by url
        if (validURL(req.query.search)) {
            // if is amazon`s link
            if (req.query.search.startsWith("https://www.amazon.com")) {
                productLink = req.query.search;
            }
            // if not amazon`s link
            else{
                res.send({command: "errorOccurred",data: { error: new Error("Product link isn`t amazon`s link")}})
                return;
            }
        }
        //search by name, getting product link
        else productLink = await getProductLink(req.query.search);
        // get scraped Q&A and recommendation
        let result = await handleJob(productLink)
        res.send(result);
    });
}

// Checks if URL is valid
function validURL(str) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(str);
}