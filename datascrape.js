const axios = require('axios');
const Promise = require('bluebird');
const fs = require('fs');
const _ = require('lodash');
const ogmneo = require('ogmneo');

ogmneo.Connection.connect('neo4j', 'londer2335', 'localhost');

const url = 'https://open-api.digimeals.com/recipes';
const ingredients = {};
const fullRecipes = []

async function start(){
   // Get all recipes
   const fullResult =  await axios.get(url);

   //Get all details
   const mappedPromises = Promise.map(fullResult.data,async (row)=>{
        const recipe = await axios.get(`${url}/${row.id}`);
        return _.assign(recipe.data,row);
   })

   const fullResults = await mappedPromises;

   const end = _.map(fullResults,(res)=>{
       res.actions = _.map(res.actions,(action)=>{
           action.action = res.actionsArr[String(action.action)]
           action.text = res.textsArr[action.text]
           return action;
       })
       delete res.actionsArr;
       delete res.textsArr;
       return res;
   })


   fs.writeFileSync('recipes.json',JSON.stringify(end,null,4));


   const createDecentIngredientList = _(fullResults)
                                            .map((result)=>result.ingredientsArr)
                                            .flatten()
                                            .uniq((result)=>`${result.id}${result.name}`)
                                            .groupBy('id')
                                            .map((groupedId)=>{
                                                let result = groupedId[0];
                                                result.name = [groupedId[0].name];
                                                if(groupedId.length > 1){
                                                    result.name.push(groupedId[1].name);
                                                }
                                                return result;
                                            }).value()

    fs.writeFileSync('ingredient.json',JSON.stringify(createDecentIngredientList,null,4));

   // Get unique ingredients
   const flatIngredients = _(fullResults).map((result)=>result.ingredientsArr).flatten().uniqBy('id').value();

   // Add them to db , save id in local key-value
   const mappedOgmPromises = Promise.map(flatIngredients,async (ingredient)=>{
    const neoIngredient = await ogmneo.Node.create(ingredient, 'ingredient')
    ingredients[ingredient.id] = neoIngredient;
    return true;
   })
   
   await mappedOgmPromises;

   // Add all recipes, link them with the ingredients
   const mappedProductOgmPromises = Promise.map(fullResults,async (recipe)=>{
    const neoRecipe = await ogmneo.Node.create(_.pick(recipe,['fullTime','id','name','mainImageUrl']), 'recipe')
    return await Promise.map(recipe.ingredientsArr,async (ingredient)=>{
        const neoIngredient = ingredients[ingredient.id];
        console.log('creating relations');
        await ogmneo.Relation.relate(neoIngredient.id, 'isIn', neoRecipe.id, {amount: ingredient.amount})
        return await ogmneo.Relation.relate(neoRecipe.id, 'has', neoIngredient.id, {amount: ingredient.amount})
    })
   })

   await mappedProductOgmPromises;


}

start();