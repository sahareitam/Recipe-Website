<template>
  <div class="meal-plan-page">
    <b-container>
      <!-- Header -->
      <div class="text-center mb-4">
        <h1 class="page-title">Meal Plan</h1>
        <p class="text-muted">Plan your cooking session - {{ mealPlan.length }} recipes</p>
      </div>

      <!-- Empty State -->
      <div v-if="mealPlan.length === 0" class="text-center">
        <div class="empty-state">
          <i class="fas fa-utensils fa-4x text-muted mb-3"></i>
          <h3>No Recipes in Your Meal Plan</h3>
          <p class="text-muted mb-4">Start adding recipes to plan your cooking session!</p>
          <b-button variant="primary" :to="{ name: 'search' }" class="custom-button">
            <i class="fas fa-search me-2"></i>
            Find Recipes
          </b-button>
        </div>
      </div>

      <!-- Meal Plan Content -->
      <div v-else>
        <!-- Action Buttons -->
        <div class="action-buttons mb-4">
          <b-button 
            variant="outline-danger" 
            @click="clearAll"
            class="me-3"
          >
            <i class="fas fa-trash me-2"></i>
            Clear All
          </b-button>
          <span class="text-muted">{{ mealPlan.length }} recipes in your plan</span>
        </div>

        <!-- Recipe List -->
        <div class="meal-plan-list">
          <div 
            v-for="(recipe, index) in mealPlan" 
            :key="recipe.id"
            class="meal-plan-item"
          >
            <!-- Order Number -->
            <div class="order-number">
              {{ index + 1 }}
            </div>

            <!-- Recipe Card -->
            <div class="recipe-card">
              <div class="row">
                <div class="col-md-3">
                  <img :src="recipe.image" :alt="recipe.title" class="recipe-image">
                </div>
                <div class="col-md-6">
                  <h5 class="recipe-title">{{ recipe.title }}</h5>
                  <div class="recipe-details">
                    <span class="detail-item">
                      <i class="fas fa-clock me-1"></i>
                      {{ recipe.readyInMinutes }} min
                    </span>
                    <span class="detail-item">
                      <i class="fas fa-utensils me-1"></i>
                      {{ recipe.servings }} servings
                    </span>
                  </div>

                  <!-- Progress Bar -->
                  <div class="progress-section mt-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <small class="text-muted">Cooking Progress</small>
                      <small class="text-muted">{{ getProgress(recipe.id).completed }}/{{ getProgress(recipe.id).total }}</small>
                    </div>
                    <b-progress 
                      :value="getProgress(recipe.id).percentage" 
                      :variant="getProgress(recipe.id).percentage === 100 ? 'success' : 'primary'"
                      height="8px"
                    ></b-progress>
                  </div>
                </div>
                <div class="col-md-3">
                  <!-- Action Buttons -->
                  <div class="recipe-actions">
                    <!-- Move Up/Down -->
                    <div class="order-controls mb-2">
                      <b-button 
                        variant="outline-secondary" 
                        size="sm"
                        @click="moveUp(index)"
                        :disabled="index === 0"
                        class="me-1"
                      >
                        <i class="fas fa-chevron-up"></i>
                      </b-button>
                      <b-button 
                        variant="outline-secondary" 
                        size="sm"
                        @click="moveDown(index)"
                        :disabled="index === mealPlan.length - 1"
                      >
                        <i class="fas fa-chevron-down"></i>
                      </b-button>
                    </div>

                    <!-- Recipe Actions -->
                    <div class="recipe-buttons">
                      <b-button 
                        variant="primary" 
                        size="sm"
                        @click="startCooking(recipe.id)"
                        class="mb-2 w-100"
                      >
                        <i class="fas fa-play me-1"></i>
                        Cook
                      </b-button>
                      <b-button 
                        variant="outline-info" 
                        size="sm"
                        @click="viewRecipe(recipe.id)"
                        class="mb-2 w-100"
                      >
                        <i class="fas fa-eye me-1"></i>
                        View
                      </b-button>
                      <b-button 
                        variant="outline-danger" 
                        size="sm"
                        @click="removeFromPlan(index)"
                        class="w-100"
                      >
                        <i class="fas fa-times me-1"></i>
                        Remove
                      </b-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </b-container>
  </div>
</template>

<script>
import { getCurrentInstance } from 'vue';

export default {
  name: 'MealPlanPage',
  data() {
    return {
      mealPlan: []
    };
  },
  methods: {
    loadMealPlan() {
      if (!this.store.username) return;
      
      const mealPlanKey = `mealPlan_${this.store.username}`;
      this.mealPlan = JSON.parse(localStorage.getItem(mealPlanKey) || '[]');
    },

    saveMealPlan() {
      if (!this.store.username) return;
      
      const mealPlanKey = `mealPlan_${this.store.username}`;
      localStorage.setItem(mealPlanKey, JSON.stringify(this.mealPlan));
    },

    getProgress(recipeId) {
      if (!this.store.username) return { completed: 0, total: 0, percentage: 0 };
      
      const progressKey = `recipeProgress_${this.store.username}_${recipeId}`;
      const progress = JSON.parse(localStorage.getItem(progressKey) || '[]');
      
      if (!Array.isArray(progress) || progress.length === 0) {
        return { completed: 0, total: 0, percentage: 0 };
      }
      
      const completed = progress.filter(step => step === true).length;
      const total = progress.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return { completed, total, percentage };
    },

    moveUp(index) {
      if (index === 0) return;
      
      const temp = this.mealPlan[index];
      this.mealPlan[index] = this.mealPlan[index - 1];
      this.mealPlan[index - 1] = temp;
      
      this.saveMealPlan();
    },

    moveDown(index) {
      if (index === this.mealPlan.length - 1) return;
      
      const temp = this.mealPlan[index];
      this.mealPlan[index] = this.mealPlan[index + 1];
      this.mealPlan[index + 1] = temp;
      
      this.saveMealPlan();
    },

    removeFromPlan(index) {
      if (confirm('Are you sure you want to remove this recipe from your meal plan?')) {
        this.mealPlan.splice(index, 1);
        this.saveMealPlan();
      }
    },

    clearAll() {
      if (confirm('Are you sure you want to clear your entire meal plan?')) {
        this.mealPlan = [];
        this.saveMealPlan();
      }
    },

    startCooking(recipeId) {
      this.$router.push({
        name: 'recipe-preparation',
        params: { recipeId }
      });
    },

    viewRecipe(recipeId) {
      this.$router.push({
        name: 'recipe',
        params: { recipeId }
      });
    }
  },

  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    
    return { store };
  },

  mounted() {
    this.loadMealPlan();
  },

  watch: {
    'store.username': {
      handler() {
        this.loadMealPlan();
      },
      immediate: true
    }
  }
};
</script>

<style lang="scss" scoped>
.meal-plan-page {
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

.empty-state {
  background: white;
  border-radius: 15px;
  padding: 3rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1rem 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.meal-plan-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.meal-plan-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.order-number {
  width: 40px;
  height: 40px;
  background: #42b983;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.recipe-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  flex: 1;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.recipe-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 10px;
}

.recipe-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.recipe-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.detail-item {
  color: #6c757d;
  font-size: 0.9rem;
  
  i {
    color: #42b983;
  }
}

.progress-section {
  .progress {
    border-radius: 10px;
  }
}

.recipe-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.order-controls {
  display: flex;
  gap: 0.25rem;
}

.recipe-buttons {
  width: 100%;
  
  .btn {
    font-size: 0.85rem;
  }
}

.custom-button {
  border-radius: 25px;
  padding: 0.75rem 2rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

@media (max-width: 767px) {
  .meal-plan-page {
    padding: 1rem 0;
  }

  .recipe-card {
    padding: 1rem;
  }

  .recipe-actions {
    margin-top: 1rem;
  }

  .order-controls {
    justify-content: center;
  }
}
</style>