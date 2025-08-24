<template>
  <div class="container mt-4">
    <!-- Error Alert -->
    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = ''" aria-label="Close"></button>
    </div>

    <!-- Success Alert -->
    <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ successMessage }}
      <button type="button" class="btn-close" @click="successMessage = ''" aria-label="Close"></button>
    </div>

    <!-- Header Section -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="display-4">My Recipes</h1>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addRecipeModal">
            <i class="fas fa-plus me-2"></i>Add New Recipe
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Recipe Cards -->
    <div v-if="recipes.length" class="row g-4">
      <div v-for="recipe in recipes" :key="recipe.id" class="col-12 col-md-6 col-lg-4">
        <div class="card h-100 shadow-sm">
          <img :src="recipe.image || 'default-recipe-image.jpg'" class="card-img-top" alt="Recipe Image"
            style="height: 200px; object-fit: cover;">
          <div class="card-body">
            <h5 class="card-title">{{ recipe.title }}</h5>
            <p class="card-text">
              <i class="far fa-clock me-2"></i>{{ recipe.readyInMinutes }} minutes
            </p>
            <div class="mb-3">
              <span v-if="recipe.vegan" class="badge bg-success me-1">Vegan</span>
              <span v-if="recipe.vegetarian" class="badge bg-info me-1">Vegetarian</span>
              <span v-if="recipe.glutenFree" class="badge bg-warning">Gluten Free</span>
            </div>
            <button @click="viewRecipe(recipe)" class="btn btn-outline-primary w-100">
              View Recipe
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="row">
      <div class="col-12 text-center py-5">
        <div class="card border-0 bg-light">
          <div class="card-body">
            <i class="fas fa-book-open fa-4x mb-3 text-muted"></i>
            <h3>No Personal Recipes Yet</h3>
            <p class="text-muted">Start sharing your family recipes today!</p>
            <button data-bs-toggle="modal" data-bs-target="#addRecipeModal" class="btn btn-primary">
              <i class="fas fa-plus me-2"></i>Add First Recipe
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Recipe Modal -->
    <div class="modal fade" id="addRecipeModal" tabindex="-1" aria-labelledby="addRecipeModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addRecipeModalLabel">Add New Recipe</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="addNewRecipe">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Recipe Title</label>
                <input v-model="newRecipe.title" type="text" class="form-control" required>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Image URL (optional)</label>
                <input v-model="newRecipe.image" type="url" class="form-control">
              </div>
              
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Ready in Minutes</label>
                  <input v-model="newRecipe.readyInMinutes" type="number" class="form-control" min="1" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Servings</label>
                  <input v-model="newRecipe.servings" type="number" class="form-control" min="1" required>
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Summary</label>
                <textarea v-model="newRecipe.summary" class="form-control" rows="3" required
                  placeholder="Brief description of the recipe"></textarea>
              </div>
              
              <b-form-group label="Dietary Preferences" class="mb-3">
                <div class="form-check form-check-inline">
                  <input v-model="newRecipe.vegan" type="checkbox" class="form-check-input" id="veganCheck">
                  <label class="form-check-label" for="veganCheck">Vegan</label>
                </div>
                <div class="form-check form-check-inline">
                  <input v-model="newRecipe.vegetarian" type="checkbox" class="form-check-input" id="vegetarianCheck">
                  <label class="form-check-label" for="vegetarianCheck">Vegetarian</label>
                </div>
                <div class="form-check form-check-inline">
                  <input v-model="newRecipe.glutenFree" type="checkbox" class="form-check-input" id="glutenFreeCheck">
                  <label class="form-check-label" for="glutenFreeCheck">Gluten Free</label>
                </div>
              </b-form-group>
              
              <div class="mb-3">
                <label class="form-label">Ingredients</label>
                <textarea v-model="newRecipe.ingredients" class="form-control" rows="5" required
                  placeholder="List ingredients (one per line)"></textarea>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Instructions</label>
                <textarea v-model="newRecipe.instructions" class="form-control" rows="6" required
                  placeholder="Step-by-step instructions"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                {{ isSubmitting ? 'Adding Recipe...' : 'Add Recipe' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "MyRecipesPage",
  data() {
    return {
      recipes: [],
      isLoading: false,
      errorMessage: '',
      successMessage: '',
      isSubmitting: false,
      newRecipe: {
        title: "",
        image: "",
        readyInMinutes: 30,
        servings: '',
        summary: '',
        vegan: false,
        vegetarian: false,
        glutenFree: false,
        ingredients: "",
        instructions: ""
      }
    };
  },
  methods: {
    showError(message) {
      this.errorMessage = message;
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
    },
    showSuccess(message) {
      this.successMessage = message;
      setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    },
    async fetchMyRecipes() {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await this.axios.get("/users/my-recipes");
        this.recipes = response.data.results || [];
      } catch (error) {
        console.error("Error fetching recipes:", error);
        this.showError('שגיאה בטעינת המתכונים שלך. אנא נסה שוב מאוחר יותר.');
      } finally {
        this.isLoading = false;
      }
    },
    async addNewRecipe() {
      // Simple validation
      if (!this.newRecipe.title || !this.newRecipe.readyInMinutes || !this.newRecipe.servings || 
          !this.newRecipe.summary || !this.newRecipe.ingredients || !this.newRecipe.instructions) {
        this.errorMessage = 'Please fill in all required fields.';
        return;
      }
      
      this.isSubmitting = true;
      this.errorMessage = '';
      
      try {
        const recipeData = {
          title: this.newRecipe.title,
          image: this.newRecipe.image || null,
          readyInMinutes: parseInt(this.newRecipe.readyInMinutes),
          servings: parseInt(this.newRecipe.servings),
          summary: this.newRecipe.summary,
          vegan: this.newRecipe.vegan,
          vegetarian: this.newRecipe.vegetarian,
          glutenFree: this.newRecipe.glutenFree,
          instructions: this.newRecipe.instructions,
          ingredients: this.newRecipe.ingredients
        };

        await this.axios.post("/users/add-recipes", recipeData);
        
        document.querySelector('[data-bs-dismiss="modal"]').click();
        this.resetNewRecipe();
        await this.fetchMyRecipes();
        this.toast('Recipe Added', 'Your recipe has been added successfully!', 'success');
      } catch (error) {
        console.error("Error adding recipe:", error);
        this.errorMessage = error.response?.data?.message || 'Failed to add recipe. Please try again.';
      } finally {
        this.isSubmitting = false;
      }
    },
    resetNewRecipe() {
      this.newRecipe = {
        title: "",
        image: "",
        readyInMinutes: 30,
        servings: '',
        summary: '',
        vegan: false,
        vegetarian: false,
        glutenFree: false,
        ingredients: "",
        instructions: ""
      };
      // Reset form validation state if needed
    },
    viewRecipe(recipe) {
      this.$router.push(`/recipe/${recipe.id}`);
    }
  },
  created() {
    this.fetchMyRecipes();
  }
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

/* RTL Support */
.modal-header .btn-close {
  margin: -0.5rem auto -0.5rem -0.5rem;
}

.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}

/* Custom Scrollbar for Modals */
.modal-body {
  max-height: calc(100vh - 210px);
  overflow-y: auto;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1050;
  min-width: 300px;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>