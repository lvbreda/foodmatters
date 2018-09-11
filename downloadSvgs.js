const recipes = require('./recipes.json');
const http = require('http');
const fs = require('fs');
const _ = require('lodash');


let actions = _.map(recipes,(recipe)=>{
    return _.map(recipe.actions,(action)=>{
        return action.action;
    })
});

actions = _.flatten(actions);
actions = _.uniqBy(actions,'actionKey');


_.forEach(actions,(action)=>{
    if(action){
        try{
            var file = fs.createWriteStream(`svg/${action.actionKey}.svg`);
            console.log(action,action.imageUrl);
            var request = http.get(action.imageUrl, function(response) {
                response.pipe(file);
            });
        }catch(e){}
       
    }
})


