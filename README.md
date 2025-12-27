# Online Marketplace - MERN Stack

A full-stack online marketplace built with MongoDB, Express.js, React.js, and Node.js.

## Features

- **User Authentication**: Register/Login for buyers and sellers
- **Product Management**: Sellers can add, edit, delete products
- **Shopping Cart**: Add products to cart and checkout
- **Order Management**: Track orders and purchase history
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
├── backend/          # Node.js/Express API
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── middleware/   # Authentication middleware
│   └── server.js     # Main server file
├── frontend/         # React.js application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   └── services/    # API services
│   └── public/
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with your MongoDB connection:
   ```
   MONGODB_URI=mongodb://localhost:27017/marketplace
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React app:
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Deployment Options

### 1. Heroku (Backend)
1. Create Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git or GitHub integration

### 2. Netlify (Frontend)
1. Build the React app: `npm run build`
2. Deploy the `build` folder to Netlify
3. Set environment variable: `REACT_APP_API_URL=your_backend_url`

### 3. Vercel (Full Stack)
1. Deploy both frontend and backend to Vercel
2. Configure environment variables
3. Set up MongoDB Atlas for database

### 4. Railway/Render
- Alternative platforms for easy deployment
- Support both frontend and backend hosting

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (sellers only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID

## Usage

1. **Register** as a buyer or seller
2. **Browse products** on the home page
3. **Add products to cart** and checkout
4. **Sellers** can manage products in the dashboard
5. **Track orders** in the user dashboard

## Technologies Used

- **Frontend**: React.js, React Router, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: CSS3 with responsive design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request