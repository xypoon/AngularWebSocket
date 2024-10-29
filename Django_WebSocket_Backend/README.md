# Django WebSocket Project

## Installation

1. **Navigate to your project directory:**
    ```bash
    cd /c:/Project/AngularWebSocket/Django_WebSocket_Backend
    ```

2. **Install Requirements to run Django Project:**
    ```bash
    pip install -r requirements.txt
    ```

## Run Migrations

Before running your Django application, you need to apply the database migrations to set up your database schema. Follow these steps:

1. **Navigate to your project directory:**
    ```bash
    cd /c:/Project/AngularWebSocket/Django_WebSocket_Backend/django_websocket_project
    ```

2. **Make migrations:**  
   This command creates migration files based on the changes you have made to your models.
    ```bash
    python manage.py makemigrations
    ```

3. **Apply migrations:**  
   This command applies the migrations to your database.
    ```bash
    python manage.py migrate
    ```

4. **Seed Database:**
    Seed the database with the following command.
    ```bash
    python manage.py seed_database
    ```

4. **(Optional) Check migration status:**  
   You can check the status of your migrations to see which ones have been applied.
    ```bash
    python manage.py showmigrations
    ```

## Creating a Django User Account

1. **Navigate to your project directory:**
    ```bash
    cd /c:/Project/AngularWebSocket/Django_WebSocket_Backend/django_websocket_project
    ```

2. **Run the Django development server:**
    ```bash
    python manage.py runserver
    ```

3. **Open your web browser and go to:**
    ```
    http://127.0.0.1:8000/admin/
    ```

4. **Create a superuser account:**
    ```bash
    python manage.py createsuperuser
    ```
    Follow the prompts to set up your username, email, and password.

## Starting the App

1. **Ensure you are in your project directory:**
    ```bash
    cd /c:/Project/AngularWebSocket/Django_WebSocket_Backend/django_websocket_project
    ```

2. **Run the Django development server:**
    ```bash
    python manage.py runserver
    ```

3. **Access the application in your web browser:**
    ```
    http://127.0.0.1:8000/
    ```

That's it! Your Django WebSocket application should now be up and running.

