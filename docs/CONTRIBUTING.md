# Contributing to Firefiles

- To contribute to our cloud providers, please see [Adding cloud providers](#adding-cloud-providers) below.
- Before jumping into a PR be sure to search [existing PRs](https://github.com/faisalsayed10/firefiles/pulls) or [issues](https://github.com/faisalsayed10/firefiles/issues) for an open or closed item that relates to your submission.

## Developing

The production branch is `main`. You can checkout a new branch from this branch and start working on it.

To develop locally:

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your
   own GitHub account and then
   [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device.

   If you don't need the whole git history, you can clone with depth 1 to reduce the download size:

   ```sh
   git clone --depth=1 https://github.com/faisalsayed10/firefiles
   ```

2. Create a new branch:
   ```
   git checkout -b MY_BRANCH_NAME
   ```
3. Install yarn:
   ```
   npm install -g yarn
   ```
4. Install the dependencies with:
   ```
   yarn
   ```
5. Start developing and watch for code changes:
   ```
   yarn dev
   ```

## Environment variables

There are some environment variables that need to be set in order to run the app properly.

```
COOKIE_PASSWORD=A 32 character long secret password used to encrypt cookies.
CIPHER_KEY=A randomly generated secret key used to encrypt and decrypt credentials.
SENDGRID_API_KEY=SendGrid API key used to send emails for passwordless login.
EMAIL_FROM=The email address which will be used as the sender of the email (This email should be added and verified on the SendGrid dashboard).
JWT_SECRET=A randomly generated secret key to sign and verify JWT tokens (used for paswordless logins).
DATABASE_URL=A local mysql database url.
DEPLOY_URL=http://localhost:3000
```

## Linting

To format your code:

```sh
yarn lint
```

## Adding cloud providers

Adding a new cloud providers simply requires you to create a new hook in the `hooks/` directory.

- First, create a new file inside `pages/new/` directory which will be used to get the credentials for that provider. (refer other files to get an idea)
- Then, create a new file inside the `hooks/` folder named `use<YOUR_PROVIDER_NAME>.tsx`.
- You can use `useS3.tsx` as a starting point.
- It must contain a context which provides the following values:

```
loading: boolean;
currentFolder: DriveFolder;
folders: DriveFolder[];
files: DriveFile[];
uploadingFiles: UploadingFile[];
setUploadingFiles: React.Dispatch<React.SetStateAction<UploadingFile[]>>;
addFolder: (name: string) => void;
removeFolder: (folder: DriveFolder) => Promise<void>;
addFile: (files: File[] | FileList) => Promise<void>;
removeFile: (file: DriveFile) => Promise<boolean>;
```

This is defined in the `useBucket` hook.

- The first `useEffect` with the `// set currentFolder` comment must be used to change the current directory according to the path. You won't need to make much changes in this hook.
- The next `useEffect` commented with `// get files and folders` must be used to populate the `files` and `folders` states according to the current directory.
- Fill out the remaining functions like `addFolder`, `removeFolder`, `addFile` and `removeFile`.
- Navigate to `util/globals.ts` and add an object for your provider to the `PROVIDERS` array. (Also add a logo for the provider in the `public/` directory)
- Navigate to `util/types.ts` and add your provider's name to the `Provider` enum.
- Finally, navigate to the `useBucket` hook and add a case for your provider and return that hook.
- Also make sure to edit any provider specific functions to make it work with your provider. (look for switch cases or if/else statements which check for the type of the provider).

### Testing

Start your local development server and on your dashboard, click on the `Create New Drive` button. find your provider there and enter the required credentials.

Once that is done, your drive will show up on your dashboard, click on that drive and you should be able to see your files and folders which are stored on the root directory.

If you're facing any issues, bugs or errors, try checking the console and debugging it.

Things to test:

- [ ] Check if the files and folders are getting populated correctly.
- [ ] Check if you can navigate inside subfolders.
- [ ] Check if you can preview / download / upload / delete / share the files.
- [ ] Check if you can delete an entire folder with its contents.
- [ ] Check if you can create a folder and upload files to it.

## Creating a PR

Make sure everything's working and your code is formatted and create a PR at https://github.com/faisalsayed/firefiles/pulls. Once we review your PR, we'll merge it! :)
