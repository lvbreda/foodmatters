const mealplan = require('./routes/mealplan')
const recipes = require('./routes/recipes')
const ingredients = require('./routes/ingredients')

const express = require('express')
const app = express()

app.use('/mealplan',mealplan)
app.use('/recipes',recipes)
app.use('/ingredients',ingredients)

app.listen(process.env.PORT || 3000, () => console.log('Example app listening on port 3000!'))