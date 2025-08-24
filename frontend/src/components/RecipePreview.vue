<template>
  <div class="recipe-preview-card" @click="navigateToRecipe">
    <div class="card">
      <div class="image-container">
        <img
          v-if="recipe.image"
          :src="recipe.image"
          class="card-img-top recipe-image"
          alt="Recipe image"
        />
        <div v-else class="no-image">
          <i class="bi bi-image"></i>
        </div>
      </div>
      <div class="card-body d-flex flex-column">
        <!-- שורה 1: כותרת -->
        <h5 class="card-title text-center mb-2">{{ recipe.title }}</h5>
        
        <!-- שורה 2: מנות -->
        <div class="info-row servings-row">
          <span class="serving-icon">👤</span>
          <span class="serving-number">{{ recipe.servings || 4 }}</span>
        </div>
        
        <!-- שורה 3: זמן -->
        <div class="info-row time-row">
          <span class="time-icon">⏰</span>
          <span class="time-number">{{ recipe.readyInMinutes }}</span>
          <span class="time-label">mins</span>
        </div>
        
        <!-- שורה 4: לייקים -->
        <div class="info-row likes-row">
          <span class="likes-icon">♡</span>
          <span class="likes-number">{{ recipe.aggregateLikes }}</span>
          <span class="likes-label">likes</span>
        </div>
        
        <!-- שורה 5: סמלי דיאטה -->
        <div class="info-row diet-row" v-if="recipe.vegetarian || recipe.vegan || recipe.glutenFree">
          <span v-if="recipe.vegetarian" class="diet-emoji">🌱</span>
          <span v-if="recipe.vegan" class="diet-emoji">🌿</span>
          <span v-if="recipe.glutenFree" class="diet-emoji">🚫</span>
        </div>
        
        <!-- שורה 6: אחרונה - viewed ולב -->
        <div class="actions-row">
          <div v-if="isViewed" class="viewed-indicator">
            <span class="eye-icon">👁️</span>
            <span class="viewed-text">Viewed</span>
          </div>
          <div v-if="store.username" class="favorite-container">
            <button 
              @click.stop="toggleFavorite" 
              :class="['favorite-btn', {'is-favorite': isFavorite}]"
              :disabled="favoriteLoading"
            >
              <span class="heart-icon">{{ isFavorite ? '❤️' : '🤍' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentInstance } from 'vue';

export default {
  name: "RecipePreview",
  props: {
    recipe: {
      type: Object,
      required: true
    },
    isFromLastViewed: {
      type: Boolean,
      default: false
    }
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
      isFavorite: false,
      favoriteLoading: false,
      isViewed: false,
    };
  },
  mounted() {
    // Debug: Log recipe data to see what properties are available
    console.log('Recipe data in RecipePreview:', this.recipe);
    console.log('Vegetarian:', this.recipe.vegetarian);
    console.log('Vegan:', this.recipe.vegan);
    console.log('GlutenFree:', this.recipe.glutenFree);
    
    // Check if this recipe has been viewed
    this.checkIfViewed();
    // Check if this recipe is in favorites
    this.checkIfFavorite();
  },
  methods: {
    navigateToRecipe() {
      this.markAsViewed();
      this.$router.push(`/recipe/${this.recipe.id}`);
    },
    
    async checkIfViewed() {
      if (!this.store.username) return;
      
      // Check localStorage first (fast response)
      const localViewed = JSON.parse(localStorage.getItem(`viewed_${this.store.username}`) || '[]');
      this.isViewed = localViewed.includes(this.recipe.id);
      
      // Then check backend (accurate data)
      try {
        const response = await this.axios.get(
          `${this.store.server_domain}/users/viewed`,
          { withCredentials: true }
        );
        
        if (response.data) {
          const backendViewed = response.data.viewed || [];
          this.isViewed = backendViewed.includes(this.recipe.id);
          
          // Sync localStorage with backend data
          localStorage.setItem(`viewed_${this.store.username}`, JSON.stringify(backendViewed));
        }
      } catch (error) {
        console.error('Error checking viewed status:', error);
        // Keep localStorage value if backend fails
      }
    },
    
    async markAsViewed() {
      if (!this.store.username) return;
      
      // Update localStorage immediately (fast response)
      const viewedRecipes = JSON.parse(localStorage.getItem(`viewed_${this.store.username}`) || '[]');
      if (!viewedRecipes.includes(this.recipe.id)) {
        viewedRecipes.push(this.recipe.id);
        localStorage.setItem(`viewed_${this.store.username}`, JSON.stringify(viewedRecipes));
        this.isViewed = true;
      }
      
      // Save full recipe data for Last Watched cache
      localStorage.setItem(`recipe_${this.recipe.id}`, JSON.stringify(this.recipe));
      
      // Update Last Watched localStorage cache
      const lastWatchedKey = `lastWatched_${this.store.username}`;
      let lastWatchedRecipes = JSON.parse(localStorage.getItem(lastWatchedKey) || '[]');
      
      // Remove recipe if it already exists (to avoid duplicates)
      lastWatchedRecipes = lastWatchedRecipes.filter(r => r.id !== this.recipe.id);
      
      // Add current recipe to the beginning
      lastWatchedRecipes.unshift(this.recipe);
      
      // Keep only last 3 recipes
      lastWatchedRecipes = lastWatchedRecipes.slice(0, 3);
      
      // Save updated Last Watched list
      localStorage.setItem(lastWatchedKey, JSON.stringify(lastWatchedRecipes));
      
      // Update backend
      try {
        // Add to viewed recipes
        await this.axios.post(
          `${this.store.server_domain}/users/viewed`,
          { recipeId: this.recipe.id },
          { withCredentials: true }
        );
        
        // Add to last watched recipes
        await this.axios.post(
          `${this.store.server_domain}/users/lastWatched`,
          { recipeId: this.recipe.id },
          { withCredentials: true }
        );
      } catch (error) {
        console.error('Error updating viewed/lastWatched:', error);
        // Keep localStorage update even if backend fails
      }
    },
    
    async addToFavorites() {
      if (!this.store.username || this.favoriteLoading || this.isFavorite) return;
      
      this.favoriteLoading = true;
      
      try {
        const response = await this.axios.post(
          `${this.store.server_domain}/users/favorites`,
          { recipeId: this.recipe.id },
          { withCredentials: true }
        );

        if (response.data.success) {
          this.isFavorite = true;
          this.toast('Success', 'Added to favorites! ❤️', 'success');
          
          // Emit event to update favorites list
          this.$emit('recipe-favorited', this.recipe);
          
          // Update local storage to remember this recipe is favorited
          const favoritedRecipes = JSON.parse(localStorage.getItem(`favorites_${this.store.username}`) || '[]');
          if (!favoritedRecipes.includes(this.recipe.id)) {
            favoritedRecipes.push(this.recipe.id);
            localStorage.setItem(`favorites_${this.store.username}`, JSON.stringify(favoritedRecipes));
          }
        }
      } catch (error) {
        console.error('Error adding to favorites:', error);
        
        // אם זו שגיאת Duplicate entry, נתייחס לזה כאילו המתכון כבר במועדפים
        if (error.response?.status === 500 && 
            typeof error.response?.data === 'string' && 
            error.response.data.includes('Duplicate entry')) {
          this.isFavorite = true;
          
          // Update local storage
          const favoritedRecipes = JSON.parse(localStorage.getItem(`favorites_${this.store.username}`) || '[]');
          if (!favoritedRecipes.includes(this.recipe.id)) {
            favoritedRecipes.push(this.recipe.id);
            localStorage.setItem(`favorites_${this.store.username}`, JSON.stringify(favoritedRecipes));
          }
          
          // Emit event to refresh favorites list
          this.$emit('recipe-favorited', this.recipe);
        } else {
          this.toast('Error', 'Failed to add to favorites', 'danger');
        }
      } finally {
        this.favoriteLoading = false;
      }
    },

    async removeFromFavorites() {
      if (!this.store.username || this.favoriteLoading) return;
      
      console.log('Removing from favorites, recipe ID:', this.recipe.id, 'isFavorite:', this.isFavorite);
      this.favoriteLoading = true;
      
      try {
        const response = await this.axios.delete(
          `${this.store.server_domain}/users/favorites/${this.recipe.id}`,
          { withCredentials: true }
        );

        console.log('Remove response:', response.data);
        if (response.data && response.data.success) {
          this.isFavorite = false;
          this.toast('Success', 'Removed from favorites 🤍', 'success');
          
          // Update localStorage
          const favoritedRecipes = JSON.parse(localStorage.getItem(`favorites_${this.store.username}`) || '[]');
          const index = favoritedRecipes.indexOf(this.recipe.id);
          if (index > -1) {
            favoritedRecipes.splice(index, 1);
            localStorage.setItem(`favorites_${this.store.username}`, JSON.stringify(favoritedRecipes));
          }
          
          // Emit event to update favorites list
          this.$emit('recipe-favorited', this.recipe);
        } else {
          console.warn('Remove request succeeded but no success flag in response');
          this.isFavorite = false;
          this.toast('Success', 'Removed from favorites 🤍', 'success');
          
          // Update localStorage anyway
          const favoritedRecipes = JSON.parse(localStorage.getItem(`favorites_${this.store.username}`) || '[]');
          const index = favoritedRecipes.indexOf(this.recipe.id);
          if (index > -1) {
            favoritedRecipes.splice(index, 1);
            localStorage.setItem(`favorites_${this.store.username}`, JSON.stringify(favoritedRecipes));
          }
          
          this.$emit('recipe-favorited', this.recipe);
        }
      } catch (error) {
        console.error('Error removing from favorites:', error);
        this.toast('Error', 'Failed to remove from favorites', 'danger');
      } finally {
        this.favoriteLoading = false;
      }
    },

    toggleFavorite() {
      console.log('Toggle favorite clicked, current state:', this.isFavorite);
      if (this.isFavorite) {
        this.removeFromFavorites();
      } else {
        this.addToFavorites();
      }
    },
    
    async checkIfFavorite() {
      if (!this.store.username) return;
      
      try {
        // First check localStorage for quick response
        const favoritedRecipes = JSON.parse(localStorage.getItem(`favorites_${this.store.username}`) || '[]');
        if (favoritedRecipes.includes(this.recipe.id)) {
          this.isFavorite = true;
          return;
        }
        
        // Use the new optimized endpoint that only checks if recipe is favorite
        const response = await this.axios.get(
          `${this.store.server_domain}/users/favorites/check/${this.recipe.id}`,
          { withCredentials: true }
        );
        
        if (response.data) {
          this.isFavorite = response.data.isFavorite;
          
          // Update localStorage if recipe is favorited
          if (this.isFavorite && !favoritedRecipes.includes(this.recipe.id)) {
            favoritedRecipes.push(this.recipe.id);
            localStorage.setItem(`favorites_${this.store.username}`, JSON.stringify(favoritedRecipes));
          }
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    },
  }
}
</script>

<style scoped>
.recipe-preview-card {
  width: 350px;  
  height: 400px; 
  margin: 0 auto;
  cursor: pointer;
}

.card {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.image-container {
  height: 40%;
  overflow: hidden;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  background-color: #f8f9fa;
  position: relative;
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.image-container:hover .recipe-image {
  transform: scale(1.1);
  filter: brightness(0.8);
}

.image-container::after {
  content: "👆";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.image-container:hover::after {
  opacity: 1;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #dee2e6;
}

.card-body {
  height: 60%;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  /* Ensure consistent height for titles */
  height: 2.4em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* שורות המידע החדשות */
.info-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0;
  font-size: 0.9rem;
}

/* שורת מנות */
.servings-row {
  justify-content: flex-start;
}

.serving-icon {
  font-size: 1.1rem;
}

.serving-number {
  font-weight: 500;
  color: #2c3e50;
}

/* שורת זמן */
.time-row {
  justify-content: flex-start;
}

.time-icon {
  font-size: 1.1rem;
}

.time-number {
  font-weight: 500;
  color: #2c3e50;
}

.time-label {
  color: #6c757d;
  font-size: 0.85rem;
}

/* שורת לייקים */
.likes-row {
  justify-content: flex-start;
}

.likes-icon {
  font-size: 1.1rem;
  color: #6c757d;
}

.likes-number {
  font-weight: 500;
  color: #2c3e50;
}

.likes-label {
  color: #6c757d;
  font-size: 0.85rem;
}

/* שורת דיאטה */
.diet-row {
  justify-content: flex-start;
  gap: 0.3rem;
}

.diet-emoji {
  font-size: 1rem;
}

.favorite-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: rgba(255, 107, 107, 0.3);
  backdrop-filter: blur(10px);
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.favorite-btn:not(:disabled):hover {
  background: rgba(255, 107, 107, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.favorite-btn:disabled {
  opacity: 1 !important;
  cursor: not-allowed;
}

.favorite-btn.is-favorite {
  background: rgba(40, 167, 69, 0.4) !important;
  color: white !important;
  cursor: pointer !important;
  opacity: 1 !important;
}

.favorite-btn.is-favorite:hover {
  background: rgba(255, 107, 107, 0.5) !important;
  cursor: pointer !important;
}

.heart-icon {
  font-size: 1.5rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: inline-block;
}

.favorite-btn:not(:disabled):hover .heart-icon {
  transform: scale(1.3) translateY(-2px);
}

.btn-text {
  font-weight: 500;
  letter-spacing: 0.3px;
}

.favorite-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(255, 255, 255, 0.2), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.favorite-btn:not(:disabled):hover::before {
  opacity: 1;
}

/* Custom scrollbar for overflow content */
.card-body::-webkit-scrollbar {
  width: 4px;
}

.card-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.card-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.card-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.actions-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: auto;
  padding-top: 0.5rem;
  gap: 0.5rem;
  position: relative;
}

.viewed-indicator {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #007bff;
  font-size: 0.9rem;
  position: absolute;
  left: 0;
}

.eye-icon {
  font-size: 1rem;
}

.viewed-text {
  font-weight: 500;
}

.favorite-container {
  display: flex;
  justify-content: flex-end;
}
</style>
