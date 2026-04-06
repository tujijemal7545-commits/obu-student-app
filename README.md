# OBU Muslim Students Register

A comprehensive, beautifully styled React Native application designed for the web and mobile to register students and manage administrative access.

## Getting Started

1. **Install dependencies**
   Navigate to the `obu-student-app` directory and install the required modules:
   ```bash
   npm install
   ```

2. **Start the Development Server**
   Start the application specifically patterned for the web browser:
   ```bash
   npm run web
   ```

---

## 🔐 How to Give/Create an Admin Account in Firebase

Firebase requires new users to be registered in the Authentication system before they can log in. Because the admin interface does not have a public "Sign Up" page (for security reasons), you can register a new admin account in one of two ways:

### Method 1: Using the automated script (Recommended)
We have written a Node script to programmatically inject a new admin account into your database.

1. Open `obu-student-app/scripts/create-admin.mjs` in your code editor.
2. At the bottom of the file, you will see the `createUserWithEmailAndPassword` function. Change the email and password parameters to whatever you want the new admin's credentials to be.
   ```javascript
   createUserWithEmailAndPassword(auth, "newadmin@gmail.com", "mysecretpassword123")
   ```
3. Open your terminal, ensure you are inside the `obu-student-app` folder, and run:
   ```bash
   node scripts/create-admin.mjs
   ```
4. You will see a "SUCCESS!" message with the new User's ID, and you can now log in using those credentials on the Admin tab.

### Method 2: Manually via the Firebase Console
If you prefer adding users via a graphical interface:

1. Go to your [Firebase Console](https://console.firebase.google.com/) and navigate to your Project (`obu-student-system`).
2. On the left sidebar, click on **Authentication**.
3. Go to the **Users** tab.
4. Click the **Add user** button on the top right.
5. Enter the desired **Email address** and **Password** for your administrator.
6. Click **Add user**. 
7. You can now use that exact email and password combo to log into the Admin panel on the web app!
