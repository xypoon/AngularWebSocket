## Getting Started with Angular Frontend

To get your Angular frontend application up and running, follow these steps:

1. **Install Angular CLI:**

    First, you need to install Angular CLI globally on your machine. Open your terminal and run the following command:

    ```sh
    npm install -g @angular/cli
    ```

2. **Navigate to Project Directory:**

    Change your directory to the newly created Angular project:

    ```sh
    cd Angular_WebSocket_Frontend
    ```

3. **Install necessary packages:**

    Change your directory to the newly created Angular project:

    ```sh
    cd npm install
    ```

4. **Serve the Application:**

    Start the development server by running the following command:

    ```sh
    ng serve
    ```

    By default, the application will be served at `http://localhost:4200/`. Open this URL in your web browser to see your running Angular application.

By following these steps, you will have a basic Angular frontend application up and running.

## Configuring Angular to Use the SSL Certificate

To configure your Angular application to use the self-signed SSL certificate, you need to modify the `angular.json` file and update the `ng serve` command.

1. **Modify `angular.json`:**

    Open the `angular.json` file in your project and locate the `serve` options for your project. Add the `ssl`, `sslKey`, and `sslCert` options to the configuration:

    ```json
    "serve": {
        "options": {
        "ssl": true,
        "sslKey": "cert/localhost.key",
        "sslCert": "cert/localhost.crt",
        }
    }
    ```

2. **Toggle SSL Usage:**

    To toggle between using the SSL certificate or not, you can use Angular CLI command options. By default, the above configuration will enable SSL. To disable SSL, you can run the `ng serve` command with the `--ssl` option set to `false`:

    ```sh
    ng serve --ssl=false
    ```

    If you want to enable SSL explicitly, you can run:

    ```sh
    ng serve --ssl=true
    ```

By following these steps, you can configure your Angular application to use the self-signed SSL certificate and easily toggle SSL usage as needed.