// frontend/src/store.js
import { reactive } from 'vue';

const store = reactive({
  username: localStorage.getItem('username'),
  user_id: localStorage.getItem('user_id'),
  server_domain: "http://localhost:3000",

  // Reactive signal: bump this number to re-render components that depend on meal plan
  mealPlanVersion: 0,

  login(username) {
    localStorage.setItem('username', username);
    this.username = username;
    // Trigger UI refresh after login (meal plan is per-user)
    this.mealPlanVersion++;
  },

  logout() {
    localStorage.removeItem('username');
    this.username = undefined;
    // Trigger UI refresh after logout (badge/list should reset)
    this.mealPlanVersion++;
  },

  // Call this after any change to the meal plan to notify the UI
  bumpMealPlan() {
    this.mealPlanVersion++;
  },

  // Convenience: read the current user's meal plan from localStorage
  getMealPlan() {
    if (!this.username) return [];
    const key = `mealPlan_${this.username}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  // Convenience: write the current user's meal plan and bump the version
  setMealPlan(arr) {
    if (!this.username) return;
    const key = `mealPlan_${this.username}`;
    localStorage.setItem(key, JSON.stringify(arr || []));
    this.bumpMealPlan();
  }
});

export default store;
