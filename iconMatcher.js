const ingredients = require('./ingredient.json');
const fs = require('fs');
const _ = require('lodash');

fs.readdir('/Users/landervanbreda/Downloads/pdf', function(err, items) {
    let output = [];

    
    _.forEach(items,(item,key)=>{
        let clean = item.replace('.pdf','');

        let match =  _.find(ingredients,(ingredient)=>{
            return _.find(ingredient.name,(name)=>{
                return name.indexOf(clean) > -1;
            })
        })

        if(match){
            fs.createReadStream(`/Users/landervanbreda/Downloads/pdf/${item}`).pipe(fs.createWriteStream(`images/ingredient_${match.id}.pdf`));

            ingredients[_.findIndex(ingredients,{id:match.id})].image = `images/ingredient_${match.id}.pdf`
            console.log('wrote');
        }
    })
    fs.writeFileSync('ingredient.json',JSON.stringify(ingredients,null,4));
});