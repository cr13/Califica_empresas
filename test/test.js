var assert = require('assert');
var mysql = require('mysql');

//--------------------------------------------------------------------------------------------------------------------------------------
//Funcion para conectar a la base de datos
function BD(){
  var conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    //password: 'cr',
    port: 3306,
    database: 'clasifica_empresa'
  });
  return conexion;
}

//--------------------------------------------------------------------------------------------------------------------------------------
//Permite realizar pruebas de insercción y consultas a la BD
describe("Prueba Test",function(){
    var objBD = BD();
  //Permite insertar una nueva empresa en el sistema
  it("Insertar una nueva empresa",function(){
	  objBD.query('INSERT INTO empresa (nombre_empresa) VALUES ("daitsu")', function( error ){
       assert.ok(!error,"Error al insertar la empresa");
    });
  });
  //Permite mostrar todas las empresas del sistema que un usuario dado no ha votado
  it("Mostrar listado de empresas que me faltan por votar",function(){
    objBD.query('SELECT `ID`,`nombre_empresa` FROM empresa WHERE not EXISTS (select voto.IDempresa from voto where empresa.ID=voto.IDempresa and voto.Borrado='+1+' and voto.DNIvotante='+254785236+')', function( error,resultado,fila){
      assert.ok(!error,"Error en la consulta de empresas");
      assert.notEqual(resultado.length,0,"No hay empresas en el sistema o ya has votado en todas");
    });
  });
});
