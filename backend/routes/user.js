var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;

    if (!recipe_id) {
      throw { status: 400, message: "Missing recipeId in request body" };
    }

    await user_utils.markAsFavorite(user_id, recipe_id);
    res.status(200).send({ message: `Recipe ${recipe_id} saved as favorite`, success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);

    if (!recipes_id || recipes_id.length === 0) {
      throw { status: 404, message: "No favorite recipes found" };
    }

    const recipes_id_array = recipes_id.map(element => element.recipe_id);
    const results = await recipe_utils.getMultipleRecipeDetailsBulk(recipes_id_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

router.post('/lastWatched', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;

    if (!recipe_id) {
      throw { status: 400, message: "Missing recipeId in request body" };
    }

    await user_utils.addToLastWatched(user_id, recipe_id);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

router.get('/lastWatched', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const results = await user_utils.getLastWatched(user_id);

    if (results === "none") {
      throw { status: 404, message: "No recently watched recipes found" };
    }

    res.status(200).send(results);
  } catch (err) {
    next(err);
  }
});

router.post('/add-recipes', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipeData = req.body;

    if (!recipeData.title || !recipeData.instructions || !recipeData.ingredients) {
      throw { status: 400, message: "Missing required recipe fields" };
    }

    await user_utils.insertRecipe({ user_id, ...recipeData });
    res.status(201).send({ message: "Recipe created successfully", success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/my-recipes', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const results = await user_utils.getUserRecipes(user_id);

    res.status(200).send({ results, success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/viewed', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipeId = req.body.recipeId;

    if (!recipeId) {
      throw { status: 400, message: "Missing recipeId" };
    }

    await user_utils.addViewedRecipe(user_id, recipeId);
    res.status(201).send({ message: "Recipe view added", success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/viewed', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const viewed = await user_utils.getViewedRecipes(user_id);

    res.status(200).send({ viewed });
  } catch (error) {
    next(error);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    if (!user_id) {
      throw { status: 401, message: "Unauthorized" };
    }
    res.status(200).send({ user_id });
  } catch (error) {
    next(error);
  }
});

/**
 * Check if a specific recipe is in the user's favorites (without fetching full recipe details)
 */
router.get('/favorites/check/:recipeId', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipeId;

    if (!recipe_id) {
      throw { status: 400, message: "Missing recipeId parameter" };
    }

    const result = await DButils.execQuery(
      `SELECT COUNT(*) as count FROM FavoriteRecipes WHERE user_id = ${user_id} AND recipe_id = ${recipe_id}`
    );

    const isFavorite = result[0].count > 0;
    res.status(200).send({ isFavorite });
  } catch (error) {
    next(error);
  }
});

/**
 * Remove a recipe from user's favorites
 */
router.delete('/favorites/:recipeId', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipeId;

    if (!recipe_id) {
      throw { status: 400, message: "Missing recipeId parameter" };
    }

    await user_utils.removeFromFavorites(user_id, recipe_id);
    res.status(200).send({ message: `Recipe ${recipe_id} removed from favorites`, success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/my-recipes/:recipeId', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipeId;

    if (!recipe_id) {
      throw { status: 400, message: "Missing recipe ID" };
    }

    const recipe = await user_utils.getUserRecipeById(user_id, recipe_id);
    
    if (!recipe) {
      throw { status: 404, message: "Recipe not found" };
    }

    // Convert to compatible format for RecipeViewPage
    const formattedRecipe = {
      id: recipe.id,  // השתמש ב-id הנכון
      title: recipe.title,
      readyInMinutes: recipe.readyInMinutes || 0,
      image: recipe.image || '/api/placeholder/400/300',
      aggregateLikes: recipe.popularity || 0,
      vegan: recipe.vegan || false,
      vegetarian: recipe.vegetarian || false,
      glutenFree: recipe.glutenFree || false,
      servings: recipe.servings || 1,
      instructions: recipe.instructions || '',
      // Format ingredients as extendedIngredients array
      extendedIngredients: recipe.ingredients ? 
        (typeof recipe.ingredients === 'string' ? 
          recipe.ingredients.split(',').map((ingredient, index) => ({
            id: index + 1,
            original: ingredient.trim(),
            name: ingredient.trim()
          })) : 
          recipe.ingredients.map((ingredient, index) => ({
            id: index + 1,
            original: ingredient,
            name: ingredient
          }))
        ) : [],
      // Format instructions as analyzedInstructions
      analyzedInstructions: recipe.instructions ? [{
        name: '',
        steps: recipe.instructions.split('.').filter(step => step.trim()).map((step, index) => ({
          number: index + 1,
          step: step.trim() + '.',
          ingredients: [],
          equipment: []
        }))
      }] : [],
      // Mark as user recipe
      isUserRecipe: true
    };

    res.status(200).send(formattedRecipe);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
