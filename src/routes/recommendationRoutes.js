const { handleJob, getProductLink } = require('../handleJob');

module.exports = app => {
    // Routes
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
        if (validURL(req.query.search)) {
            if (req.query.search.startsWith("https://www.amazon.com")) {
                productLink = req.query.search;
            }
            else{
                res.send({command: "errorOccurred",data: { error: new Error("Product link isn`t amazon`s link")}})
                return;
            }
        }
        else productLink = await getProductLink(req.query.search);
        let result = await handleJob(productLink)
        res.send(result);
    });
}

// Checks if URL is valid
function validURL(str) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(str);
}