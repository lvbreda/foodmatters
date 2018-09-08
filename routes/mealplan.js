const express = require('express')
const router = express.Router()
const uuidv4 = require('uuid-v4')
const _ = require('lodash')

const ingredients = require('../ingredient.json');
const recipes = require('../recipes.json');
const recipesKeyed = _.keyBy(recipes,'id');
const matched = require('../matched.json');

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({ mealplans:[] })
  .write()

function randomFirstMeal (obj) {
    var keys = Object.keys(obj)
    return keys[ keys.length * Math.random() << 0];
};
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

router.get('/generate/:days', async (req,res)=>{
    const mealplan = createMealplan(Number(req.params.days));
    const output = {
        id: uuidv4(),
        plan:shuffle(mealplan)
    }
    db.get('mealplans')
        .push(output)
        .write()

    res.status(200).json(output);
})

router.get('/:id', async (req,res)=>{
    const mealplan = db.get('mealplans')
        .find({ id: req.params.id })
        .value()

    if(mealplan){
        res.status(200).json(mealplan);
    }else{
        res.status(404).send('Not Found');
    }
}) 

router.get('/:id/grocery', async (req,res)=>{
    const result = [];
    const mealplan = db.get('mealplans')
        .find({ id: req.params.id })
        .value()

    const ingredientsMapped = _(mealplan.plan).map((meal)=>{
        return meal.ingredientsArr;
    }).flatten().groupBy('id').value();
    
    _.forEach(ingredientsMapped,(ingredient)=>{
        ingredient[0].amount = _.sumBy(ingredient,'amount')
        result.push(ingredient[0])
    })

    res.status(200).json(result);
})

function createMealplan(days){
    
    const firstMeal = randomFirstMeal(matched);
    let currentGoodMeals = matched[firstMeal];
    const meals = [recipesKeyed[firstMeal]];

    let currentMeal = recipesKeyed[matched[firstMeal].slice(0,1)[0].id];
    for(var i = 0; i< days-1;i++){
        meals.push(currentMeal)
        const temp = _.keyBy(matched[currentMeal.id],'id');
        for(var o in currentGoodMeals){
            currentGoodMeals[o].value += temp[currentGoodMeals[o].id].value
        }
        currentGoodMeals = _.sortBy(currentGoodMeals,'value');
        currentMeal = recipesKeyed[currentGoodMeals.slice(0,1)[0].id];
    }
    
    return meals;
}

module.exports = router