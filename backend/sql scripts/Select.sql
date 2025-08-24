SELECT * FROM users;

CREATE TABLE ViewedRecipes (
  user_id INT NOT NULL,
  recipeId INT NOT NULL,
  PRIMARY KEY (user_id, recipeId)
);