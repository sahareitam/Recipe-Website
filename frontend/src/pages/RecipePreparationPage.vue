<template>
  <div class="recipe-preparation-page">
    <b-container>
      <!-- Header -->
      <div class="text-center mb-4">
        <h1 class="page-title">Recipe Preparation</h1>
        <p class="text-muted">Follow the steps to cook your recipe</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading recipe...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger">
        <h4>Error loading recipe</h4>
        <p>{{ error }}</p>
        <b-button variant="outline-primary" @click="goBackToRecipe">
          Back to Recipe
        </b-button>
      </div>

      <!-- Recipe Content -->
      <div v-else-if="recipe">
        <!-- Recipe Info -->
        <div class="content-card mb-4">
          <div class="row">
            <div class="col-md-4">
              <img :src="recipe.image" :alt="recipe.title" class="recipe-image">
            </div>
            <div class="col-md-8">
              <h2 class="recipe-title">{{ recipe.title }}</h2>
              <div class="recipe-details">
                <div class="detail-item">
                  <i class="fas fa-clock me-2"></i>
                  <span>{{ recipe.readyInMinutes }} minutes</span>
                </div>
                <div class="detail-item">
                  <i class="fas fa-utensils me-2"></i>
                  <span>{{ currentServings }} servings</span>
                </div>
                <div class="detail-item">
                  <i class="fas fa-heart me-2"></i>
                  <span>{{ recipe.aggregateLikes }} likes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Servings Multiplier -->
        <div class="content-card mb-4">
          <h3 class="section-subtitle">Adjust Servings</h3>
          <div class="servings-control">
            <b-button 
              variant="outline-primary" 
              @click="decreaseServings" 
              :disabled="currentServings <= 1"
              class="servings-btn"
            >
              <i class="fas fa-minus"></i>
            </b-button>
            <span class="servings-display">{{ currentServings }} servings</span>
            <b-button 
              variant="outline-primary" 
              @click="increaseServings"
              class="servings-btn"
            >
              <i class="fas fa-plus"></i>
            </b-button>
          </div>
        </div>

        <!-- Ingredients List -->
        <div class="content-card mb-4">
          <h3 class="section-subtitle">Ingredients</h3>
          <div class="ingredients-list">
            <div 
              v-for="ingredient in adjustedIngredients" 
              :key="ingredient.id" 
              class="ingredient-item"
            >
              <span class="ingredient-amount">{{ ingredient.adjustedAmount }} {{ ingredient.unit }}</span>
              <span class="ingredient-name">{{ ingredient.name }}</span>
            </div>
          </div>
        </div>

        <!-- Cooking Steps -->
        <div class="content-card" v-if="recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0">
          <h3 class="section-subtitle">Cooking Steps</h3>
          <div 
            v-for="step in recipe.analyzedInstructions[0].steps" 
            :key="step.number"
            class="step-card"
            :class="{ 'completed-step': checkedSteps[step.number - 1] }"
          >
            <div class="step-header">
              <div class="step-checkbox">
                <input 
                  type="checkbox" 
                  :id="`step-${step.number}`"
                  v-model="checkedSteps[step.number - 1]"
                  @change="saveProgress"
                  class="form-check-input step-input"
                >
                <label :for="`step-${step.number}`" class="step-number">
                  Step {{ step.number }}
                </label>
              </div>
              <div v-if="step.length" class="step-time">
                <i class="fas fa-clock me-1"></i>
                {{ step.length.number }} {{ step.length.unit }}
              </div>
            </div>
            
            <div class="step-content">
              <p class="step-instruction">{{ step.step }}</p>
              
              <!-- Step Ingredients -->
              <div v-if="step.ingredients && step.ingredients.length > 0" class="step-details">
                <strong>Ingredients needed:</strong>
                <span class="step-tags">
                  <span 
                    v-for="ingredient in step.ingredients" 
                    :key="ingredient.id"
                    class="step-tag ingredient-tag"
                  >
                    {{ ingredient.name }}
                  </span>
                </span>
              </div>

              <!-- Step Equipment -->
              <div v-if="step.equipment && step.equipment.length > 0" class="step-details">
                <strong>Equipment needed:</strong>
                <span class="step-tags">
                  <span 
                    v-for="equipment in step.equipment" 
                    :key="equipment.id"
                    class="step-tag equipment-tag"
                  >
                    {{ equipment.name }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Back Button -->
        <div class="text-center mt-4">
          <b-button variant="outline-primary" @click="goBackToRecipe" class="custom-button">
            <i class="fas fa-arrow-left me-2"></i>
            Back to Recipe
          </b-button>
        </div>
      </div>
    </b-container>
  </div>
</template>

<script>
import { getCurrentInstance } from 'vue';

export default {
  name: 'RecipePreparationPage',
  data() {
    return {
      recipe: null,
      loading: true,
      error: null,
      checkedSteps: [],
      baseServings: 1,
      currentServings: 1
    };
  },
  computed: {
    adjustedIngredients() {
      if (!this.recipe || !this.recipe.extendedIngredients) return [];
      
      const multiplier = this.currentServings / this.baseServings;
      
      return this.recipe.extendedIngredients.map(ingredient => ({
        ...ingredient,
        adjustedAmount: (ingredient.amount * multiplier).toFixed(2)
      }));
    }
  },
  methods: {
    async loadRecipe() {
      try {
        this.loading = true;
        this.error = null;
        
        const recipeId = this.$route.params.recipeId;
        const response = await this.axios.get(`/recipes/fullInformation/${recipeId}`);
        
        this.recipe = response.data;
        this.baseServings = this.recipe.servings || 1;
        this.currentServings = this.baseServings;
        
        console.log('Recipe loaded:', this.recipe);
        console.log('Analyzed instructions:', this.recipe.analyzedInstructions);
        
        // Initialize progress tracking
        if (this.recipe.analyzedInstructions && this.recipe.analyzedInstructions.length > 0) {
          const stepsCount = this.recipe.analyzedInstructions[0].steps.length;
          this.checkedSteps = Array(stepsCount).fill(false);
          this.loadProgress();
        }
        
      } catch (error) {
        console.error('Error loading recipe:', error);
        this.error = error.response?.data?.message || 'Failed to load recipe';
      } finally {
        this.loading = false;
      }
    },
    
    increaseServings() {
      this.currentServings += 1;
    },
    
    decreaseServings() {
      if (this.currentServings > 1) {
        this.currentServings -= 1;
      }
    },
    
    saveProgress() {
      if (!this.store.username) return;
      const key = `recipeProgress_${this.store.username}_${this.$route.params.recipeId}`;
      localStorage.setItem(key, JSON.stringify(this.checkedSteps));
    },
    
    loadProgress() {
      if (!this.store.username) return;

      const key = `recipeProgress_${this.store.username}_${this.$route.params.recipeId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          this.checkedSteps = JSON.parse(saved);
        } catch (e) {
          console.error('Error loading progress:', e);
        }
      }
    },
    
    goBackToRecipe() {
      this.$router.push({
        name: 'recipe',
        params: { recipeId: this.$route.params.recipeId }
      });
    }
  },
  
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const axios = internalInstance.appContext.config.globalProperties.axios;
    
    return { store, axios };
  },
  
  async created() {
    await this.loadRecipe();
  }
};
</script>

<style lang="scss" scoped>
.recipe-preparation-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.page-title {
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.content-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.recipe-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.recipe-title {
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.recipe-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(66, 185, 131, 0.1);
  border-radius: 20px;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(66, 185, 131, 0.2);
    transform: translateY(-1px);
  }

  i {
    color: #42b983;
  }
}

.section-subtitle {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #42b983;
  padding-bottom: 0.5rem;
}

.servings-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
}

.servings-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #42b983;
  color: #42b983;
  
  &:hover {
    background-color: #42b983;
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.servings-display {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  min-width: 120px;
  text-align: center;
  padding: 0.5rem 1rem;
  background: rgba(66, 185, 131, 0.1);
  border-radius: 20px;
}

.ingredients-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.ingredient-item {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #42b983;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
    transform: translateX(5px);
  }
  
  .ingredient-amount {
    font-weight: 600;
    color: #42b983;
    min-width: 80px;
    font-size: 0.9rem;
  }
  
  .ingredient-name {
    color: #2c3e50;
    font-weight: 500;
    flex: 1;
  }
}

.step-card {
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #42b983;
    box-shadow: 0 2px 8px rgba(66, 185, 131, 0.1);
  }
  
  &.completed-step {
    background-color: rgba(66, 185, 131, 0.1);
    border-color: #42b983;
    
    .step-instruction {
      text-decoration: line-through;
      color: #6c757d;
    }
  }
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

.step-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.step-input {
  transform: scale(1.2);
  accent-color: #42b983;
}

.step-number {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0;
  cursor: pointer;
}

.step-time {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
  
  i {
    color: #42b983;
  }
}

.step-instruction {
  font-size: 1rem;
  line-height: 1.6;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 400;
}

.step-details {
  margin-bottom: 0.75rem;
  
  strong {
    color: #495057;
    font-size: 0.9rem;
    display: block;
    margin-bottom: 0.5rem;
  }
}

.step-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.step-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  
  &.ingredient-tag {
    background: rgba(66, 185, 131, 0.1);
    color: #42b983;
    border: 1px solid rgba(66, 185, 131, 0.3);
  }
  
  &.equipment-tag {
    background: rgba(108, 117, 125, 0.1);
    color: #6c757d;
    border: 1px solid rgba(108, 117, 125, 0.3);
  }
}

.custom-button {
  border-radius: 25px;
  padding: 0.75rem 2rem;
  font-weight: 500;
  font-size: 1.1rem;
  border: 2px solid #42b983;
  color: #42b983;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(66, 185, 131, 0.2);

  &:hover {
    background-color: #42b983;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(66, 185, 131, 0.3);
  }
}

@media (max-width: 767px) {
  .recipe-preparation-page {
    padding: 1rem 0;
  }

  .content-card {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .recipe-details {
    flex-direction: column;
    align-items: center;
    
    .detail-item {
      width: 100%;
      max-width: 200px;
      justify-content: center;
    }
  }

  .ingredients-list {
    grid-template-columns: 1fr;
  }

  .servings-control {
    gap: 1rem;
  }
}
</style>