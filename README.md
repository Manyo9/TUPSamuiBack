Este repo es temporal y una vez que implementemos .env se debe volver a subir

npm install 
npm run serve

en la DB:

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'tu_pass';

es feo pero cuando sea un app real lo cambiamos

en api/connection/connection.js cambiar los datos de la conexion a la db
