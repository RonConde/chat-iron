const router = require('express').Router();
const bcrypt = require('bcryptjs');

const User = require('../models/user.model') //Importamos el modelo.

router.post('/create', async (req, res) => {


    req.body.password = bcrypt.hashSync(req.body.password, 7); // encriptamos el pasword es siempre IGUAL!!!
    try {
        await User.create(req.body);

        res.redirect('/login'); // Si lo anterion funciona me llevas a Login y punto.
    } catch (error) {
        console.log(error)
    }
});


router.post('/login', async (req, res) => {
    //*Compruebo si el email esta en la BD
    const user = await User.findOne({ email: req.body.email }); // busqueda
    if (!user) return res.redirect('/login?error=true');// SI no encuentro el usuario

    //*Comprobaremos si  las password coinciden

    const iguales = bcrypt.compareSync(req.body.password, user.password);
    if (!iguales) return res.redirect('/login?error=true'); //SI NO SON IGUALES... lo mando al login otra vez...

    //* Login correcto
    res.cookie('chat_login', user._id); // en caso de que este bien guardo registro y mandamos al chat.
    res.redirect('/chat');
});


module.exports = router;


