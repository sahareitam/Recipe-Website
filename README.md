# Recipe Website

This is our final project for the web development course. It's a recipe website where you can search recipes, save favorites, and add family recipes.

## Team
Yehonatan Yamin - 206511727
Ido Badash - 206917510  
Sahar Eitam - 318283116

## What it does

Basic recipe website with search and user accounts. Has two parts - Vue.js frontend and Node.js backend with MySQL database.

Main stuff:
- Register/login system 
- Search recipes using Spoonacular API
- Save favorites
- Add your own recipes
- Family recipes section (we got recipes from our grandparents)
- Shows last recipes you viewed
- Uses Bootstrap for styling

## Tech Stack

Frontend:
- Vue 3 
- Vue Router 
- Bootstrap-Vue 3 
- Vuelidate for forms
- Axios 
- Bootstrap 5

Backend:
- Node.js + Express
- MySQL 
- Spoonacular API 
- bcrypt for passwords
- express-session

## Project Structure

```
recipe-project/
├── frontend/                 # Vue.js frontend application
│   ├── src/
│   │   ├── components/       # Vue components
│   │   ├── pages/           # Page components
│   │   ├── router/          # Vue Router config
│   │   └── assets/          # Static assets
│   └── package.json
│
├── backend/                  # Node.js backend API
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── recipes.js       # Recipe routes
│   │   └── user.js          # User-specific routes
│   ├── routes/utils/
│   │   ├── DButils.js       # Database utilities
│   │   ├── MySql.js         # MySQL connection
│   │   ├── recipes_utils.js # Recipe API logic
│   │   └── user_utils.js    # User data logic
│   ├── main.js              # Server entry point
│   └── package.json
│
└── README.md                 # This file
```

## Setup

Need Node.js, MySQL, and Spoonacular API key.

1. Clone and install:
```bash
git clone <repo-url>
cd recipe-project
```

2. Backend:
```bash
cd backend
npm install
```

Make `.env` file:
```
host=localhost
user=your_mysql_user
password=your_mysql_password  
database=recipe_db
bcrypt_saltRounds=10
spooncular_apiKey=your_api_key
```

Create database tables (check backend README for SQL), then:
```bash
npm start
```

3. Frontend:
```bash
cd frontend
npm install
npm run serve
```

Backend: localhost:3000
Frontend: localhost:8080

## Database

MySQL tables:
- users - user accounts
- FavoriteRecipes - saved recipes
- userrecipes - user created recipes  
- ViewedRecipes - recently viewed

## API

We made Swagger docs. Import `ido&Yehonatan&Sahar-Recipes-1.0.0-resolved.yaml` into Swagger Editor to see the API.

## Commands

Frontend:
```bash
npm run serve    # dev server
npm run build    # build
npm run lint     # check code
```

Backend:
```bash
npm start
```

## About

This was our assignment for Web Development course. Had some issues with connecting frontend to backend at first but figured it out. The authentication part was tricky too.

For the family recipes we actually called our grandparents to get real recipes. Got some good ones that have been in our families for years.

Project has all the required stuff - user login, recipe search, favorites, personal recipes, family recipes section.