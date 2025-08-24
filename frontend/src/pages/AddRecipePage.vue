<template>
  <div class="container mt-4">
    <h1 class="mb-4">Add New Recipe</h1>
    
    <div v-if="!store.username" class="text-center">
      <div class="alert alert-warning" role="alert">
        <h4>Please login to add recipes</h4>
        <router-link :to="{ name: 'login' }">
          <button class="btn btn-primary">Login</button>
        </router-link>
      </div>
    </div>
    
    <div v-else class="row">
      <div class="col-md-8 mx-auto">
        <b-form @submit.prevent="submitRecipe">
          <b-form-group label="Recipe Title" label-for="title">
            <b-form-input
              id="title"
              v-model="recipe.title"
              :state="getValidationState(v$.title)"
              placeholder="Enter recipe title"
            />
            <b-form-invalid-feedback v-if="v$.title.$error">
              Recipe title is required.
            </b-form-invalid-feedback>
          </b-form-group>
          
          <b-form-group label="Image URL (optional)" label-for="image">
            <b-form-input
              id="image"
              v-model="recipe.image"
              placeholder="Enter image URL"
              type="url"
            />
          </b-form-group>
          
          <b-row>
            <b-col md="6">
              <b-form-group label="Ready in Minutes" label-for="readyInMinutes">
                <b-form-input
                  id="readyInMinutes"
                  v-model="recipe.readyInMinutes"
                  :state="getValidationState(v$.readyInMinutes)"
                  type="number"
                  min="1"
                  placeholder="e.g., 30"
                />
                <b-form-invalid-feedback v-if="v$.readyInMinutes.$error">
                  Ready time is required.
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
            <b-col md="6">
              <b-form-group label="Servings" label-for="servings">
                <b-form-input
                  id="servings"
                  v-model="recipe.servings"
                  :state="getValidationState(v$.servings)"
                  type="number"
                  min="1"
                  placeholder="e.g., 4"
                />
                <b-form-invalid-feedback v-if="v$.servings.$error">
                  Number of servings is required.
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
          </b-row>
          
          <b-form-group label="Summary" label-for="summary">
            <b-form-textarea
              id="summary"
              v-model="recipe.summary"
              :state="getValidationState(v$.summary)"
              rows="3"
              placeholder="Brief description of the recipe"
            />
            <b-form-invalid-feedback v-if="v$.summary.$error">
              Recipe summary is required.
            </b-form-invalid-feedback>
          </b-form-group>
          
          <b-form-group label="Ingredients" label-for="ingredients">
            <b-form-textarea
              id="ingredients"
              v-model="recipe.ingredients"
              :state="getValidationState(v$.ingredients)"
              rows="5"
              placeholder="List ingredients (one per line)"
            />
            <b-form-invalid-feedback v-if="v$.ingredients.$error">
              Ingredients list is required.
            </b-form-invalid-feedback>
          </b-form-group>
          
          <b-form-group label="Instructions" label-for="instructions">
            <b-form-textarea
              id="instructions"
              v-model="recipe.instructions"
              :state="getValidationState(v$.instructions)"
              rows="6"
              placeholder="Step-by-step instructions"
            />
            <b-form-invalid-feedback v-if="v$.instructions.$error">
              Instructions are required.
            </b-form-invalid-feedback>
          </b-form-group>
          
          <div class="d-flex justify-content-between">
            <router-link :to="{ name: 'my-recipes' }">
              <button type="button" class="btn btn-secondary">Cancel</button>
            </router-link>
            <button type="submit" class="btn btn-success" :disabled="isSubmitting">
              {{ isSubmitting ? 'Adding Recipe...' : 'Add Recipe' }}
            </button>
          </div>
        </b-form>
        
        <b-alert
          variant="danger"
          class="mt-3"
          dismissible
          v-if="submitError"
          show
        >
          {{ submitError }}
        </b-alert>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, getCurrentInstance } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minValue } from '@vuelidate/validators';

export default {
  name: 'AddRecipePage',
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const axios = internalInstance.appContext.config.globalProperties.axios;
    const router = internalInstance.appContext.config.globalProperties.$router;
    const toast = internalInstance.appContext.config.globalProperties.toast;
    
    const recipe = reactive({
      title: '',
      image: '',
      readyInMinutes: '',
      servings: '',
      summary: '',
      ingredients: '',
      instructions: '',
    });
    
    const state = reactive({
      isSubmitting: false,
      submitError: null,
    });
    
    const rules = {
      title: { required },
      readyInMinutes: { required, minValue: minValue(1) },
      servings: { required, minValue: minValue(1) },
      summary: { required },
      ingredients: { required },
      instructions: { required },
    };
    
    const v$ = useVuelidate(rules, recipe);
    
    const getValidationState = (field) => {
      return field.$dirty ? !field.$invalid : null;
    };
    
    const submitRecipe = async () => {
      const valid = await v$.value.$validate();
      if (!valid) return;
      
      state.isSubmitting = true;
      state.submitError = null;
      
      try {
        await axios.post(store.server_domain + '/user/add-recipes', {
          title: recipe.title,
          image: recipe.image || null,
          readyInMinutes: parseInt(recipe.readyInMinutes),
          servings: parseInt(recipe.servings),
          summary: recipe.summary,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
        });
        
        toast('Recipe Added', 'Your recipe has been added successfully!', 'success');
        router.push({ name: 'my-recipes' });
      } catch (error) {
        console.error('Error adding recipe:', error);
        state.submitError = error.response?.data?.message || 'Failed to add recipe. Please try again.';
      } finally {
        state.isSubmitting = false;
      }
    };
    
    return {
      store,
      recipe,
      isSubmitting: state.isSubmitting,
      submitError: state.submitError,
      v$,
      getValidationState,
      submitRecipe,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>