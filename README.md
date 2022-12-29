# safe-cycle

Web-based routing app for finding safe cycling routes with the option to avoid user-specified "nogo" paths.

## Running the app

### Before you build and run

Create a `.env` file at the root of the project with the following content:

```
TEST=1
PORT=8000
MONGODB_URL=mongodb://127.0.0.1/auth
SESSION_SECRET=your_secret
```

Run `yarn` to install the required packages.

You must also make sure the `brouter` submodule folder is updated by running `git submodule update --init`.

### Build and run

Build and run the app by running `yarn build` followed by `yarn start`. This starts the server on `localhost` at the port specified in your `.env` file.

### Run in development mode

To run the app in development mode run `yarn dev-client` and `yarn dev-server` in two separate terminals. Alternatively, you can simply run `yarn dev` which runs both client and server commands concurrently in the same terminal. This will rebuild and restart the server when changes are made. You will have to refresh the browser to see client changes.
