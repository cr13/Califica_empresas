var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var routes = require('./routes/index');
var users = require('./routes/users');
var session = require('express-session');
var assert = require('assert');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

//-----------------------------------------------------------------------------------------------------------------------------------------
app.get('/login', function(req, res){
  res.render('login', { title:'Iniciar Sesión' });
});
app.get('/insertaalumno', function(req, res){
  res.render('insertaalumno', { title:'Registrar' });
});
app.get('/votacion', login, function(req, res){
  res.render('votacion', { title:'Votaciones', usuario: session.DNIalum});
});
app.get('/insertaempresa', function(req, res){
  res.render('insertaempresa', { title:'Añade tu empresa' });
});
app.get('/ranking', function(req, res){
  res.render('ranking', { title:'Clasificación de las empresas' });
});login
//-----------------------------------------------------------------------------------------------------------------------------------------
// Funcion que permite loguearte
function login(req, res, next){
  if( typeof session.DNIalum!='undefined'){
    next();
  }else{
    res.redirect('/login');
    res.send('No estás registrado');
  }
};
//-----------------------------------------------------------------------------------------------------------------------------------------
//Funcion para conectar a la base de datos
function BD(){
  var conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'cr',
    port: 3306,
    database: 'clasifica_empresa'
  });
  return conexion;
}
//-----------------------------------------------------------------------------------------------------------------------------------------
//Permite crear una empresa
app.post('/anadirempresa', function(req, res){
  var objBD = BD();
  var nombreEmpresa = req.body.txtNombreEmpresa;

  objBD.query('INSERT INTO `clasifica_empresa`.`empresa` (`nombre_empresa`) VALUES ("'+ nombreEmpresa +'")', function( error ){
    if(error){
      console.log(error.message);
      res.send('Inscripción de la empresa inválida o la empresa ya está registrada');
    }else{
      console.log('Insertado');
      res.redirect('/');
    }
  });
});

//-----------------------------------------------------------------------------------------------------------------------------------------
//Permite registar un alumno
app.post('/anadiralumno', function(req, res){
  var objBD = BD();
  var nombreAlumno = req.body.txtNombreAlumno;
  var DNIalumno = req.body.DNIalum;
  var apellidoAlumno = req.body.txtApellidos;
  var clave = req.body.txtClave;
  var email = req.body.txtEmail;
  //res.send('INSERT INTO `votante`(`DNI`, `contraseña`, `nombre`, `apellidos`, `email`) VALUES ('+DNIalumno+',"'+ clave +'","'+ nombreAlumno +'","'+ apellidoAlumno +'","'+ email +'")');
  objBD.query('INSERT INTO `votante`(`DNI`, `contraseña`, `nombre`, `apellidos`, `email`) VALUES ('+DNIalumno+',"'+ clave +'","'+ nombreAlumno +'","'+ apellidoAlumno +'","'+ email +'")', function( error ){
    if(error){
      console.log(error.message);
      res.send('Registro del alumno inválido o el usuario ya está registrado');
    }else{
      console.log('Registrando alumno');
      session.DNIalum = DNIalumno;
      res.redirect('/');
    }
  });
});


//-----------------------------------------------------------------------------------------------------------------------------------------
//Permite mostrar todas las empresas del sistema que un usuario dado no ha votado
app.get('/mostrarEmpresas', login,  function(req, res){
  var objBD = BD();
  var DNIvotante = session.DNIalum;
  objBD.query('SELECT `ID`,`nombre_empresa` FROM empresa WHERE not EXISTS (select voto.IDempresa from voto where empresa.ID=voto.IDempresa and voto.Borrado=1 and voto.DNIvotante='+DNIvotante+') ', function( error, resultado, fila){
    if(!error){
      if(resultado.length > 0){
      res.render('vota', { empresas:resultado } );

      }else{
        res.send('Ya has votado a todas las empresas del sistema');
      }
    }else{
      console.log('Error');
    }
  });
});

//-----------------------------------------------------------------------------------------------------------------------------------------
//Permite mostrar todas las empresas que ha votado el alumno
app.get('/mostrarMisVotos', login,  function(req, res){
  var objBD = BD();
  var user = session.DNIalum;
  //res.send('SELECT * FROM misVotos where DNIvotante='+user);
  objBD.query('SELECT * FROM misVotos where DNIvotante='+user+' AND Borrado='+1, function( error, resultado, fila){
    if(!error){
      if(resultado.length > 0){
      res.render('suprvoto', { empresas:resultado } );

      }else{
        res.send('No has votado por ninguna empresa');
      }
    }else{
      console.log('Error');
    }
  });
});
//-----------------------------------------------------------------------------------------------------------------------------------------

//Permite logear un usuario
app.post('/autenticar', function(req, res){
  var objBD = BD();
  var DNIalum = req.body.DNIalum;
  var clave = req.body.txtClave;
  assert(DNIalum, "DNI del alumno");
  assert(clave, "clave del alumno");
  console.log("Identificación completada con éxito");
  //res.send('SELECT * FROM alumnos WHERE DNI LIKE '+ DNIalum +' AND contraseña LIKE "'+ clave +'"');
  objBD.query('SELECT * FROM votante WHERE DNI LIKE '+ DNIalum +' AND contraseña LIKE "'+ clave +'"', function( error, resultado, fila){
    if(!error){
      if(resultado.length > 0){
        session.DNIalum = DNIalum;
        res.redirect('/votacion');
      }else{
        res.send('El usuario no existe o sus datos son incorrectos');
      }
    }else{
      console.log('Error');
    }
  });
});
//-----------------------------------------------------------------------------------------------------------------------------------------
//Permite insertar una nueva puntuación
app.post('/registrarVoto', login, function(req, res){
  var objBD = BD();
  var IDempresa = req.body.ID;
  var nota = req.body.txtNota;
  var user = session.DNIalum;
  var param = req.body.borrarvoto;
  if(param=="borrar"){
    objBD.query('UPDATE `voto` SET Borrado=0 WHERE `voto`.`IDempresa` = '+ IDempresa +' AND `voto`.`DNIvotante` = '+ user , function( error, resultado, fila){
      //console.log('UPDATE `voto` SET Borrado=0 WHERE `voto`.`IDempresa` = '+ IDempresa +' AND `voto`.`DNIvotante` = '+ user);
      if(error){
        console.log(error.message);
        res.send('Error al borrar votación');
      }else{
        console.log('Borrado con exito');
        res.redirect('/mostrarMisVotos');
      }
    });
  }
  //res.send('INSERT INTO `voto`(`IDempresa`, `puntuacion`, `DNIvotante`) VALUES ('+ IDempresa +',"'+ nota +'","'+ user +'")');
  //DELETE FROM `voto` WHERE `voto`.`IDempresa` = 4 AND `voto`.`DNIvotante` = 77135143
  else{
      objBD.query('INSERT INTO `voto`(`IDempresa`, `puntuacion`, `DNIvotante`) VALUES ('+ IDempresa +',"'+ nota +'","'+ user +'")', function( error ){
        if(error){
          objBD.query('UPDATE `voto` SET Borrado=1,puntuacion="'+ nota +'"  WHERE `voto`.`IDempresa` = '+ IDempresa +' AND `voto`.`DNIvotante` = '+ user , function( error, resultado, fila){
            //console.log('UPDATE `voto` SET Borrado=0 WHERE `voto`.`IDempresa` = '+ IDempresa +' AND `voto`.`DNIvotante` = '+ user);
            if(error){
              console.log(error.message);
              res.send('Error al borrar votación');
            }else{
              console.log('Insertado voto de nuevo');
              res.redirect('/mostrarclasificacion');
            }
          });
        }else{
          console.log('Insertado voto');
          res.redirect('/mostrarclasificacion');
        }
      });
  }
});

//-----------------------------------------------------------------------------------------------------------------------------------------
//Permite mostrar todas las empresas y sus respectivas puntuaciones
app.get('/mostrarclasificacion',  function(req, res){
  var objBD = BD();
  objBD.query('SELECT * FROM ranking', function( error, resultado, fila){
    assert.ok(!error,"Error en la consulta del ranking");
    assert.notEqual(resultado.length,0,"No exisite niguna puntuación en estos momentos");
    res.render('ranking', {datos:resultado } );
  });
});


//-----------------------------------------------------------------------------------------------------------------------------------------
//funcion para cerrar la session
app.post('/salir', function(req, res){
  delete session.DNIalum;
  res.redirect('/');
});
//-----------------------------------------------------------------------------------------------------------------------------------------
/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
