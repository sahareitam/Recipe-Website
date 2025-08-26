const e = require("express");
const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`INSERT IGNORE INTO FavoriteRecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id) {
  const tableCheck = await DButils.execQuery(`SHOW TABLES LIKE 'FavoriteRecipes'`);
  if (tableCheck.length === 0) {
    return null; 
  }

  
  const recipes_id = await DButils.execQuery(`
    SELECT recipe_id FROM FavoriteRecipes WHERE user_id='${user_id}'
  `);

  if (!recipes_id || recipes_id.length === 0) {
    return null;  
  }

  return recipes_id; 
}

async function addToLastWatched(user_id, new_recipe_id) {
  const result = await DButils.execQuery(`
    SELECT recipe_id1, recipe_id2, recipe_id3
    FROM LastWatchedRecipes
    WHERE user_id = ${user_id}
  `);

  if (result.length === 0) {
    // No entry yet, insert a new row
    await DButils.execQuery(`
      INSERT INTO LastWatchedRecipes (user_id, recipe_id1)
      VALUES (${user_id}, ${new_recipe_id})
    `);
  } else {
    const { recipe_id1, recipe_id2, recipe_id3 } = result[0];

    // If recipe is already in the list, remove it before re-adding (optional enhancement)
    const list = [recipe_id1, recipe_id2, recipe_id3].filter(r => r !== null && r !== new_recipe_id);

    // Add new recipe at the end, keep only last 3
    list.unshift(new_recipe_id); // add new to front
    const [r1, r2, r3] = list.slice(0, 3); // max 3

    await DButils.execQuery(`
      UPDATE LastWatchedRecipes
      SET recipe_id1 = ${r1 ?? 'NULL'},
          recipe_id2 = ${r2 ?? 'NULL'},
          recipe_id3 = ${r3 ?? 'NULL'}
      WHERE user_id = ${user_id}
    `);
  }
}

async function getLastWatched(user_id) {
  const result = await DButils.execQuery(`
    SELECT recipe_id1, recipe_id2, recipe_id3
    FROM LastWatchedRecipes
    WHERE user_id = ${user_id}
  `);

  // User not found in table
  if (result.length === 0) {
    return "none";
  }

  // Extract recipe IDs and filter out nulls
  const { recipe_id1, recipe_id2, recipe_id3 } = result[0];
  const watched = [recipe_id1, recipe_id2, recipe_id3].filter(id => id !== null);

  if (watched.length === 0) {
    return "none";
  }

  return watched;
}

async function insertRecipe({
  user_id,
  title,
  image = '/api/placeholder/400/300',
  readyInMinutes = 30,
  popularity = 0,
  vegan = false,
  vegetarian = false,
  glutenFree = false,
  instructions,
  ingredients
}) {
  try {
    console.log('Inserting recipe with data:', {
      user_id, title, readyInMinutes, vegan, vegetarian, glutenFree
    });

    // וודא שרכיבים הם מחרוזת
    let ingredientsStr = '';
    if (Array.isArray(ingredients)) {
      ingredientsStr = ingredients.join(', ');
    } else {
      ingredientsStr = ingredients || '';
    }

    // ניקוי המחרוזות מתווים מיוחדים
    const cleanTitle = title ? title.replace(/'/g, "''") : '';
    const cleanInstructions = instructions ? instructions.replace(/'/g, "''") : '';
    const cleanIngredients = ingredientsStr ? ingredientsStr.replace(/'/g, "''") : '';
    const cleanImage = image ? image.replace(/'/g, "''") : '/api/placeholder/400/300';

    // SQL בלי servings זמנית
    const query = `
      INSERT INTO userrecipes (
        user_id, title, image, readyInMinutes, popularity,
        vegan, vegetarian, glutenFree, instructions, ingredients
      ) VALUES (
        ${user_id}, 
        '${cleanTitle}', 
        '${cleanImage}', 
        ${readyInMinutes || 30}, 
        ${popularity || 0},
        ${vegan ? 1 : 0}, 
        ${vegetarian ? 1 : 0}, 
        ${glutenFree ? 1 : 0},
        '${cleanInstructions}', 
        '${cleanIngredients}'
      )
    `;

    console.log('Executing query:', query);

    const result = await DButils.execQuery(query);
    console.log('Recipe inserted successfully:', result);
    return result;
  } catch (error) {
    console.error('Error inserting recipe:', error);
    throw error;
  }
}

async function getUserRecipes(user_id) {
  try {
    console.log('Getting user recipes for user_id:', user_id);
    
    const recipes = await DButils.execQuery(`
      SELECT id, title, image, readyInMinutes, popularity, vegan, vegetarian, glutenFree, servings, instructions, ingredients
      FROM userrecipes WHERE user_id = '${user_id}'
    `);
    
    console.log('Found recipes:', recipes.length);
    
    return recipes.map(recipe => ({
      id: recipe.id,  // השתמש ב-id הנכון
      title: recipe.title || 'No Title',
      image: recipe.image || '/api/placeholder/400/300',
      readyInMinutes: recipe.readyInMinutes || 30,
      popularity: recipe.popularity || 0,
      aggregateLikes: recipe.popularity || 0,
      vegan: !!recipe.vegan,
      vegetarian: !!recipe.vegetarian,
      glutenFree: !!recipe.glutenFree,
      servings: recipe.servings || 1,
      instructions: recipe.instructions || '',
      ingredients: recipe.ingredients || ''
    }));
  } catch (error) {
    console.error('Error in getUserRecipes:', error);
    throw error;
  }
}

async function getUserRecipeById(user_id, recipe_id) {
  try {
    console.log('Getting user recipe by ID:', { user_id, recipe_id });
    
    // השתמש ב-id במקום recipe_id
    const result = await DButils.execQuery(
      `SELECT * FROM userrecipes WHERE user_id = ${user_id} AND id = ${recipe_id}`
    );
    
    console.log('Recipe found:', result.length > 0 ? 'Yes' : 'No');
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error getting user recipe by ID:', error);
    throw error;
  }
}

async function addViewedRecipe(user_id, recipeId) {
  await DButils.execQuery(`
    INSERT IGNORE INTO ViewedRecipes (user_id, recipeId)
    VALUES (${user_id}, ${recipeId})
  `);
}

async function getViewedRecipes(user_id) {
  const result = await DButils.execQuery(`
    SELECT recipeId FROM ViewedRecipes WHERE user_id = ${user_id}
  `);

  return result.map(row => row.recipeId);
}

async function removeFromFavorites(user_id, recipe_id) {
    try {
        const result = await DButils.execQuery(`DELETE FROM FavoriteRecipes WHERE user_id='${user_id}' AND recipe_id='${recipe_id}'`);
        return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
        console.error('Error removing from favorites:', error);
        throw error;
    }
}

exports.addToLastWatched = addToLastWatched;
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getLastWatched = getLastWatched;
exports.insertRecipe = insertRecipe;
exports.getUserRecipes = getUserRecipes;
exports.getUserRecipeById = getUserRecipeById;
exports.addViewedRecipe = addViewedRecipe;
exports.getViewedRecipes = getViewedRecipes;
exports.removeFromFavorites = removeFromFavorites;