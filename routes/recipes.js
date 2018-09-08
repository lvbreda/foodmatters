const express = require('express')
const router = express.Router()
const axios = require('axios')
const _ = require('lodash')

const ingredients = require('../ingredient.json');
const recipes = require('../recipes.json');


const APIURL = 'https://open-api.digimeals.com/'
axios.defaults.baseURL = APIURL

router.get('/', async (req,res)=>{
    res.status(200).json(recipes);
})

router.get('/:id', async (req,res)=>{
    const recipe = _.find(recipes,{id:Number(req.params.id)})
    res.status(200).json(recipe);
}) 

router.get('/containing/:ingredient', async (req,res)=>{
    const ingredientsFilter = _.filter(ingredients,(ingredient)=>{
        return _.find(ingredient.name,(name)=>name.indexOf(req.params.ingredient)>-1)
    })

    const recipesFilter = _(ingredientsFilter).map((ingredient)=>{
        return _.filter(recipes,(recipe)=>{
             return _.findIndex(recipe.ingredientsArr,{id:ingredient.id}) > -1
        });
    }).flatten().uniqBy('id').value()

    res.status(200).json(recipesFilter);
})

module.exports = router