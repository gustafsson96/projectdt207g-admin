# PROJECT - ADMIN (Backend-baserad webbutveckling, DT207G)

This admin site is part of the final project for the course Backend-baserad webbutveckling, dt207g, at Mittuniversitet, Sundsvall.
<br><br>
Link to the live admin site: [The Green Slice Admin](https://dt207gadminjg.netlify.app/admin.html)
<br><br>
The other parts of the project are:
* The backend API - [API repository](https://github.com/gustafsson96/projectdt207g-api.git)
* Frontend website - [The Green Slice Website repository](https://github.com/gustafsson96/projectdt207g-site.git)

## Overview
The admin site manages menu items for the fictional restaurant "The Green Slice" and allows an admin to:
* Log in
* View existing menu items
* Add a new menu item
* Update and delete existing menu items
* Log out

The site interacts with the backend API created specifically for this project and the protected content is secured via JWT (JSON Web Token) authentication.

## Features
* Login required to access admin functionality. Username and password are validated in the backend.
* Responsive design.
* Form with validation to add a new menu item with name, category, ingredients, price and vegan alternative (y/n).
* Inline editing for updating a menu item with buttons to save or cancel.
* Removing a menu item. 
* Feedback messages based on success/error.
* Logout button.

## Technologies Used
* HTML for basic structure.
* CSS for styling.
* Vite for dev server and build (dev dependency).
* Communication with backend: Node.js, Express, MongoDB Atlas (handeled separately).
* JWT for authentication.
* Netlify for deployment.

## Adding Users
Creating a new user is handled via a backend script to hash passwords and manual database updates since there is no need for more than one admin at the moment. 

## Run Locally
* Clone the reponsitory: git clone https://github.com/gustafsson96/projectdt207g-admin.git
* Install dependencies: npm install
* Start the development server with Vite: npm run dev

Note:
* Ensure the backend API is running so the admin frontend can communicate with it.

