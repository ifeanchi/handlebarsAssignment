const express = require("express");
const { check, validationResult } = require('express-validator');
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')

const Restaurant = require('./models/restuarant');
const Menu = require('./models/menu');
const MenuItem = require('./models/menuItem');

const initialiseDb = require('./initialiseDb');
initialiseDb();

const app = express();
const port = 3000;



app.use(express.static('public'));

const handlebars = expressHandlebars({
    handlebars : allowInsecurePrototypeAccess(Handlebars)
});

app.engine('handlebars', handlebars);
app.set('view engine', 'handlebars');

app.use(express.json());


const restaurantChecks = [
    check('name').not().isEmpty().trim().escape(),
    check('image').isURL(),
    check('name').isLength({ max: 50 })
]

app.get('/restuarants', async (req, res) => {
    const restuarants = await Restaurant.findAll();
    // res.json(restaurants);
    res.render('restuarants', {restuarants})
});

app.get('/restuarants/:id', async (req, res) => {
    const restuarant = await Restaurant.findByPk(req.params.id, {include: {
            model: Menu,
            include: MenuItem
        }
    });
    // res.json(restuarant);
    res.render('restuarant', {restuarant})
});

// app.get('/restuarants/:id', async (req, res) => {
//     const restuarant = await Restaurant.findByPk(req.params.id)

//     // res.json(restaurant);
//     res.render('restuarant', {restuarant})
//     });
    


app.post('/restaurants', restaurantChecks, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await Restaurant.create(req.body);
    res.sendStatus(201);
});

app.delete('/restaurants/:id', async (req, res) => {
    await Restaurant.destroy({
        where: {
            id: req.params.id
        }
    });
    res.sendStatus(200);
});

app.put('/restaurants/:id', restaurantChecks, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const restaurant = await Restaurant.findByPk(req.params.id);
    await restaurant.update(req.body);
    res.sendStatus(200);
});

app.patch('/restaurants/:id', async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.id);
    await restaurant.update(req.body);
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// app.get('/menus', async (req, res) => {
//     const newMenu = await Menu.findAll();
//     // res.json(restaurants);
//     res.render('menus', {newMenu})
// });