## Generating and Installing a Self-Signed SSL Certificate

To generate a self-signed SSL certificate and install it in your browser's trusted root, follow these steps:

1. **Generate the Certificate:**

    Run the following command in your terminal to generate a self-signed SSL certificate:

    ```sh
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout localhost.key -out localhost.crt -sha256 -subj "/C=US/ST=State/L=City/O=SIT/OU=Computing Science/CN=localhost" -addext "subjectAltName=DNS:localhost"
    ```

    This command will create two files:
    - `localhost.key`: The private key for the certificate.
    - `localhost.crt`: The self-signed certificate.

2. **Install the Certificate in Your Browser:**

    - Open your browser and navigate to the certificate management section. This is typically found under settings or preferences.
    - Look for an option to manage certificates or security settings.
    - Import the `localhost.crt` file into the trusted root certificate authorities store.

    For example, in Google Chrome:
    - Go to `Settings` > `Privacy and security` > `Security` > `Manage certificates`.
    - Select the `Trusted Root Certification Authorities` tab.
    - Click `Import` and follow the prompts to import the `localhost.crt` file.

    After completing these steps, your browser will trust the self-signed certificate for `localhost`.

3. **Verify the Installation:**

    - Restart your browser.
    - Navigate to `https://localhost:4200` to verify that the certificate is recognized and trusted.

By following these instructions, you will have a self-signed SSL certificate installed and trusted in your browser for local development purposes.