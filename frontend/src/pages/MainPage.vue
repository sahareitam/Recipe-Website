<template>
  <div class="main-page">
    <b-container>
      <h1 class="page-title text-center my-5">Welcome to Our Recipe World</h1>

      <b-row>
        <!-- Left Column - Random Recipes -->
        <b-col md="6" class="mb-4">
          <div class="content-card">
            <h2 class="section-title text-center mb-4">Explore these recipes</h2>
            <RecipePreviewList title="" class="recipe-list" />
          </div>
        </b-col>

        <!-- Right Column - Last Viewed or Login -->
        <b-col md="6" class="mb-4">
          <div class="content-card">
            <div v-if="store.username">
              <h2 class="section-title text-center mb-4">Last watched recipes</h2>
              <RecipePreviewList
                title=""
                class="recipe-list"
                :isLastViewed="true"
              />
            </div>
            <div v-else class="login-section">
              <h2 class="section-title text-center mb-4">Sign In</h2>
              <b-form @submit.prevent="login">
                <!-- Username -->
                <b-form-group label="Username" label-for="username">
                  <b-form-input
                    id="username"
                    v-model="loginForm.username"
                    :state="getValidationState(v$.username)"
                    placeholder="Enter username"
                    class="custom-input"
                  />
                  <b-form-invalid-feedback v-if="v$.username.$error">
                    Username is required.
                  </b-form-invalid-feedback>
                </b-form-group>

                <!-- Password -->
                <b-form-group label="Password" label-for="password">
                  <b-form-input
                    id="password"
                    type="password"
                    v-model="loginForm.password"
                    :state="getValidationState(v$.password)"
                    placeholder="Enter password"
                    class="custom-input"
                  />
                  <b-form-invalid-feedback v-if="v$.password.$error">
                    Password is required.
                  </b-form-invalid-feedback>
                </b-form-group>

                <b-button 
                  type="submit" 
                  variant="primary" 
                  class="w-100 mb-3 custom-button" 
                  :disabled="loginForm.isLoading"
                >
                  <b-spinner small v-if="loginForm.isLoading"></b-spinner>
                  {{ loginForm.isLoading ? 'Signing in...' : 'Sign In' }}
                </b-button>

                <b-alert
                  variant="danger"
                  dismissible
                  v-if="loginForm.submitError"
                  show
                  class="custom-alert"
                >
                  {{ loginForm.submitError }}
                </b-alert>

                <div class="text-center mt-4">
                  <p class="mb-3">Don't have an account?</p>
                  <router-link :to="{ name: 'register' }" class="btn btn-outline-primary custom-button-outline">
                    Register here
                  </router-link>
                </div>
              </b-form>
            </div>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { getCurrentInstance, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import RecipePreviewList from "../components/RecipePreviewList.vue";

export default {
  components: {
    RecipePreviewList
  },
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const axios = internalInstance.appContext.config.globalProperties.axios;
    const toast = internalInstance.appContext.config.globalProperties.toast;

    const loginForm = reactive({
      username: '',
      password: '',
      submitError: null,
      isLoading: false,
    });

    const rules = {
      username: { required },
      password: { required },
    };

    const v$ = useVuelidate(rules, loginForm);

    const getValidationState = (field) => {
      return field.$dirty ? !field.$invalid : null;
    };

    const login = async () => {
      const valid = await v$.value.$validate();
      if (!valid) return;

      loginForm.isLoading = true;
      loginForm.submitError = null;

      try {
        await axios.post(store.server_domain + '/login', {
          username: loginForm.username,
          password: loginForm.password,
        }, {withCredentials: true});
        store.login(loginForm.username);
        toast('Login Successful', 'Welcome back!', 'success');
      } catch (err) {
        console.error('Login error:', err);
        loginForm.submitError = err.response?.data?.message || 'Login failed. Please check your credentials.';
      } finally {
        loginForm.isLoading = false;
      }
    };

    return { 
      store, 
      loginForm,
      v$,
      login,
      getValidationState
    };
  }
};
</script>

<style lang="scss" scoped>
.main-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.page-title {
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.section-title {
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 500;
}

.content-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 100%;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
}

.login-section {
  max-width: 400px;
  margin: 0 auto;
}

.custom-input {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  padding: 0.75rem;
  
  &:focus {
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
}

.custom-button {
  border-radius: 8px;
  padding: 0.75rem;
  font-weight: 500;
  transition: all 0.2s;
  background-color: #007bff;
  border: none;

  &:hover {
    background-color: #0056b3;
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #6c757d;
  }
}

.custom-button-outline {
  border-radius: 8px;
  padding: 0.75rem 2rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
  }
}

.custom-alert {
  border-radius: 8px;
  border: none;
}

.recipe-list {
  margin-top: 1.5rem;
}

@media (max-width: 767px) {
  .main-page {
    padding: 1rem 0;
  }

  .page-title {
    font-size: 2rem;
  }

  .content-card {
    padding: 1.5rem;
  }
}
</style>
