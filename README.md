# Campus Lost & Found Management System

A beginner-friendly full-stack web application for reporting lost or found items on a campus. The project uses HTML, CSS, JavaScript, Node.js, Express.js, and a MySQL database.

## Overview

This system lets students:

- Report lost items
- Report found items
- Search and browse lost/found records
- View item details
- Submit claim requests for found items
- Track their own reports and claims

Admins can:

- Review users and submissions
- Approve or reject claims
- Mark items as returned/resolved
- Delete inappropriate posts
- View basic analytics

## Technology Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js + Express.js
- Database: MySQL
- Auth: JWT + bcrypt
- Charts: Chart.js CDN

## Folder Structure

```text
lost-found-campus/
├── frontend/
│   ├── css/
│   ├── js/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── report-lost.html
│   ├── report-found.html
│   ├── lost-items.html
│   ├── found-items.html
│   ├── item-details.html
│   ├── my-reports.html
│   ├── my-claims.html
│   └── admin.html
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── db.js
│   ├── package.json
│   ├── server.js
│   └── .env
├── database/
│   └── schema.sql
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── .env
```

## Database Setup

1. Install MySQL.
2. Create a database named `campus_lost_found`.
3. Run the schema file:

```bash
mysql -u root -p < database/schema.sql
```

If you are using MySQL Workbench or phpMyAdmin, open the schema file and run the SQL commands there.

## Environment Variables

Create a `.env` file in the project root using `.env.example` as a guide:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=campus_lost_found
DB_PORT=3306
JWT_SECRET=change_this_super_secret_key
FRONTEND_URL=http://localhost:3000
```

Important:

- Never commit `.env` to GitHub.
- Use a real secret key in production.

## Installation

From the project root:

```bash
npm install
npm install --prefix backend
```

## Run Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

## Run Frontend

Open the static HTML files in the `frontend/` folder with VS Code Live Server or any local static file server.

If you want a simple local server for the frontend, you can run:

```bash
cd frontend
python -m http.server 3000
```

Then open:

```text
http://localhost:3000/index.html
```

## API Endpoints

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Items

- `POST /api/items/lost`
- `POST /api/items/found`
- `GET /api/items/lost`
- `GET /api/items/found`
- `GET /api/items/my`
- `GET /api/items/:id`
- `PUT /api/items/:id`
- `DELETE /api/items/:id`

### Claims

- `POST /api/claims`
- `GET /api/claims/my`
- `GET /api/claims/:id`

### Admin

- `GET /api/admin/users`
- `GET /api/admin/items`
- `GET /api/admin/claims`
- `PUT /api/admin/claims/:id/approve`
- `PUT /api/admin/claims/:id/reject`
- `PUT /api/admin/items/:id/resolve`
- `DELETE /api/admin/items/:id`

### Analytics

- `GET /api/analytics/summary`
- `GET /api/analytics/categories`
- `GET /api/analytics/locations`
- `GET /api/analytics/monthly`

## Authentication Flow

1. User registers with name, ID, email, phone, and password.
2. Password is hashed with bcrypt.
3. User logs in.
4. Backend returns a JWT token.
5. Frontend stores the token in localStorage.
6. Each protected API call includes the token in the Authorization header.
7. Backend verifies the token using `authMiddleware`.

## How the Project Works

User submits form
↓
JavaScript reads the form values
↓
fetch() sends the request to the backend
↓
Express route receives the request
↓
Controller validates the data
↓
SQL query inserts or reads data
↓
Database stores the information
↓
Backend responds with JSON
↓
Frontend updates the page

## Admin Creation

Do not hard-code admin credentials in the frontend. Create the first admin in the database using a hashed password.

First generate a bcrypt hash:

```bash
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('Admin123', 10));"
```

Then insert the admin user into MySQL:

```sql
INSERT INTO users (full_name, student_id, email, phone, password, role)
VALUES ('Admin User', 'ADMIN001', 'admin@campus.edu', '9999999999', '$2b$10$YOUR_HASH_HERE', 'admin');
```

Replace the hash with the generated one.

## Frontend API URL

In `frontend/js/config.js` update the API URL when the backend is deployed:

```js
window.APP_CONFIG = {
  API_URL: 'https://your-backend-domain.vercel.app/api'
};
```

For local development, this stays as:

```js
window.APP_CONFIG = {
  API_URL: 'http://localhost:5000/api'
};
```

## Deployment on Vercel

### Option A: Frontend and backend in separate Vercel apps

- Deploy the frontend to Vercel as a static site.
- Deploy the backend to Vercel as a Node.js app.
- Use a cloud MySQL database like PlanetScale, Railway, Clever Cloud, or a managed MySQL instance.
- Set the environment variables in Vercel for the backend.
- Update `API_URL` in the frontend config to the deployed backend URL.

### Option B: Keep frontend static and backend separately

This project is set up for a simple frontend + backend split, which is beginner-friendly and reliable.

## Vercel Notes

- Do not use `localhost` in production.
- Use environment variables instead of hard-coded credentials.
- Use a real MySQL database in production.

## Future Improvements

- Add proper image uploads
- Add email notifications
- Add real admin moderation tools
- Add password reset flow
- Add item comments and status history
- Add role-based UI improvements

## Common Errors and Solutions

### Error: Cannot connect to MySQL

- Check if MySQL is running.
- Verify `.env` variables.
- Ensure the database exists.

### Error: JWT unauthorized

- Make sure the user logged in successfully.
- Check that the token is included in the Authorization header.
- Ensure the JWT secret matches the `.env` value.

### Error: CORS blocked

- Confirm CORS is enabled in the backend.
- Check that the frontend points to the correct backend URL.

### Error: `Table doesn't exist`

- Run `database/schema.sql` again.
- Make sure the database name in `.env` matches the one used in MySQL.

## Git Commands

Initialize and connect a Git repository:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```

## Complete Flow Example

A student loses a phone:

1. Student logs in.
2. Fills out the report lost form.
3. Frontend sends data to `/api/items/lost`.
4. Express route receives the request.
5. Controller validates the request.
6. SQL insert stores the item.
7. User sees a success message and redirects to their reports.

Another student finds the phone:

1. They report the found item.
2. A different student reviews the found item.
3. They submit a claim.
4. Admin reviews and approves or rejects the claim.
5. The item status updates to claimed or returned.

## Final Architecture

```text
Student
↓
Frontend (HTML + CSS + JavaScript)
↓
fetch()
↓
Node.js + Express
↓
REST API
↓
SQL Database

Admin
↓
Admin Dashboard
↓
Express API
↓
SQL Database
↓
Analytics
```
