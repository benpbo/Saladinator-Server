const express = require('express'),
    cors = require('cors'),
    cookieParser = require('cookie-parser'),
    got = require('got'),
    path = require('path'),
    urlExist = require('url-exist');

const recipeURL = 'http://www.recipepuppy.com/api/'
const app = express();
const PORT = process.env.PORT || 8888;

app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

getIP()
    .then(ip => app.listen(PORT, console.log(`Saladinator is listening at ${ip}:${PORT}`)))
    .catch(err => {
        console.error(err);
        console.error('server failed to start');
    })

app.get('/recipe', (req, res) => {
    let ingredients = req.query.ingredients || req.query.i || '';

    getRecipes(ingredients)
        .then(recipes => res.send(recipes));
})

async function getRecipes(ingredients) {
    const response = await got(recipeURL, { searchParams: { i: ingredients } });

    const json = JSON.parse(response.body);
    const recipes = json.results;

    let goodRecipes = [];
    recipes.forEach(async recipe => {
        const url = recipe.href;
        if (await urlExist(url)) goodRecipes.push(recipe)
    });
    return goodRecipes;
}

async function getIP() {
    const ipURL = 'https://api.ipify.org'
    let response = await got(ipURL);
    let ip = response.body;
    return ip;
}
