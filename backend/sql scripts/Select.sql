SELECT * FROM users;

CREATE TABLE ViewedRecipes (
  user_id INT NOT NULL,
  recipeId INT NOT NULL,
  PRIMARY KEY (user_id, recipeId)
);

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  firstname VARCHAR(255),
  lastname VARCHAR(255),
  country VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255)
);

CREATE TABLE FavoriteRecipes (
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  PRIMARY KEY (user_id, recipe_id)
);

CREATE TABLE LastWatchedRecipes (
  user_id INT PRIMARY KEY,
  recipe_id1 INT,
  recipe_id2 INT,
  recipe_id3 INT
);

CREATE TABLE userrecipes (
  recipe_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255),
  image TEXT,
  readyInMinutes INT,
  popularity INT,
  vegan BOOLEAN,
  vegetarian BOOLEAN,
  glutenFree BOOLEAN,
  instructions TEXT,
  ingredients TEXT
);

CREATE TABLE ViewedRecipes (
  user_id INT NOT NULL,
  recipeId INT NOT NULL,
  PRIMARY KEY (user_id, recipeId)
);