//importing the modules
var express = require('express');
var app = express();
const keys = require('./config/keys');
const stripe = require('stripe')(keys.stripeSecretKey);
app.set('view engine', 'ejs');
app.use('/css', express.static('css'));
app.use('/fonts', express.static('fonts'));
app.use('/img', express.static('img'));
app.use('/scss', express.static('scss'));
app.use('/js', express.static('js'));


var shortid = require('shortid');
var userDB = require('./Utils/UserDB');
var User = require('./models/User')

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var session = require('express-session');
app.use(session({ secret: 'srisession' }));

// XSS filter
const helmet = require('helmet')

// Sets "X-XSS-Protection: 1; mode=block".
app.use(helmet.xssFilter())


var list = [];
var subtotal = 0;


app.get('/', function(req, res) {
    res.render('index', { session: req.session.theUser });
});

app.get('/index', function(req, res) {
    res.render('index', { session: req.session.theUser });
});

app.get('/About', function(req, res) {
    res.render('About', { session: req.session.theUser });
});


app.get('/cart', function(req, res) {
    res.render('cart', { data: list, total: subtotal, session: req.session.theUser });
});

app.get('/sell', function(req, res) {
    res.render('sell', { session: req.session.theUser });
});

app.post('/sell', function(req, res) {
    res.render('contact', { session: req.session.theUser });
});

app.get('/contact', function(req, res) {
    res.render('contact', { session: req.session.theUser });
});
app.post('/cart', urlencodedParser, function(req, res) {


    if (req.session.theUser) {
        var data = req.body;
        var present = false;
        subtotal = 0;
        if (list.length === 0) {
            subtotal = subtotal + (parseInt(data.price) * parseInt(data.quantity));
            list.push(data);
        } else {

            for (var i = 0; i < list.length; i++) {
                list[i].price.replace('$', '');



                if (list[i].addtocart === data.addtocart) {
                    present = true;
                    list.splice(i, 1);
                } else {
                    subtotal = subtotal + (parseInt(list[i].price) * parseInt(list[i].quantity));
                }
            }



            subtotal = subtotal + (parseInt(data.price) * parseInt(data.quantity));
            list.push(data);

        }


        res.render('cart', { data: list, total: subtotal, session: req.session.theUser });

    } else {
        res.render('login', { session: req.session.theUser });
    }
});
app.get('/checkout', function(req, res) {

    if (req.session.theUser) {
        console.log(req.query)
        res.render('checkout', { session: req.session.theUser, total: req.query.total });
    } else {
        res.render('login', { session: req.session.theUser });
    }

});
app.get('/finalpage', function(req, res) {
    list = [];
    subtotal = 0;

    res.render('finalpage', { session: req.session.theUser });
});

app.post('/checkout', async function(req, res) {
    list = [];
    subtotal = 0;

    res.render('finalpage', { session: req.session.theUser });
});
// stripe.customers.create({
//         email: req.body.stripeEmail,
//         source: req.body.stripeToken
//     })
//     .then(customer => stripe.charges.create({
//         subtotal,
//         currency: 'usd',
//         customer: customer.id
//     }))(charge => res.render(
//     .then'finalpage'));
// list = [];
// subtotal = 0;
// console.log(req.body);
// res.send('TEST');
// res.render('finalpage', { session: req.session.theUser });
//});

app.get('/login', function(req, res) {

    res.render('login', { session: req.session.theUser });
});

app.post('/login', urlencodedParser, async function(req, res) {


    var users = await userDB.getUsers();

    var present = false;
    var User = {};

    for (var i = 0; i < users.length; i++) {
        if (users[i].emailAddress === req.body.email & users[i].password === req.body.password) {
            present = true;
            User = users[i];
        }
    }

    if (present === true) {
        req.session.theUser = User;
        res.render('index', { session: req.session.theUser });
    } else {
        res.render('signup', { session: req.session.theUser });
    }


});

app.get('/product-details', function(req, res) {



    req.query.image = "img/product-img/pro-big-" + req.query.no + ".jpg"
    var data = req.query;
    console.log(req.query)
    res.render('product-details', { data: data, session: req.session.theUser });
});
app.get('/shop', function(req, res) {
    res.render('shop', { session: req.session.theUser });
});

app.get('/signup', function(req, res) {
    res.render('signup', { session: req.session.theUser });
});

app.post('/signup', urlencodedParser, async function(req, res) {

    var user = await userDB.getUserBasedonEmail(req.body.email);
    if (user) {
        res.render('signup', { session: req.session.theUser });
    } else {
        var newUser = new User.User(shortid.generate(), "niner", "student", req.body.email, req.body.password);
        await userDB.createNewUser(newUser);
        res.render('login', { session: req.session.theUser });
    }

});

app.get('/logout', function(req, res) {
    req.session.theUser = undefined;
    req.session.destroy();
    res.render('index', { session: undefined });
});


//listening on port 8080
app.listen(8080);
console.log('Listening to the port 8080');