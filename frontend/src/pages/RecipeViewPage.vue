<template>
  <div class="recipe-view-page">
    <b-container>
      <div v-if="recipe" class="content-card">
        <!-- Recipe Header -->
        <div class="recipe-header text-center mb-4">
          <h1 class="section-title mb-3">{{ recipe.title }}</h1>
          <img :src="recipe.image" class="recipe-image mb-3" />
        </div>

        <!-- Recipe Details -->
        <div class="recipe-details d-flex justify-content-center mb-4">
          <div class="detail-item me-4">
            <span class="emoji-icon">⏰</span>
            <span>{{ recipe.readyInMinutes }} minutes</span>
          </div>
          <div class="detail-item me-4">
            <span class="emoji-icon">❤️</span>
            <span>{{ recipe.aggregateLikes }} likes</span>
          </div>
          <div class="detail-item">
            <span class="emoji-icon">🍽️</span>
            <span>{{ recipe.servings || 'N/A' }} servings</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="text-center mb-4">
          <b-button 
            variant="primary" 
            class="custom-button me-3"
            @click="startCooking"
            size="lg"
          >
            <i class="fas fa-play me-2"></i>
            Start Cooking
          </b-button>
          
          <b-button 
            v-if="$root.store.username"
            variant="outline-success" 
            class="custom-button"
            @click="addToMealPlan"
            size="lg"
          >
            <i class="fas fa-plus-circle me-2"></i>
            Add to Meal Plan
          </b-button>
        </div>

        <!-- Ingredients and Instructions -->
        <b-row>
          <b-col md="6" class="mb-4">
            <h3 class="section-subtitle mb-3">Ingredients</h3>
            <ul class="ingredients-list">
              <li
                v-for="(r, index) in recipe.extendedIngredients"
                :key="index + '_' + r.id"
                class="ingredient-item"
              >
                {{ r.original }}
              </li>
            </ul>
          </b-col>
          <b-col md="6" class="mb-4">
            <h3 class="section-subtitle mb-3">Instructions</h3>
            <ol class="instructions-list">
              <li 
                v-for="(s, idx) in recipe._instructions" 
                :key="s.number" 
                :class="{ 'completed-step': checkedSteps[idx] }"
                class="instruction-item"
              >
                <input 
                  type="checkbox" 
                  :id="'step-' + idx" 
                  v-model="checkedSteps[idx]" 
                  @change="saveCheckedSteps" 
                  class="me-2"
                />
                <label :for="'step-' + idx">{{ s.step }}</label>
              </li>
            </ol>
          </b-col>
        </b-row>
      </div>
    </b-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      recipe: null,
      checkedSteps: [],
    };
  },
  methods: {
    addToMealPlan() {
      if (!this.$root.store.username || !this.recipe) return;
      
      // Get current meal plan
      const mealPlanKey = `mealPlan_${this.$root.store.username}`;
      const currentMealPlan = JSON.parse(localStorage.getItem(mealPlanKey) || '[]');
      
      // Debug logs
      console.log('Current recipe ID:', this.recipe.id);
      console.log('Current meal plan:', currentMealPlan);
      
      // Check if recipe is already in meal plan
      const existingItem = currentMealPlan.find(item => 
        String(item.id) === String(this.recipe.id)
      );
      
      if (existingItem) {
        console.log('Found existing item:', existingItem);
        alert('This recipe is already in your meal plan!');
        return;
      }
      
      // Add recipe to meal plan
      const mealPlanItem = {
        id: this.recipe.id,
        title: this.recipe.title,
        image: this.recipe.image,
        readyInMinutes: this.recipe.readyInMinutes,
        servings: this.recipe.servings,
        addedAt: Date.now()
      };
      
      console.log('Adding new item:', mealPlanItem);
      
      currentMealPlan.push(mealPlanItem);
      localStorage.setItem(mealPlanKey, JSON.stringify(currentMealPlan));
      
      // Simple way to trigger UI update - just reload the page or use $forceUpdate
      this.$forceUpdate();
      
      console.log('Updated meal plan:', currentMealPlan);
      alert('Added to meal plan successfully!');
    },


    startCooking() {
      if (!this.$root.store.username || !this.recipe) return;
      
      const mealPlanKey = `mealPlan_${this.$root.store.username}`;
      const currentMealPlan = JSON.parse(localStorage.getItem(mealPlanKey) || '[]');
      
      // Check if recipe already exists in meal plan
      const existingRecipe = currentMealPlan.find(item => 
        String(item.id) === String(this.recipe.id)
      );
      
      if (!existingRecipe) {
        // If recipe doesn't exist, add it to meal plan
        const mealPlanItem = {
          id: this.recipe.id,
          title: this.recipe.title,
          image: this.recipe.image,
          readyInMinutes: this.recipe.readyInMinutes,
          servings: this.recipe.servings,
          addedAt: Date.now()
        };
        
        currentMealPlan.push(mealPlanItem);
        localStorage.setItem(mealPlanKey, JSON.stringify(currentMealPlan));
        
        // Simple UI update
        this.$forceUpdate();
      }
      
      // Navigate to preparation page
      this.$router.push({
        name: 'recipe-preparation',
        params: { recipeId: this.$route.params.recipeId }
      });
    },

    saveToLastViewed() {
      if (!this.recipe) return;
      
      const lastViewed = JSON.parse(localStorage.getItem('lastViewedRecipes') || '[]');
      
      const recipeToStore = {
        id: this.$route.params.recipeId,
        title: this.recipe.title,
        readyInMinutes: this.recipe.readyInMinutes,
        image: this.recipe.image,
        aggregateLikes: this.recipe.aggregateLikes
      };
      
      const index = lastViewed.findIndex(r => r.id === recipeToStore.id);
      if (index !== -1) {
        lastViewed.splice(index, 1);
      }
      
      lastViewed.unshift(recipeToStore);
      const updatedLastViewed = lastViewed.slice(0, 3);
      
      localStorage.setItem('lastViewedRecipes', JSON.stringify(updatedLastViewed));
    },

    loadCheckedSteps() {
      if (!this.recipe || !this.recipe.title) return;
      const key = `checkedSteps_${this.$route.params.recipeId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const arr = JSON.parse(saved);
          if (Array.isArray(arr) && arr.length === this.recipe._instructions.length) {
            this.checkedSteps = arr;
          } else {
            this.checkedSteps = Array(this.recipe._instructions.length).fill(false);
          }
        } catch {
          this.checkedSteps = Array(this.recipe._instructions.length).fill(false);
        }
      } else {
        this.checkedSteps = Array(this.recipe._instructions.length).fill(false);
      }
    },

    saveCheckedSteps() {
      if (!this.recipe || !this.recipe.title) return;
      const key = `checkedSteps_${this.$route.params.recipeId}`;
      localStorage.setItem(key, JSON.stringify(this.checkedSteps));
    }
  },


  async created() {
    try {
      const recipeId = this.$route.params.recipeId;
      console.log("Attempting to load recipe with ID:", recipeId);
      
      let response;
      let isUserRecipe = false;
      
      // בדוק אם זה מתכון מותאם אישית של המשתמש
      if (this.$root.store.username) {
        try {
          console.log("Checking if it's a user recipe...");
          const userRecipeResponse = await this.axios.get(
            `${this.$root.store.server_domain}/users/my-recipes/${recipeId}`
          );
          
          if (userRecipeResponse.data) {
            console.log("Found user recipe:", userRecipeResponse.data);
            response = userRecipeResponse;
            isUserRecipe = true;
          }
        } catch (userRecipeError) {
          console.log("Not a user recipe, trying Spoonacular API...");
          // אם לא מצאנו מתכון מותאם אישית, נסה מה-API
          if (userRecipeError.response?.status !== 404) {
            console.error("Error checking user recipe:", userRecipeError);
          }
        }
      }
      
      // אם לא מצאנו מתכון מותאם אישית, נסה מה-API של Spoonacular
      if (!isUserRecipe) {
        try {
          console.log("Trying Spoonacular API for recipe:", recipeId);
          response = await this.axios.get(
            `${this.$root.store.server_domain}/recipes/information/${recipeId}`
          );
          console.log("Got Spoonacular recipe:", response.data);
        } catch (apiError) {
          console.error("Error loading from Spoonacular API:", apiError);
          console.log("Full API error:", apiError.response?.data);
          this.$router.replace("/NotFound");
          return;
        }
      }
      
      if (!response?.data) {
        console.error("No recipe data found");
        this.$router.replace("/NotFound");
        return;
      }
      
      const recipeData = response.data;
      console.log("Processing recipe data:", recipeData);
      
      // עיבוד הנתונים לפורמט אחיד
      let {
        analyzedInstructions = [],
        instructions = '',
        extendedIngredients = [],
        aggregateLikes = 0,
        readyInMinutes = 0,
        image = '/api/placeholder/400/300',
        title = 'No Title',
        servings = 1,
        isUserRecipe: recipeIsFromUser = false
      } = recipeData;
      
      // עיבוד ההוראות
      let _instructions = [];
      if (analyzedInstructions && Array.isArray(analyzedInstructions) && analyzedInstructions.length > 0) {
        _instructions = analyzedInstructions
          .map((fstep) => {
            if (fstep.steps && Array.isArray(fstep.steps)) {
              if (fstep.name && fstep.steps[0]) {
                fstep.steps[0].step = fstep.name + ' ' + fstep.steps[0].step;
              }
              return fstep.steps;
            }
            return [];
          })
          .reduce((a, b) => [...a, ...b], []);
      }
      
      const _recipe = {
        id: recipeId,
        instructions,
        _instructions,
        analyzedInstructions,
        extendedIngredients,
        aggregateLikes,
        readyInMinutes,
        image,
        title,
        servings,
        isUserRecipe: recipeIsFromUser
      };
      
      console.log("Final recipe object:", _recipe);
      
      this.recipe = _recipe;
      this.loadCheckedSteps();
      this.saveToLastViewed();
      
    } catch (error) {
      console.error("Unexpected error loading recipe:", error);
      this.$router.replace("/NotFound");
    }
  },
  watch: {
    'recipe._instructions'(newVal) {
      // If the number of steps changed, update the marking array accordingly
      if (newVal && Array.isArray(newVal)) {
        this.checkedSteps = Array(newVal.length).fill(false);
        this.loadCheckedSteps();
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.recipe-view-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.content-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.section-title {
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.section-subtitle {
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.recipe-image {
  max-width: 100%;
  height: auto;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  object-fit: cover;
}

.recipe-details {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1.5rem 0;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: rgba(66, 185, 131, 0.1);
  border-radius: 25px;
  color: #2c3e50;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(66, 185, 131, 0.2);
    transform: translateY(-2px);
  }

  .emoji-icon {
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }
}

.custom-button {
  border-radius: 25px;
  padding: 0.75rem 2rem;
  font-weight: 500;
  font-size: 1.1rem;
  background-color: #42b983;
  border: none;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(66, 185, 131, 0.3);

  &:hover {
    background-color: #369970;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(66, 185, 131, 0.4);
  }

  &:focus {
    background-color: #369970;
    box-shadow: 0 0 0 0.2rem rgba(66, 185, 131, 0.5);
  }
}

.ingredients-list {
  list-style: none;
  padding: 0;
}

.ingredient-item {
  background: #f8f9fa;
  margin: 0.5rem 0;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border-left: 4px solid #42b983;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    transform: translateX(5px);
  }
}

.instructions-list {
  padding-left: 1rem;
}

.instruction-item {
  background: #f8f9fa;
  margin: 0.75rem 0;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    border-color: #42b983;
  }

  label {
    cursor: pointer;
    flex: 1;
    font-weight: 500;
    color: #2c3e50;
  }

  input[type="checkbox"] {
    margin-right: 0.5rem;
    transform: scale(1.2);
    accent-color: #42b983;
  }
}

.completed-step {
  background: rgba(66, 185, 131, 0.1) !important;
  border-color: #42b983 !important;

  label {
    text-decoration: line-through;
    color: #6c757d;
  }
}

@media (max-width: 767px) {
  .recipe-view-page {
    padding: 1rem 0;
  }

  .content-card {
    padding: 1.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .section-subtitle {
    font-size: 1.5rem;
  }

  .recipe-details {
    flex-direction: column;
    align-items: center;
  }

  .detail-item {
    justify-content: center;
    width: 100%;
    max-width: 250px;
  }
}
</style>