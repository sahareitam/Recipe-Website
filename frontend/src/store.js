import { reactive } from 'vue';

const store = reactive({
  username: localStorage.getItem('username'),
  user_id: localStorage.getItem('user_id'),
  server_domain: "http://localhost:3000",

  login(username) {
    localStorage.setItem('username', username);
    this.username = username;
    console.log("login", this.username);
  },

  logout() {
    console.log("logout");
    localStorage.removeItem('username');
    this.username = undefined;
  }
});

export default store;
