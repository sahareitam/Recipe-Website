<template>
  <div class="container mt-4" style="max-width: 500px;">
    <h2 class="mb-4">Register</h2>

    <b-form @submit.prevent="register">
      <!-- Username -->
      <b-form-group label="Username" label-for="username">
        <b-form-input
          id="username"
          v-model="state.username"
          @blur="v$.username.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.username.$error">
          <div v-if="!v$.username.required">Username is required.</div>
          <div v-else-if="!v$.username.minLength || !v$.username.maxLength">
            Username must be 3-8 characters.
          </div>
          <div v-else-if="!v$.username.alpha">Username must contain only letters.</div>
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- First Name -->
      <b-form-group label="First Name" label-for="firstname">
        <b-form-input
          id="firstname"
          v-model="state.firstname"
          @blur="v$.firstname.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.firstname.$error">
          First name is required.
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Last Name -->
      <b-form-group label="Last Name" label-for="lastname">
        <b-form-input
          id="lastname"
          v-model="state.lastname"
          @blur="v$.lastname.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.lastname.$error">
          Last name is required.
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Email -->
      <b-form-group label="Email" label-for="email">
        <b-form-input
          id="email"
          type="email"
          v-model="state.email"
          @blur="v$.email.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.email.$error">
          Valid email is required.
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Country -->
      <b-form-group label="Country" label-for="country">
        <b-form-select
          id="country"
          v-model="state.country"
          :options="countries"
          placeholder="Select a country"
          @change="v$.country.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.country.$error">
          Country is required.
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Password -->
      <b-form-group label="Password" label-for="password">
        <b-form-input
          id="password"
          type="password"
          v-model="state.password"
          @blur="v$.password.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.password.$error">
          <div v-if="!v$.password.required">Password is required.</div>
          <div v-else-if="!v$.password.minLength || !v$.password.maxLength">
            Password must be 5-10 characters.
          </div>
          <div v-else-if="!v$.password.hasNumber">
            Password must contain at least one number.
          </div>
          <div v-else-if="!v$.password.hasSpecialChar">
            Password must contain at least one special character.
          </div>
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Confirm Password -->
      <b-form-group label="Confirm Password" label-for="confirmedPassword">
        <b-form-input
          id="confirmedPassword"
          type="password"
          v-model="state.confirmedPassword"
          @blur="v$.confirmedPassword.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.confirmedPassword.$error">
          <div v-if="!v$.confirmedPassword.required">Confirmation is required.</div>
          <div v-else-if="!v$.confirmedPassword.sameAs">          
            Passwords do not match.
          </div>
        </b-form-invalid-feedback>
      </b-form-group>

      <b-button
        type="submit"
        variant="success"
        class="w-100"
        :disabled="state.isLoading"
      >
        {{ state.isLoading ? 'Registering…' : 'Register' }}
      </b-button>

      <b-alert
        variant="danger"
        class="mt-3"
        dismissible
        v-if="state.submitError"
        show
      >
        Registration failed: {{ state.submitError }}
      </b-alert>

      <div class="mt-2">
        Already have an account?
        <router-link to="/login">Login here</router-link>
      </div>
    </b-form>
  </div>
</template>

<script>
import { reactive, getCurrentInstance, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength, alpha, sameAs, email, helpers } from '@vuelidate/validators';
import rawCountries from '../assets/countries';

export default {
  name: 'RegisterPage',
  setup() {
  
    const internalInstance = getCurrentInstance();
    const store  = internalInstance.appContext.config.globalProperties.store;
    const router = internalInstance.appContext.config.globalProperties.$router;
    const axios  = internalInstance.appContext.config.globalProperties.axios;
    const toast  = internalInstance.appContext.config.globalProperties.toast;

    /* state */
    const state = reactive({
      username: '',
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      confirmedPassword: '',
      country: '',
      submitError: null,
      isLoading: false,
    });

    /* custom validators */
    const hasNumber = helpers.withMessage(
      'Password must contain at least one number',
      (value) => /\d/.test(value)
    );
    
    const hasSpecialChar = helpers.withMessage(
      'Password must contain at least one special character',
      (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value)
    );

    /* validation rules */
    const rules = {
      username: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(8),
        alpha,
      },
      firstname: { required },
      lastname : { required },
      email    : { required, email },
      country  : { required },
      password : {
        required,
        minLength: minLength(5),
        maxLength: maxLength(10),
        hasNumber,
        hasSpecialChar,
      },
      confirmedPassword: {
        required,
        sameAsPassword: sameAs(computed(() => state.password)),
      },
    };

    const v$ = useVuelidate(rules, state);

    /* submit */
    const register = async () => {
      const validationResult = await v$.value.$validate();
      if (!validationResult) {
        console.log('Validation failed!');
        return;
      }

      state.isLoading = true;
      state.submitError = null;

      try {
        await axios.post(`${store.server_domain}/register`, {
          username: state.username,
          firstname: state.firstname,
          lastname : state.lastname,
          email    : state.email,
          password : state.password,
          country  : state.country,
        });
        toast('Registration successful', 'You can now login', 'success');
        router.push('/login');
      } catch (err) {
        state.submitError =
          err.response?.data?.message || 'Unexpected server error.';
      } finally {
        state.isLoading = false;
      }
    };

    return {
      state,
      countries: rawCountries,
      register,
      v$,
    };
  },
};
</script>
