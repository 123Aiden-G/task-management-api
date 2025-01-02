# Task Management API

This project is a Task Management API built using **Node.js** and **Express**, with **MongoDB** as the database. It allows users to create, read, update, and delete tasks and includes user authentication and task management features.

## Project Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/123Aiden-G/task-management-api.git
    ```
2. Navigate to the project directory:
    ```bash
    cd task-management-api
    ```
3. Install the dependencies:
    ```bash
    npm install
    ```

### Configuration

1. Create a `.env` file in the root directory and add the following environment variables:
    ```env
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```

## Usage

### Running the Server

To start the server, run:
```bash
npm start
```
The server will start on the port specified in the `.env` file (default is 3000).

### API Endpoints

- `GET /api/tasks` - Retrieve all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Retrieve a task by ID
- `PUT /api/tasks/:id` - Update a task by ID
- `DELETE /api/tasks/:id` - Delete a task by ID

### Example Requests

- **Get all tasks:**
    ```bash
    curl -X GET https://task-management-api-ypwj.onrender.com/api/tasks
    ```

- **Create a new task:**
    ```bash
    curl -X POST https://task-management-api-ypwj.onrender.com/api/tasks -H "Content-Type: application/json" -d '{"title": "New Task", "description": "Task description"}'
    ```

- **Get a task by ID:**
    ```bash
    curl -X GET https://task-management-api-ypwj.onrender.com/api/tasks/1
    ```

- **Update a task by ID:**
    ```bash
    curl -X PUT https://task-management-api-ypwj.onrender.com/api/tasks/1 -H "Content-Type: application/json" -d '{"title": "Updated Task", "description": "Updated description"}'
    ```

- **Delete a task by ID:**
    ```bash
    curl -X DELETE https://task-management-api-ypwj.onrender.com/api/tasks/1
    ```

## Postman Collection

### Importing the Collection

To make it easier to test the API, a Postman collection is provided. Follow these steps to import the collection:

1. Open Postman.
2. Click on the "Import" button in the top left corner.
3. Select the `postman` folder and choose the `task-management-api.postman_collection.json` file.
4. Click "Open" to import the collection.

### auth EndPoints

This folder contains endpoints related to user authentication and profile management.

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in an existing user
- `DELETE /api/auth/me` - Delete the authenticated user's account
- `PUT /api/auth/recover` - Recover the authenticated user's account
- `PUT /api/auth/me` - Update the authenticated user's profile

### task EndPoints

This folder contains endpoints related to task management.

- `GET /api/tasks` - Retrieve all tasks with optional filters, pagination, and sorting
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:taskId` - Update an existing task
- `DELETE /api/tasks/:taskId` - Permanently delete a task
- `POST /api/tasks/:taskId/comments` - Add a comment to a task
- `PUT /api/tasks/:taskId/assign` - Assign a task to another user

## License

This project is licensed under the MIT License.
