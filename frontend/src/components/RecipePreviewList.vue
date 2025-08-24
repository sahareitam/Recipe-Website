<template>
  <div class="recipe-list">
    <h3>{{ title }}</h3>
    <div v-if="recipes.length > 0" class="recipe-grid">
      <RecipePreview v-for="r in recipes" :recipe="r" :key="r.id"/>
    </div>
    <div v-else class="no-recipes">
      <p>No recipes found</p>
    </div>
    <button v-if="!isLastViewed" @click="updateRecipes(true)" class="btn btn-primary mt-4 refresh-button">
      <span v-if="!isLoading">Refresh Random Recipes</span>
      <b-spinner small v-else></b-spinner>
    </button>
  </div>
</template>

<script>
import { getCurrentInstance } from 'vue';
import RecipePreview from "./RecipePreview.vue";

export default {
  name: "RecipePreviewList",
  components: {
    RecipePreview,
  },
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const axios = internalInstance.appContext.config.globalProperties.axios;

    return { store, axios };
  },
  props: {
    title: {
      type: String,
      required: true
    },
    isLastViewed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      recipes: [],
      isLoading: false
    };
  },
  methods: {
    async updateRecipes(forceRefresh = false) {
      if (this.isLoading) return;
      
      // Handle last viewed recipes
      if (this.isLastViewed) {
        if (!this.store.username) {
          this.recipes = [];
          return;
        }
        
        try {
          // First try localStorage cache (fast response)
          const lastWatchedKey = `lastWatched_${this.store.username}`;
          const cachedRecipes = JSON.parse(localStorage.getItem(lastWatchedKey) || '[]');
          
          if (cachedRecipes.length > 0) {
            this.recipes = cachedRecipes;
            return;
          }
          
          // If no cache, try to build from backend + individual recipe cache
          const response = await this.axios.get(
            this.store.server_domain + '/users/lastWatched',
            { withCredentials: true }
          );
          
          if (response.data && response.data.length > 0) {
            const recipeIds = response.data;
            const foundRecipes = [];
            
            // Look for each recipe in localStorage cache
            for (const id of recipeIds) {
              const cachedRecipe = localStorage.getItem(`recipe_${id}`);
              if (cachedRecipe) {
                try {
                  const recipe = JSON.parse(cachedRecipe);
                  foundRecipes.push(recipe);
                } catch (error) {
                  console.error(`Error parsing cached recipe ${id}:`, error);
                }
              }
            }
            
            this.recipes = foundRecipes.slice(0, 3);
            
            // Update the lastWatched cache with found recipes
            if (foundRecipes.length > 0) {
              localStorage.setItem(lastWatchedKey, JSON.stringify(this.recipes));
            }
          } else {
            this.recipes = [];
          }
        } catch (error) {
          console.error('Error fetching last watched recipes:', error);
          
          // Final fallback to empty array
          this.recipes = [];
        }
        return;
      }
      
      // Handle random recipes
      if (!forceRefresh) {
        const cachedRecipes = localStorage.getItem('randomRecipes');
        if (cachedRecipes) {
          this.recipes = JSON.parse(cachedRecipes);
          return;
        }
      }

      // Fetch new random recipes if no cache or force refresh
      try {
        this.isLoading = true;
        
        // Clear existing random recipes from localStorage first
        localStorage.removeItem('randomRecipes');
        
        const response = await this.axios.get(this.store.server_domain + "/recipes/random");
        // Ensure exactly 3 recipes
        this.recipes = response.data.recipes.slice(0, 3);
        
        // Cache exactly 3 new random recipes
        localStorage.setItem('randomRecipes', JSON.stringify(this.recipes));
      } catch (error) {
        console.error("Failed to fetch recipes from API:", error);
        
        // Clear existing random recipes from localStorage first
        localStorage.removeItem('randomRecipes');
        
        // Set empty array and show error message
        this.recipes = [];
        alert('שגיאה בטעינת מתכונים אקראיים. אנא נסה שוב מאוחר יותר.');
      } finally {
        this.isLoading = false;
      }
    }
  },
  mounted() {
    this.updateRecipes();
  }
};
</script>

<style lang="scss" scoped>
.recipe-list {
  width: 100%;
  text-align: center;
}

.recipe-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.no-recipes {
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 15px;
  text-align: center;
  color: #6c757d;
  width: 300px;
  margin: 0 auto;
}

.refresh-button {
  padding: 0.75rem 2rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
}

@media (max-width: 767px) {
  .recipe-grid {
    gap: 1.5rem;
  }
}
</style>
