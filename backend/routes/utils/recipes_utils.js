const axios = require("axios");
const e = require("express");
require("dotenv").config();
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
  //console.log("🔑 API KEY IS:", process.env.spooncular_apiKey); // 👈 Check if it’s defined!
  return await axios.get(`${api_domain}/${recipe_id}/information`, {
    params: {
      includeNutrition: false,
      apiKey: process.env.spooncular_apiKey
    }
  });
}

async function getRecipeDetails(recipe_id) {
  console.log("🔍 Fetching recipe details for ID:", recipe_id);
  try {
    let recipe_info = await getRecipeInformation(recipe_id);
    //console.log("📦 API response received");

    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, servings } = recipe_info.data;

    return {
      id,
      title,
      readyInMinutes,
      image,
      popularity: aggregateLikes,
      vegan,
      vegetarian,
      glutenFree,
      servings,
    };
  } catch (error) {
    //console.error("❌ Error in getRecipeDetails:", error.response?.data || error.message);
    throw error;
  }
}

async function getMultipleRecipeDetails(recipe_ids_array) {
  const results = [];

  for (const id of recipe_ids_array) {
    const detail = await getRecipeDetails(id); // call your original function
    results.push(detail);
  }

  return results;
}

async function getMultipleRecipeDetailsBulk(recipe_ids_array) {
  console.log("🔍 Fetching bulk recipe details for IDs:", recipe_ids_array);
  
  if (!recipe_ids_array || recipe_ids_array.length === 0) {
    return [];
  }

  try {
    const idsString = recipe_ids_array.join(',');
    const response = await axios.get(`${api_domain}/informationBulk`, {
      params: {
        ids: idsString,
        includeNutrition: false,
        apiKey: process.env.spooncular_apiKey
      }
    });

    console.log(`📦 Bulk API response received for ${recipe_ids_array.length} recipes`);

    return response.data.map(recipe => {
      const { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, servings } = recipe;
      return {
        id,
        title,
        readyInMinutes,
        image,
        popularity: aggregateLikes,
        vegan,
        vegetarian,
        glutenFree,
        servings,
      };
    });
  } catch (error) {
    console.error("❌ Error in getMultipleRecipeDetailsBulk:", error.response?.data || error.message);
    throw error;
  }
}


async function getRandomRecipes() {
  const response = await axios.get(`${api_domain}/random`, {
    params: {
      number: 3,
      includeNutrition: false, 
      apiKey: process.env.spooncular_apiKey,
    }
  });

  return response.data.recipes; 
}


async function searchRecipes(query, cuisine, diet, intolerances, number, sort = "popularity") {
  const response = await axios.get(`${api_domain}/complexSearch`, {
    params: {
      query,
      cuisine,
      diet,
      intolerances,
      number,
      sort,
      addRecipeInformation: true,
      apiKey: process.env.spooncular_apiKey,
    }
  });
  return response.data.results;
}

async function getRecipeAnalyzedInstructions(recipe_id) {
  try {
    const response = await axios.get(`${api_domain}/${recipe_id}/analyzedInstructions`, {
      params: {
        apiKey: process.env.spooncular_apiKey
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching analyzed instructions:", error);
    throw error;
  }
}

async function getRecipeFullInformation(recipe_id) {
  try {
    console.log("🔍 Fetching full recipe information for ID:", recipe_id);
    
    // Get basic recipe information
    const basicInfo = await getRecipeInformation(recipe_id);
    
    // Get detailed cooking steps
    const analyzedInstructions = await getRecipeAnalyzedInstructions(recipe_id);
    
    // Combine everything together
    const fullRecipe = {
      ...basicInfo.data,
      analyzedInstructions: analyzedInstructions
    };
    
    console.log(" Full recipe information fetched successfully");
    return fullRecipe;
  } catch (error) {
    console.error(" Error fetching full recipe information:", error);
    throw error;
  }
}

exports.searchRecipes = searchRecipes;
exports.getRecipeDetails = getRecipeDetails;
exports.getRandomRecipes = getRandomRecipes;
exports.getMultipleRecipeDetails = getMultipleRecipeDetails;
exports.getMultipleRecipeDetailsBulk = getMultipleRecipeDetailsBulk;
exports.getRecipeInformation = getRecipeInformation;
exports.getRecipeAnalyzedInstructions = getRecipeAnalyzedInstructions;
exports.getRecipeFullInformation = getRecipeFullInformation;