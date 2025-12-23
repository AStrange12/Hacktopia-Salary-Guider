# Deployment Instructions for Salary Guider

This guide provides step-by-step instructions to deploy your Next.js application to Firebase Hosting.

## Prerequisites

1.  **Firebase Project**: Make sure you have a Firebase project created. If not, create one at the [Firebase Console](https://console.firebase.google.com/).
2.  **Firebase CLI**: Install the Firebase CLI on your local machine.
    ```bash
    npm install -g firebase-tools
    ```
3.  **Authentication**: Log in to Firebase using the CLI.
    ```bash
    firebase login
    ```
4.  **Environment Variables**: Create a `.env.local` file in the root of your project by copying `.env.example`. Fill in the values from your Firebase project's settings.

## Step-by-Step Deployment

### 1. Initialize Firebase in Your Project

If you haven't already, initialize Firebase in your project directory.

```bash
firebase init
```

Follow the prompts:
- Select **App Hosting**.
- Choose your Firebase project.
- When it asks for the public directory, enter `.next`. **This is important.**
- It will ask to configure as a single-page app. Say **No**.
- It will ask to set up GitHub Action deployments. You can choose **Yes** for CI/CD or **No** for manual deployments.

This will create `firebase.json` and `.firebaserc` files in your project. The `apphosting.yaml` file is already configured for a Next.js app.

### 2. Build Your Next.js App

Before deploying, you need to create a production build of your application.

```bash
npm run build
```

This command compiles your Next.js app and places the output in the `.next` directory.

### 3. Deploy to Firebase Hosting

Now, you can deploy your application to Firebase Hosting.

```bash
firebase deploy --only apphosting
```

The CLI will upload your project to Firebase and provide you with a URL where your live app can be viewed.

### 4. Continuous Integration (CI/CD) with GitHub Actions

If you opted to set up GitHub Actions during `firebase init`, a `.github/workflows` directory was created with deployment workflows.

1.  **Push to GitHub**: Commit and push your code to your GitHub repository.
2.  **Secrets**: You'll need to add a `FIREBASE_SERVICE_ACCOUNT` secret to your GitHub repository secrets.
    - Go to your Firebase project settings -> Service accounts.
    - Generate a new private key. This will download a JSON file.
    - Go to your GitHub repository -> Settings -> Secrets and variables -> Actions.
    - Create a new repository secret named `FIREBASE_SERVICE_ACCOUNT` and paste the entire content of the downloaded JSON file as the value.
3.  **Merge to `main`**: The default workflow is often configured to deploy when code is pushed or merged to the `main` branch. Check your workflow file (e.g., `.github/workflows/firebase-hosting-pull-request.yml`) for details.

Your app will now automatically deploy whenever you push changes to the configured branch.

## Common Issues

- **Authentication Errors**: If you're using Google Sign-In, make sure you have added your production domain to the list of authorized domains in the Firebase Console (Authentication -> Settings -> Authorized domains).
- **Environment Variables**: Server-side environment variables are handled differently in App Hosting. Refer to the [Firebase App Hosting documentation](https://firebase.google.com/docs/app-hosting/configure-backend#environment-variables) for securely managing secrets. `NEXT_PUBLIC_` variables are available on the client-side during the build process.
