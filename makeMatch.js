const _ = require('lodash')
const fs = require('fs')
/*
    - points:
        *Amount of products not matching
        *Amount of quantity above buckets
        *100% match
*/
const recipes = require('./recipes.json')


function loopOver() {
    const compared = {};
    const start = recipes[0];
    for (var a = 0; a < recipes.length; a++) {
        compared[recipes[a].id] = []
        for (var i = 0; i < recipes.length; i++) {
            compared[recipes[a].id].push({
                id: recipes[i].id,
                value: generateMatch(recipes[a], recipes[i])
            })
        }
    }
    const keys = _.keys(compared);
    for (var u = 0; u < keys.length; u++) { 
        compared[keys[u]] = _(compared[keys[u]]).sortBy('value').reverse().value();
    }
    fs.writeFileSync('matched.json', JSON.stringify(compared, null, 4))
}

loopOver();


function generateMatch(recipe1, recipe2) {
    let count = 100;
    const diffIngredients = getNoneMatchingIngredients(recipe1, recipe2)
    const wasted = getWasteOfProducts(recipe1, recipe2)

    if (diffIngredients === 0) {
        count -= 100;
    }

    count -= diffIngredients * 5;
    count -= wasted * 5;

    return count;
}

function getNoneMatchingIngredients(recipe1, recipe2) {
    const ingredients1 = recipe1.ingredientsArr;
    const ingredients2 = recipe2.ingredientsArr;

    const id1Mapped = _.reject(_.map(ingredients1, 'id'), (id) => id === 794);
    const id2Mapped = _.reject(_.map(ingredients2, 'id'), (id) => id === 794);


    return _.uniq(_.concat(_.difference(id1Mapped, id2Mapped), _.difference(id2Mapped, id1Mapped))).length;
}

function getWasteOfProducts(recipe1, recipe2) {
    let ingredients1 = recipe1.ingredientsArr;
    let ingredients2 = recipe2.ingredientsArr;

    const waist = 0;

    ingredients1 = _.map(_.filter(ingredients1, (ingredient) => {
        return (ingredient.unit === null || ingredient.unit === 'kilogram' || ingredient.unit === 'gram') && ingredient.id !== 794;
    }), (ingredient) => {
        if (ingredient.unit === 'kilogram') {
            ingredient.amount = ingredient.amount * 1000;
        }
    })

    ingredients2 = _.map(_.filter(ingredients2, (ingredient) => {
        return (ingredient.unit === null || ingredient.unit === 'kilogram' || ingredient.unit === 'gram') && ingredient.id !== 794
    }), (ingredient) => {
        if (ingredient.unit === 'kilogram') {
            ingredient.amount = ingredient.amount * 1000;
        }
    })

    _.forEach(ingredients1, (ingredient1) => {
        if (ingredient1) {
            const ingredient2 = _.find(ingredients2, { id: ingredient1.id });
            const closest500 = Math.ceil((ingredient1.amount + ingredient2.amount)/500)*500;
            const closest6 = Math.ceil((ingredient1.amount + ingredient2.amount)/6)*6;
            if (ingredient2) {
                if (ingredient1.unit === null) {
                    let diff = Math.abs(closest6-(ingredient1.amount + ingredient2.amount));
                    waist += diff;
                } else {
                    let diff = Math.abs(closest500-(ingredient1.amount + ingredient2.amount));
                    waist += diff / 100;
                }
            } else {
                waist += 5;
            }
        }
    })

    return waist;
}

