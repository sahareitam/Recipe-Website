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

          <!-- Start Cooking Button -->
          <div class="text-center mb-4">
            <b-button 
              variant="primary" 
              class="custom-button"
              @click="startCooking"
              size="lg"
            >
              🍳 Start Cooking
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
      startCooking() {
        // Navigate to cooking page or add to meal
        this.$router.push(`/cooking/${this.$route.params.recipeId}`).catch(() => {
          // If cooking route doesn't exist, show a message
          alert('Cooking mode feature coming soon!');
        });
      },
      saveToLastViewed() {
        if (!this.recipe) return;
        
        const lastViewed = JSON.parse(localStorage.getItem('lastViewedRecipes') || '[]');
        
        // Create a simplified version of the recipe for storage
        const recipeToStore = {
          id: this.$route.params.recipeId,
          title: this.recipe.title,
          readyInMinutes: this.recipe.readyInMinutes,
          image: this.recipe.image,
          aggregateLikes: this.recipe.aggregateLikes
        };
        
        // Remove if already exists
        const index = lastViewed.findIndex(r => r.id === recipeToStore.id);
        if (index !== -1) {
          lastViewed.splice(index, 1);
        }
        
        // Add to beginning of array
        lastViewed.unshift(recipeToStore);
        
        // Keep only last 3 recipes
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
      },
    },
    async created() {
      try {
        // ננסה לטעון את המתכון מהשרת
        let response;
        try {
          console.log("Making request to:", this.$root.store.server_domain + "/recipes/information/" + this.$route.params.recipeId);
          response = await this.axios.get(
            this.$root.store.server_domain + "/recipes/information/" + this.$route.params.recipeId
          );
          
          console.log("Response status:", response.status);
          console.log("Response data:", response.data);
          console.log("analyzedInstructions:", response.data.analyzedInstructions);
          console.log("extendedIngredients:", response.data.extendedIngredients);
          console.log("instructions:", response.data.instructions);
          
          // אם קיבלנו 304 אבל אין נתונים, נעשה בקשה חדשה
          if (response.status === 304 && (!response.data || Object.keys(response.data).length === 0)) {
            console.log("Got 304 but no data, making fresh request");
            response = await this.axios.get(
              this.$root.store.server_domain + "/recipes/information/" + this.$route.params.recipeId + "?t=" + Date.now()
            );
          }
          
          if (!response.data) {
            throw new Error("No data received");
          }
        } catch (error) {
          console.log("Full error:", error);
          console.log("Error response:", error.response);
          console.log("Error message:", error.message);
          console.log("error.response.status", error.response?.status);
          this.$router.replace("/NotFound");
          return;
        }
        let {
          analyzedInstructions,
          instructions,
          extendedIngredients,
          aggregateLikes,
          readyInMinutes,
          image,
          title,
          servings
        } = response.data;
        let _instructions = [];
        if (analyzedInstructions && Array.isArray(analyzedInstructions)) {
          _instructions = analyzedInstructions
            .map((fstep) => {
              fstep.steps[0].step = fstep.name + fstep.steps[0].step;
              return fstep.steps;
            })
            .reduce((a, b) => [...a, ...b], []);
        }
        let _recipe = {
          instructions,
          _instructions,
          analyzedInstructions,
          extendedIngredients,
          aggregateLikes,
          readyInMinutes,
          image,
          title,
          servings
        };
        this.recipe = _recipe;
        this.loadCheckedSteps();
        this.saveToLastViewed();
      } catch (error) {
        console.log(error);
      }
    },
    watch: {
      'recipe._instructions'(newVal) {
        // אם מספר השלבים השתנה, נעדכן את מערך הסימון בהתאם
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