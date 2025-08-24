<template>
  <div class="container">
    <h1 class="title">Search Recipes</h1>
    
    <div class="search-form mb-4">
      <b-form @submit.prevent="searchRecipes">
        <b-row>
          <b-col md="6">
            <b-form-group label="Search Query" label-for="query">
              <b-form-input
                id="query"
                v-model="searchParams.query"
                placeholder="Enter recipe name or ingredient"
              />
            </b-form-group>
          </b-col>
          <b-col md="3">
            <b-form-group label="Number of Results" label-for="number">
              <b-form-select
                id="number"
                v-model="searchParams.number"
                :options="numberOptions"
              />
            </b-form-group>
          </b-col>
          <b-col md="3">
            <b-form-group label="Cuisine" label-for="cuisine">
              <b-form-select
                id="cuisine"
                v-model="searchParams.cuisine"
                :options="cuisineOptions"
              />
            </b-form-group>
          </b-col>
        </b-row>
        
        <b-row>
          <b-col md="6">
            <b-form-group label="Diet" label-for="diet">
              <b-form-select
                id="diet"
                v-model="searchParams.diet"
                :options="dietOptions"
              />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Intolerances" label-for="intolerances">
              <b-form-select
                id="intolerances"
                v-model="searchParams.intolerances"
                :options="intoleranceOptions"
              />
            </b-form-group>
          </b-col>
        </b-row>
        
        <b-button type="submit" variant="primary" :disabled="isLoading">
          {{ isLoading ? 'Searching...' : 'Search' }}
        </b-button>
        <b-button type="button" variant="secondary" @click="clearSearch" class="ms-2">
          Clear
        </b-button>
      </b-form>
    </div>

    <div v-if="isLoading" class="text-center my-4">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Searching recipes...</p>
    </div>
    
    <div v-else-if="searchResults.length === 0 && hasSearched" class="text-center my-4">
      <div class="no-results-card">
        <div class="no-results-icon">🔍</div>
        <h4>No recipes found for your search</h4>
        <p class="text-muted">We couldn't find any recipes matching "{{ searchParams.query }}"</p>
        <p class="text-muted mb-3">Try adjusting your search criteria or use different keywords</p>
        <div class="search-suggestions">
          <small class="text-muted">
            <strong>Tips:</strong> Use simpler terms, check spelling, or try broader categories
          </small>
        </div>
      </div>
    </div>
    
    <div v-else-if="searchResults.length > 0" class="search-results">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3>Search Results ({{ searchResults.length }})</h3>
        <div class="sort-section">
          <label for="sort-select" class="form-label me-2">מיון לפי:</label>
          <b-form-select
            id="sort-select"
            v-model="sortBy"
            :options="sortOptions"
            style="width: 200px;"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-md-4 mb-3" v-for="recipe in searchResults" :key="recipe.id">
          <RecipePreview :recipe="recipe" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed, getCurrentInstance, onMounted } from 'vue';
import RecipePreview from '../components/RecipePreview.vue';

export default {
  name: 'SearchPage',
  components: {
    RecipePreview
  },
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const axios = internalInstance.appContext.config.globalProperties.axios;

    const searchParams = reactive({
      query: '',
      cuisine: '',
      diet: '',
      intolerances: '',
      number: 5
    });

    const state = reactive({
      searchResults: [],
      isLoading: false,
      hasSearched: false,
      sortBy: 'none'
    });

    const numberOptions = [
      { value: 5, text: '5' },
      { value: 10, text: '10' },
      { value: 15, text: '15' }
    ];

    const cuisineOptions = [
      { value: '', text: 'Any Cuisine' },
      { value: 'mediterranean', text: 'Mediterranean' },
      { value: 'european', text: 'European' },
      { value: 'american', text: 'American' },
      { value: 'asian', text: 'Asian' },
      { value: 'mexican', text: 'Mexican' },
      { value: 'italian', text: 'Italian' },
      { value: 'french', text: 'French' },
      { value: 'indian', text: 'Indian' },
      { value: 'chinese', text: 'Chinese' },
      { value: 'japanese', text: 'Japanese' }
    ];

    const dietOptions = [
      { value: '', text: 'Any Diet' },
      { value: 'vegetarian', text: 'Vegetarian' },
      { value: 'vegan', text: 'Vegan' },
      { value: 'gluten free', text: 'Gluten Free' },
      { value: 'ketogenic', text: 'Ketogenic' },
      { value: 'pescetarian', text: 'Pescetarian' },
      { value: 'paleo', text: 'Paleo' }
    ];

    const intoleranceOptions = [
      { value: '', text: 'No Intolerances' },
      { value: 'dairy', text: 'Dairy' },
      { value: 'egg', text: 'Egg' },
      { value: 'gluten', text: 'Gluten' },
      { value: 'grain', text: 'Grain' },
      { value: 'peanut', text: 'Peanut' },
      { value: 'seafood', text: 'Seafood' },
      { value: 'sesame', text: 'Sesame' },
      { value: 'shellfish', text: 'Shellfish' },
      { value: 'soy', text: 'Soy' },
      { value: 'tree nut', text: 'Tree Nut' },
      { value: 'wheat', text: 'Wheat' }
    ];

    const sortOptions = [
      { value: 'none', text: 'ללא מיון' },
      { value: 'time', text: 'לפי זמן הכנה' },
      { value: 'popularity', text: 'לפי פופולריות' }
    ];

    const searchRecipes = async () => {
      state.isLoading = true;
      state.hasSearched = true;
      
      try {
        const params = new URLSearchParams();
        if (searchParams.query) params.append('query', searchParams.query);
        if (searchParams.cuisine) params.append('cuisine', searchParams.cuisine);
        if (searchParams.diet) params.append('diet', searchParams.diet);
        if (searchParams.intolerances) params.append('intolerances', searchParams.intolerances);
        params.append('number', searchParams.number);

        const response = await axios.get(
          `${store.server_domain}/recipes/search?${params.toString()}`
        );
        
        state.searchResults = response.data.results || [];
        // שמירת החיפוש המוצלח
        saveLastSearch();
      } catch (error) {
        console.error('Search error:', error);
        state.searchResults = [];
        
        // אם זה 404, נציג הודעת "לא נמצאו תוצאות" יפה
        if (error.response?.status === 404) {
          // searchResults ריק כבר יפעיל את הודעת "No recipes found for your search"
          console.log('404 - No recipes found, will show nice message');
        }
        
        // לשגיאות אחרות, נציג הודעת שגיאה כללית
        console.error('Server error:', error.response?.status || 'Unknown error');
      } finally {
        state.isLoading = false;
      }
    };

    const getSortedResults = computed(() => {
      if (state.sortBy === 'none') {
        return state.searchResults;
      }
      
      const sorted = [...state.searchResults].sort((a, b) => {
        if (state.sortBy === 'time') {
          return a.readyInMinutes - b.readyInMinutes;
        }
        if (state.sortBy === 'popularity') {
          return b.aggregateLikes - a.aggregateLikes;
        }
        return 0;
      });
      
      return sorted;
    });

    const saveLastSearch = () => {
      if (store.username) {
        const searchData = {
          query: searchParams.query,
          cuisine: searchParams.cuisine,
          diet: searchParams.diet,
          intolerances: searchParams.intolerances,
          number: searchParams.number,
          sortBy: state.sortBy,
          timestamp: Date.now()
        };
        sessionStorage.setItem(`lastSearch_${store.username}`, JSON.stringify(searchData));
      }
    };

    const loadLastSearch = async () => {
      if (store.username) {
        const saved = sessionStorage.getItem(`lastSearch_${store.username}`);
        if (saved) {
          try {
            const lastSearch = JSON.parse(saved);
            // טעינת הפרמטרים
            searchParams.query = lastSearch.query || '';
            searchParams.cuisine = lastSearch.cuisine || '';
            searchParams.diet = lastSearch.diet || '';
            searchParams.intolerances = lastSearch.intolerances || '';
            searchParams.number = lastSearch.number || 5;
            state.sortBy = lastSearch.sortBy || 'none';
            
            // ביצוע החיפוש אוטומטית אם יש query
            if (lastSearch.query && lastSearch.query.trim() !== '') {
              await searchRecipes();
            }
          } catch (error) {
            console.error('Error loading last search:', error);
            sessionStorage.removeItem(`lastSearch_${store.username}`);
          }
        }
      }
    };

    const clearSearch = () => {
      searchParams.query = '';
      searchParams.cuisine = '';
      searchParams.diet = '';
      searchParams.intolerances = '';
      searchParams.number = 5;
      state.searchResults = [];
      state.hasSearched = false;
      state.sortBy = 'none';
    };

    // טעינת החיפוש האחרון בהעלאת הקומפוננטה
    onMounted(() => {
      loadLastSearch();
    });

    return {
      searchParams,
      searchResults: getSortedResults,
      sortBy: state.sortBy,
      isLoading: state.isLoading,
      hasSearched: state.hasSearched,
      numberOptions,
      cuisineOptions,
      dietOptions,
      intoleranceOptions,
      sortOptions,
      searchRecipes,
      clearSearch
    };
  }
};
</script>

<style scoped>
.search-form {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.title {
  margin-bottom: 30px;
}

.no-results-card {
  background: white;
  border-radius: 15px;
  padding: 3rem 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.no-results-card h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 600;
}

.search-suggestions {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #42b983;
}
</style>