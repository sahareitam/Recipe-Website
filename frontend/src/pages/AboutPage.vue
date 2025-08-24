<template>
  <div class="about-page">
    <b-container>
      <b-row>
        <b-col md="8" offset-md="2">
          <h1 class="text-center mb-4">About Vue Recipes</h1>
          
          <div class="about-content">
            <b-card class="mb-4">
              <h3 class="text-primary">Project Overview</h3>
              <p>
                <strong>Vue Recipes</strong> represents the culmination of our full-stack development expertise, 
                delivering a comprehensive recipe management ecosystem that seamlessly integrates frontend 
                innovation with robust backend architecture.
              </p>
              <p>
                Built as a complete end-to-end solution, Vue Recipes transforms how users discover, organize, 
                and share culinary experiences. Our platform demonstrates advanced proficiency in modern 
                web development practices, from scalable API design to responsive user interfaces.
              </p>
              <p>
                <strong>Why Vue Recipes?</strong> We've created more than just a recipe app - it's a showcase 
                of professional development capabilities, featuring enterprise-grade authentication, 
                sophisticated search algorithms, and an intuitive user experience that scales from 
                home cooks to culinary professionals.
              </p>
            </b-card>
            
            <b-card class="mb-4">
              <h3 class="text-primary">Features</h3>
              <ul class="feature-list">
                <li><strong>Recipe Discovery:</strong> Browse thousands of recipes from various cuisines</li>
                <li><strong>Advanced Search:</strong> Find recipes by ingredients, dietary restrictions, and more</li>
                <li><strong>Personal Collection:</strong> Save your favorite recipes and create your own</li>
                <li><strong>Family Recipes:</strong> Share and preserve family cooking traditions</li>
                <li><strong>User-Friendly Interface:</strong> Clean, responsive design for all devices</li>
              </ul>
            </b-card>
            
            <b-card class="mb-4">
              <h3 class="text-primary">Technology Stack</h3>
              <div class="tech-stack">
                <b-row>
                  <b-col md="6">
                    <h5>Frontend</h5>
                    <ul>
                      <li>Vue.js 3</li>
                      <li>Vue Router 4</li>
                      <li>Bootstrap-Vue 3</li>
                      <li>Vuelidate</li>
                      <li>Axios</li>
                    </ul>
                  </b-col>
                  <b-col md="6">
                    <h5>Backend</h5>
                    <ul>
                      <li>Node.js</li>
                      <li>Express.js</li>
                      <li>MySQL Database</li>
                      <li>RESTful API</li>
                      <li>Authentication System</li>
                    </ul>
                  </b-col>
                </b-row>
              </div>
            </b-card>
            
            <b-card class="mb-4">
              <h3 class="text-primary">Development Team</h3>
              <p>
                Vue Recipes is proudly developed by a talented team of three full-stack developers 
                specializing in modern web technologies and scalable application architecture.
              </p>
              <div class="team-members">
                <div class="team-member">
                  <h5><i class="fas fa-user-code"></i> Yehonatan Yamin</h5>
                  <p>Full-Stack Developer | ID: 206511727</p>
                </div>
                <div class="team-member">
                  <h5><i class="fas fa-user-code"></i> Ido Badash</h5>
                  <p>Full-Stack Developer | ID: 206917510</p>
                </div>
                <div class="team-member">
                  <h5><i class="fas fa-user-code"></i> Sahar Eitam</h5>
                  <p>Full-Stack Developer | ID: 318283116</p>
                </div>
              </div>
              <p>
                <strong>Our Mission:</strong> To create innovative, user-centric web applications 
                that demonstrate excellence in both frontend and backend development, combining 
                cutting-edge technologies with intuitive user experiences.
              </p>
            </b-card>
            
            <b-card class="mb-4">
              <h3 class="text-primary">Previous Work</h3>
              <p>
                Our development journey showcases a comprehensive approach to full-stack development, 
                progressing from robust backend APIs to sophisticated frontend applications.
              </p>
              
              <div class="previous-work">
                <div class="project-item">
                  <h5><i class="fas fa-server"></i> Assignment 3.2 - CookingAi Backend API</h5>
                  <p>
                    <strong>Full-featured Node.js RESTful API</strong> for recipe management, featuring 
                    user authentication, recipe search integration with Spoonacular API, and comprehensive 
                    recipe management capabilities.
                  </p>
                  <p>
                    <strong>Key Features:</strong> User registration & authentication, Recipe search & management, 
                    Personal and family recipe collections, OpenAPI 3.0.3 documentation
                  </p>
                  <p>
                    <strong>Tech Stack:</strong> Node.js, Express, MySQL, Spoonacular API, Authentication middleware
                  </p>
                  <div class="project-links">
                    <a href="https://github.com/WED-2023/backend" 
                       target="_blank" class="btn btn-outline-primary btn-sm">
                      <i class="fab fa-github"></i> GitHub Repository
                    </a>
                  </div>
                </div>
              </div>
              
              <p class="mt-3">
                <strong>Development Philosophy:</strong> We believe in building scalable, maintainable 
                applications that provide exceptional user experiences while maintaining clean, 
                well-documented code architecture.
              </p>
            </b-card>
            
            <b-card class="contact-card">
              <h3 class="text-primary">Contact</h3>
              <p>
                For questions, suggestions, or support, please feel free to reach out to our development team.
              </p>
              <p>
                <i class="fas fa-envelope"></i> Yehonatan Yamin: yehonaty@post.bgu.ac.il<br>
                <i class="fas fa-envelope"></i> Ido Badash: idobada@post.bgu.ac.il<br>
                <i class="fas fa-envelope"></i> Sahar Eitam: sahareit@post.bgu.ac.il
              </p>
            </b-card>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
  metaInfo: {
    title: 'About - Vue Recipes'
  }
}
</script>

<style scoped>
.about-page {
  padding: 2rem 0;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.about-content {
  margin-top: 2rem;
}

.feature-list {
  padding-left: 1.5rem;
}

.feature-list li {
  margin-bottom: 0.5rem;
}

.tech-stack ul {
  list-style: none;
  padding-left: 0;
}

.tech-stack li {
  padding: 0.25rem 0;
  border-bottom: 1px solid #e9ecef;
}

.tech-stack li:last-child {
  border-bottom: none;
}

.contact-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.contact-card h3 {
  color: white !important;
}

.text-primary {
  color: #42b983 !important;
}

h1 {
  color: #2c3e50;
  font-weight: 600;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.team-members {
  margin: 1.5rem 0;
}

.team-member {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #42b983;
}

.team-member h5 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.team-member p {
  margin-bottom: 0;
  color: #6c757d;
}

.previous-work {
  margin: 1.5rem 0;
}

.project-item {
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.project-item h5 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.project-links {
  margin-top: 1rem;
}

.project-links .btn {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>