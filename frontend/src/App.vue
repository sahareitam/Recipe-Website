<template>
  <div id="app">
    <!-- Navigation Bar -->
    <b-navbar toggleable="lg" type="light" variant="light" class="navbar-custom">
      <b-navbar-brand :to="{ name: 'main' }" class="fw-bold">
        Vue Recipes
      </b-navbar-brand>
      
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      
      <b-collapse id="nav-collapse" is-nav>
        <!-- Left side navigation -->
        <b-navbar-nav>
          <b-nav-item :to="{ name: 'main' }">Home</b-nav-item>
          <b-nav-item :to="{ name: 'search' }">Search</b-nav-item>
          <b-nav-item :to="{ name: 'about' }">About</b-nav-item>
          
        </b-navbar-nav>
        
        <!-- Right side navigation -->
        <b-navbar-nav class="ms-auto">
         <!-- For non-authenticated users -->
        <template v-if="!store.username">
          <b-nav-text class="me-3">Hello Guest</b-nav-text>
          <b-nav-item :to="{ name: 'login' }">Login</b-nav-item>
          <b-nav-item :to="{ name: 'register' }">Register</b-nav-item>
        </template>
          
          <!-- For authenticated users -->
        <template v-else>
          <b-nav-text class="me-3">Welcome, {{ store.username }}</b-nav-text>
          
          <!-- Personal Area Dropdown -->
          <b-nav-item-dropdown text="Personal Area" class="me-2">
            <b-dropdown-item :to="{ name: 'favorites' }">My Favorite Recipes</b-dropdown-item>
            <b-dropdown-item :to="{ name: 'my-recipes' }">My Recipes</b-dropdown-item>
            <b-dropdown-item :to="{ name: 'family-recipes' }">My Family Recipes</b-dropdown-item>
          </b-nav-item-dropdown>
          
          <b-nav-item :to="{ name: 'meal-plan' }" class="me-2 position-relative">
            Meal Plan
            <span 
              v-if="mealPlanCount > 0" 
              class="badge bg-danger position-absolute top-0 start-100 translate-middle rounded-pill"
            >
              {{ mealPlanCount }}
            </span>
          </b-nav-item>
          
          <b-nav-item :to="{ name: 'my-recipes' }" class="me-2">Create New Recipe</b-nav-item>
          <b-nav-item @click="logout" class="logout-btn">Logout</b-nav-item>
        </template>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    
    <!-- Main Content -->
    <div class="container-fluid mt-3">
      <router-view />
    </div>
  </div>
</template>

<script>
import { getCurrentInstance, computed } from 'vue';

export default {
  name: "App",
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const toast = internalInstance.appContext.config.globalProperties.toast;
    const router = internalInstance.appContext.config.globalProperties.$router;
        
    const logout = () => {
      // מחיקת החיפוש האחרון לפני התנתקות
      if (store.username) {
        sessionStorage.removeItem(`lastSearch_${store.username}`);
      }
      store.logout();
      toast("Logout", "User logged out successfully", "success");
      router.push("/").catch(() => {});
    };

    const mealPlanCount = computed(() => {
      if (!store.username) return 0;
      
      const mealPlan = JSON.parse(localStorage.getItem(`mealPlan_${store.username}`) || '[]');
      return mealPlan.length;
    });

    return { store, logout, mealPlanCount };
  }
}
</script>

<style lang="scss">

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

.navbar-custom {
  background-color: #ffffff;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  .navbar-brand {
    color: #42b983 !important;
    font-size: 1.5rem;
    font-weight: bold;
    
    &:hover {
      color: #369970 !important;
    }
  }
  
  .nav-link {
    color: #2c3e50 !important;
    font-weight: 500;
    padding: 0.5rem 1rem;
    transition: color 0.3s ease;
    
    &:hover {
      color: #42b983 !important;
    }
    
    &.router-link-exact-active {
      color: #42b983 !important;
      font-weight: 600;
    }
  }
  
  .logout-btn {
    cursor: pointer;
    color: #dc3545 !important;
    
    &:hover {
      color: #c82333 !important;
    }
  }
  
  .dropdown-item {
    &:hover {
      background-color: #f8f9fa;
      color: #42b983;
    }
  }
}

.navbar-nav .nav-text {
  color: #6c757d;
  font-weight: 500;
}
</style>
