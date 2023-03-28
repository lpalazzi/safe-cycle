# safe-cycle

Web-based routing app for finding safe cycling routes with the option to avoid user-specified "nogo" paths.

## Running the app

### Before you build and run

Create a `.env` file at the root of the project with the following content:

```
TEST=1
PORT=8000
MONGODB_URL=mongodb://127.0.0.1/safecycle
BROUTER_URL=http://localhost:17777/brouter
SESSION_SECRET=your_secret # generate your own secret to put here
```

Run `yarn` to install the required packages.

Run `git submodule update --init` to populate/update the `./brouter` submodule folder.

Run `bash ./brouter/scripts/update_segments.sh` to update the BRouter segment files to the most up-to-date for most of Canada. These files are required to run the server.

Running the BRouter sever requires the Java runtime and compiler. You can install the `javac` compiler on Ubuntu with `apt-get install default-jdk`.

NOTE: The BRouter project uses Gradle version 7.6, which supports Java up to version 19. If you have a newer version of Java you may need to update the Gradle version specified in `brouter/gradle/wrapper/gradle-wrapper.properties`.

### Build and run BRouter server

To build the BRouter server: `yarn build-brouter`

To run the BRouter server: `yarn brouter`

This starts the server on `localhost` on port `17777`.

#### Using Docker

A `Dockerfile` is included in the brouter repository. Build the docker image using `docker build --tag brouter ./brouter` and start the container with `docker run -d -p 17777:17777 --name brouter brouter`.

### Build and run app

To build the app: `yarn build`

To run the app: `yarn start`

This starts the server on `localhost` on the port specified in your `.env` file.

### Run in development mode

Start the BRouter server in a separate terminal as described above.

To run the app in development mode run `yarn dev-client` and `yarn dev-server` in two separate terminals.

Alternatively, `yarn dev` runs both client and server commands concurrently in the same terminal. This will rebuild and restart the server when changes are made. You will have to refresh the browser to see client changes.

## Run tests

The command `yarn test` will run the server's test suite. Make sure you have your local MongoDB service and BRouter server running before starting the tests.
