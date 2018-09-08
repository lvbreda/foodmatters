const express = require('express')
const router = express.Router()

const ingredients = require('../ingredient.json');

router.get('/', async (req,res)=>{
    res.status(200).json(ingredients);
})

module.exports = router