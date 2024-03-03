# Expense Tracker Project

## Overview

The **Online Course App** is designed to help individuals access a wide range of courses from various disciplines, enabling them to learn at their own pace and convenience, regardless of their location or schedule.

## Features

- **Course Entry:** Users can add, edit and delete courses, each course has a title, description and various sections.
- **Course Enrollment:** Students can enroll in courses, which will then appear in their dashboard.
- **Search Courses:** Users can search for courses by title, topic, instructor name, and other advanced search filters.
- **Video Sections:** Users can include video sections in their courses by embedding YouTube videos using the provided embedding link.
- **User Authentication:** Secure access with user accounts and authentication.

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT)
- **Frameworks:** Mongoose, JQuery, Nodemailer

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Rayann12/OnlineCourseApp.git
   ```
   
2. **Navigate to the project folder:**

   ```bash
   cd OnlineCoursesApp
   ```
   
3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Configure the environment variables:**

   Create a .env file in the root directory and add necessary configurations.

   ```.env
   CONNECTION_STRING='YOUR_MONGODB_ACCESS_STRING'
   KEY_ID='YOUR_RAZORPAY_KEY_ID'
   KEY_SECRET='YOUR_RAZORPAY_KEY_SECRET'
   JWT_SECRET='YOUR_JWT_SECRET'
   EMAIL='YOUR_EMAIL'
   PASSWORD='YOUR_APP_PASSWORD_FOR_EMAIL'
   ```

6. **Run the application:**
   ```bash
   npm start
   ```

   Visit http://localhost:3000 to access the Online Courses Application. It is temporarily available on the IP address, http://3.6.126.45.

## Usage

1. **Sign up or log in to your account:**
   
   Visit the application's sign-up or login page to access your account. If you don't have an account, you'll need to sign up to get started.

2. **View All Courses:**
   
   Once logged in, navigate to the course section to view all available courses. You can browse through the list and enroll in courses that interest you.

3. **View Enrolled and Completed Courses:**
   
   Explore the dashboard to view the courses you are currently enrolled in and those you have completed. This helps you keep track of your progress.

4. **Buy Courses mark Enrolled Courses as complete:**

   Purchase courses that require payment and mark courses you have completed as finished. This keeps your course list organized and up to date.

5. **Add or Edit a Course (if logged in as instructor):**
   
   If you are an instructor, you can add new courses or edit existing ones. This allows you to manage your course offerings effectively.

6. **Add Text or Video Sections to the Course:**

   Enhance your courses by adding text or video sections. This provides a richer learning experience for your students. Youtube videos can be added as section content by embedding the section content input. Instructors can simply paste the text they get when they try to share a YouTube video using the embed option. This way, they can easily include videos in their course material, making the learning experience more engaging and interactive.

7. **Logout:**
   
   For security, always log out of your account when you're done using the application. This ensures that your financial      information remains secure.

## Contributors

- [Rayan Ahmed](https://github.com/rayann12)

## License

This project is dedicated to the public domain under the Creative Commons Zero v1.0 Universal license (CC0). Feel free to use, modify, and distribute this code without any restrictions.
