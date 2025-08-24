<template>
  <div class="container mt-4">
    <h1 class="mb-4">My Favorite Recipes</h1>
    
    <div v-if="!store.username" class="text-center">
      <div class="alert alert-warning" role="alert">
        <h4>Please login to view your favorites</h4>
        <router-link :to="{ name: 'login' }">
          <button class="btn btn-primary">Login</button>
        </router-link>
      </div>
    </div>
    
    <div v-else>
      <div v-if="isLoading" class="text-center my-4">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>Loading your favorite recipes...</p>
      </div>
      
      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>
      
      <div v-else-if="favoriteRecipes.length === 0" class="text-center my-4">
        <div class="alert alert-info" role="alert">
          <h4>No favorite recipes yet</h4>
          <p>Start exploring and save your favorite recipes!</p>
          <router-link :to="{ name: 'search' }">
            <button class="btn btn-primary">Search Recipes</button>
          </router-link>
        </div>
      </div>
      
      <div v-else class="row">
        <div class="col-md-4 mb-3" v-for="recipe in favoriteRecipes" :key="recipe.id">
          <RecipePreview 
            :recipe="recipe" 
            @recipe-favorited="refreshFavorites"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentInstance } from 'vue';
import RecipePreview from '../components/RecipePreview.vue';

export default {
  name: 'FavoritesPage',
  components: {
    RecipePreview,
  },
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const axios = internalInstance.appContext.config.globalProperties.axios;
    const toast = internalInstance.appContext.config.globalProperties.toast;
    
    return { store, axios, toast };
  },
  data() {
    return {
      favoriteRecipes: [],
      isLoading: false,
      error: null,
    };
  },
  async mounted() {
    if (this.store.username) {
      await this.loadFavorites();
    }
  },
  methods: {
    async loadFavorites() {
      this.isLoading = true;
      this.error = null;
      this.favoriteRecipes = [];
      
      try {
        const response = await this.axios.get(
          `${this.store.server_domain}/users/favorites`,
          { withCredentials: true }
        );
        
        if (response.data && Array.isArray(response.data)) {
          this.favoriteRecipes = response.data;
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        if (error.response?.status === 404) {
          // No favorites found - this is not an error
          this.favoriteRecipes = [];
        } else {
          this.error = 'Failed to load favorite recipes. Please try again later.';
          this.toast('Error', this.error, 'danger');
        }
      } finally {
        this.isLoading = false;
      }
    },
    
    refreshFavorites() {
      this.loadFavorites();
    },
  },
  watch: {
    'store.username': {
      handler(newValue) {
        if (newValue) {
          this.loadFavorites();
        } else {
          this.favoriteRecipes = [];
        }
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>