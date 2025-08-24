<template>
  <div class="family-recipes-page">
    <b-container>
      <b-row>
        <b-col md="12">
          <h1 class="text-center mb-4">My Family Recipes</h1>
          
          <!-- Recipes grid -->
          <div class="recipe-preview-grid">
            <div 
              v-for="recipe in familyRecipes" 
              :key="recipe.id"
              class="recipe-card"
              @click="selectRecipe(recipe)"
            >
              <div class="card">
                <div class="image-container">
                  <img
                    :src="recipe.image"
                    class="card-img-top recipe-image"
                    :alt="recipe.title"
                  />
                </div>
                <div class="card-body">
                  <h5 class="card-title">{{ recipe.title }}</h5>
                  <div class="recipe-info">
                    <div class="info-item">
                      <span class="info-icon">👤</span>
                      <span>{{ recipe.servings }} servings</span>
                    </div>
                    <div class="info-item">
                      <span class="info-icon">⏰</span>
                      <span>{{ recipe.readyInMinutes }} mins</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Selected recipe details -->
          <div v-if="selectedRecipe" class="recipe-details mt-5">
            <b-card class="recipe-detail-card">
              <h2 class="mb-3">{{ selectedRecipe.title }}</h2>
              
              <b-row>
                <b-col md="4">
                  <img 
                    :src="selectedRecipe.image" 
                    :alt="selectedRecipe.title"
                    class="recipe-detail-image"
                  />
                </b-col>
                <b-col md="8">
                  <div class="recipe-meta">
                    <p><strong>Recipe by:</strong> {{ selectedRecipe.familyMember }}</p>
                    <p><strong>When we make it:</strong> {{ selectedRecipe.occasion }}</p>
                    <p><strong>Servings:</strong> {{ selectedRecipe.servings }}</p>
                    <p><strong>Prep time:</strong> {{ selectedRecipe.readyInMinutes }} minutes</p>
                  </div>
                  
                  <div class="family-story mb-3">
                    <h4>Family Story</h4>
                    <p>{{ selectedRecipe.familyStory }}</p>
                  </div>
                </b-col>
              </b-row>
              
              <b-row class="mt-4">
                <b-col md="6">
                  <h4>Ingredients</h4>
                  <ul class="ingredients-list">
                    <li v-for="ingredient in selectedRecipe.ingredients" :key="ingredient">
                      {{ ingredient }}
                    </li>
                  </ul>
                </b-col>
                <b-col md="6">
                  <h4>Instructions</h4>
                  <ol class="instructions-list">
                    <li v-for="instruction in selectedRecipe.instructions" :key="instruction">
                      {{ instruction }}
                    </li>
                  </ol>
                </b-col>
              </b-row>
            </b-card>
          </div>
          
          <div v-else class="text-center mt-4">
            <p class="text-muted">Click on a recipe card above to see the full details</p>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'FamilyRecipesPage',
  components: {},
  setup() {
    const selectedRecipe = ref(null)
    
    const familyRecipes = ref([
      {
        id: 1,
        title: "Grandma Sarah's Malabi",
        image: "/malabi.jpg",
        readyInMinutes: 45,
        servings: 6,
        familyMember: "Grandma Sarah",
        occasion: "Every Shabbat and when we want something sweet",
        familyStory: "So this is my grandma's malabi recipe and honestly, it's the best one ever. She came from Morocco and brought this recipe with her. Every Friday before Shabbat, our whole house smells like rose water and it's just amazing. She always tells me the secret is to stir it with patience and not rush it. I remember being little and standing on a chair next to her, watching her make it. Now I make it for my friends and they always ask for the recipe!",
        ingredients: [
          "1 liter whole milk",
          "1/2 cup sugar",
          "1/4 cup cornstarch",
          "1 tsp vanilla extract",
          "1 tsp rose water (you can find this at any Middle Eastern store)",
          "A few drops of red food coloring (optional, but it looks prettier)",
          "Shredded coconut for topping",
          "Chopped pistachios for garnish"
        ],
        instructions: [
          "Heat the milk in a big pot on medium heat until it starts to bubble a bit",
          "Mix the cornstarch with some cold milk in a small bowl until it's smooth (no lumps!)",
          "Slowly add this mixture to the hot milk while whisking like crazy",
          "Add the sugar and keep stirring for about 10 minutes until it gets thick",
          "Take it off the heat and add vanilla and rose water",
          "Add a tiny bit of red coloring if you want it pink",
          "Pour into small cups and put in the fridge for at least 2 hours",
          "Before serving, sprinkle coconut and pistachios on top"
        ]
      },
      {
        id: 2,
        title: "Aunt Rachel's Kibbeh",
        image: "/kebe.jpg",
        readyInMinutes: 120,
        servings: 8,
        familyMember: "Aunt Rachel",
        occasion: "Family gatherings and holidays",
        familyStory: "My aunt Rachel makes the best kibbeh in the family, no contest. She learned this from our Syrian neighbors when she was young, and she's been making it for like 40 years now. The hardest part is shaping them - it took me forever to learn how to make them look nice. But trust me, even if they look weird, they'll still taste incredible. She always makes double the amount because everyone eats like 3 or 4 pieces each. It's basically our family's comfort food.",
        ingredients: [
          "2 cups fine bulgur wheat (bulgur dakik)",
          "500g lean ground beef",
          "1 big onion, chopped really fine",
          "2 tbsp olive oil",
          "1 tsp allspice (baharat)",
          "1/2 tsp cinnamon",
          "1/2 tsp black pepper",
          "1 tsp salt",
          "1/4 cup pine nuts",
          "Oil for frying"
        ],
        instructions: [
          "Soak the bulgur in cold water for 30 minutes, then drain and squeeze out all the water",
          "Mix bulgur with half the meat, salt, and spices - this is your shell",
          "For the filling: fry the onions until they're golden, add the rest of the meat",
          "Add pine nuts and spices to the filling and cook until the meat is done",
          "Take some shell mixture and shape it into a hollow oval (this is the tricky part!)",
          "Fill with the meat mixture and close it up carefully",
          "Heat oil to 175°C and fry until they're golden brown",
          "Serve hot with yogurt or tahini sauce"
        ]
      },
      {
        id: 3,
        title: "Mom Michal's Honey Cake",
        image: "/Honey-Cake-12-773x1030.jpg",
        readyInMinutes: 90,
        servings: 12,
        familyMember: "Mom Michal",
        occasion: "Rosh Hashanah and whenever we need something sweet",
        familyStory: "This is my mom's honey cake recipe and it's seriously the best thing ever. She makes it every year for Rosh Hashanah and the whole house smells amazing for hours. The secret is adding coffee and a bit of whiskey - I know it sounds weird but it makes it taste so rich and deep. She usually makes like 5 cakes at once and gives them to all our neighbors. I'm studying abroad now and I miss this cake so much, so I finally asked her to teach me how to make it. Now I make it for my roommates and they think I'm some kind of baking genius!",
        ingredients: [
          "1 cup honey (the good stuff, not the cheap one)",
          "1 cup brown sugar",
          "4 large eggs",
          "1/2 cup vegetable oil",
          "1 cup strong coffee, cooled down",
          "3 1/2 cups all-purpose flour",
          "1 tsp baking powder",
          "1 tsp baking soda",
          "1 tsp cinnamon",
          "1/2 tsp ground cloves",
          "1/2 tsp nutmeg",
          "1 tsp salt",
          "2 tbsp whiskey (optional but recommended)"
        ],
        instructions: [
          "Preheat oven to 175°C and grease a big bundt pan really well",
          "Mix honey, brown sugar, and eggs in a big bowl",
          "Add oil, coffee, and whiskey if you're using it",
          "In another bowl, mix all the dry ingredients",
          "Slowly fold the dry stuff into the wet stuff - don't overmix!",
          "Pour into the pan and smooth the top",
          "Bake for 60-70 minutes or until a toothpick comes out clean",
          "Let it cool in the pan for 10 minutes, then flip it out",
          "Drizzle with honey and chopped almonds when serving"
        ]
      }
    ])
    
    const selectRecipe = (recipe) => {
      selectedRecipe.value = recipe
    }
    
    return {
      familyRecipes,
      selectedRecipe,
      selectRecipe
    }
  }
}
</script>

<style scoped>
.family-recipes-page {
  padding: 2rem 0;
  min-height: 100vh;
}

h1 {
  color: #2c3e50;
  font-weight: 600;
}

.recipe-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.recipe-card {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.recipe-card:hover {
  transform: translateY(-5px);
}

.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
}

.image-container {
  height: 200px;
  overflow: hidden;
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recipe-card:hover .recipe-image {
  transform: scale(1.05);
}

.card-body {
  padding: 1.5rem;
}

.card-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 1rem;
}

.recipe-info {
  display: flex;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.info-icon {
  font-size: 1.1rem;
}

.recipe-details {
  margin-top: 3rem;
}

.recipe-detail-card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.recipe-detail-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 10px;
}

.recipe-meta p {
  margin-bottom: 0.5rem;
  color: #495057;
}

.recipe-meta strong {
  color: #2c3e50;
}

.family-story {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  border-left: 4px solid #007bff;
}

.family-story h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.family-story p {
  color: #495057;
  font-style: italic;
  line-height: 1.6;
}

.ingredients-list,
.instructions-list {
  padding-left: 1.5rem;
}

.ingredients-list li,
.instructions-list li {
  margin-bottom: 0.5rem;
  color: #495057;
  line-height: 1.5;
}

.ingredients-list li {
  list-style-type: disc;
}

.instructions-list li {
  list-style-type: decimal;
  margin-bottom: 0.8rem;
}

h4 {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 1rem;
}

h2 {
  color: #2c3e50;
  font-weight: 600;
}

@media (max-width: 768px) {
  .recipe-preview-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .recipe-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .family-story {
    padding: 1rem;
  }
}
</style>