const router = require('express').Router();

const User = require('../models/user.model');
const Message = require('../models/message.models');

router.get('/', (req, res) => {
    res.redirect('/chat');
});

/* GET home page. */
router.get('/register', (req, res) => {
    res.render('register')// con render renderizo y mando a navegador
});

router.get('/login', (req, res) => {
    res.render('login');
});





router.get('/chat', async (req, res) => {
    if (!req.cookies['chat_login']) return res.redirect('/login?error=true');//SI no viene definida
    // console.log(req.cookies['chat_login']);
    const user = await User.findById(req.cookies['chat_login']); // Aqui hemos rescatado el usuario
    const messages = await Message.find().sort({ createdAt: -1 }).limit(5).populate('user');// funcion de ordenacion. Sort
    console.log(messages)

    res.render('chat', {
        user: user,
        messages
    }) // le estoy haciendo llegar a la vista todos los datos del usuario.
});

module.exports = router;
