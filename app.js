const express = require('express'),
    got = require('got'),
    urlExist = require('url-exist');

const recipeURL = 'http://www.recipepuppy.com/api/'
const app = express();
const PORT = process.env.PORT || 8888;

app.use(express.static(__dirname + '/public'))

startServer()

app.get('/recipe', getIngredients, (req, res) => {
    getRecipes(req.ingredients).then(recipes => res.json(recipes))
});

function getIngredients(req, res, next) {
    const ingredients = req.query.ingredients || req.query.i || '';
    req.ingredients = ingredients.split(',')
    next()
}

async function getRecipes(ingredients) {
    const response = await got(recipeURL, {
        searchParams: { i: ingredients.join() }
    });

    const json = JSON.parse(response.body);
    const recipes = json.results;

    return recipes.filter(async recipe => await urlExist(recipe.href))
}

function startServer() {
    getIP()
        .then(ip => app.listen(PORT, console.log(`Saladinator is listening at ${ip}:${PORT}`)))
        .catch(err => {
            console.error(err);
            console.error('server failed to start');
        })
}

async function getIP() {
    const ipURL = 'https://api.ipify.org'
    const response = await got(ipURL);
    return response.body;
}
