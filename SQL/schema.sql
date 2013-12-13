CREATE DATABASE chat;

USE chat;

CREATE TABLE messages (
  id int(15),
  username varchar(20),
  message varchar(150),
  createdat date
 /* Describe your table here.*/
);

/* You can also create more tables, if you need them... */

/*  Execute this file from the command line by typing:
 *    mysql < schema.sql
 *  to create the database and the tables.*/
