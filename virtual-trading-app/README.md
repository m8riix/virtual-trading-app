\# Virtual Trading Platform



A production-grade virtual trading web application built with React.js and Node.js, featuring real-time stock data from NSE and BSE exchanges.



\## Features



\- \*\*User Authentication\*\*: Email/password and Google OAuth

\- \*\*Real-time Market Data\*\*: Live stock prices from Yahoo Finance API

\- \*\*Portfolio Management\*\*: Track investments and P\&L

\- \*\*Order Management\*\*: Buy/sell stocks with virtual money

\- \*\*Watchlist\*\*: Monitor favorite stocks

\- \*\*Professional UI\*\*: Clean, minimal, and responsive design



\## Tech Stack



\*\*Frontend:\*\*

\- React.js 18

\- Tailwind CSS

\- React Router

\- Axios

\- Recharts

\- React Hot Toast



\*\*Backend:\*\*

\- Node.js

\- Express.js

\- MongoDB with Mongoose

\- JWT Authentication

\- Passport.js (Google OAuth)

\- bcryptjs for password hashing



\## Installation



\### Prerequisites

\- Node.js (v14 or higher)

\- MongoDB

\- Google OAuth credentials



\### Backend Setup



1\. Navigate to server directory:

cd server

npm install





2\. Create `.env` file with required variables:

PORT=5000

MONGODB\_URI=mongodb://localhost:27017/virtual-trading

JWT\_SECRET=your\_jwt\_secret\_key\_here

GOOGLE\_CLIENT\_ID=your\_google\_client\_id

GOOGLE\_CLIENT\_SECRET=your\_google\_client\_secret





3\. Start the server:

npm run dev





\### Frontend Setup



1\. Navigate to client directory:

cd client

npm install





2\. Start the development server:

npm start





\## Configuration



\### Google OAuth Setup

1\. Go to \[Google Cloud Console](https://console.cloud.google.com/)

2\. Create a new project or select existing

3\. Enable Google+ API

4\. Create OAuth 2.0 credentials

5\. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`



\### MongoDB Setup

\- Install MongoDB locally or use MongoDB Atlas

\- Create a database named `virtual-trading`

\- Update connection string in `.env`



\## API Endpoints



\### Authentication

\- `POST /api/auth/register` - User registration

\- `POST /api/auth/login` - User login  

\- `GET /api/auth/google` - Google OAuth

\- `GET /api/auth/me` - Get current user



\### Stocks

\- `GET /api/stocks/market-overview` - Get market data

\- `GET /api/stocks/search?q=query` - Search stocks

\- `GET /api/stocks/details/:symbol` - Get stock details



\### Portfolio

\- `GET /api/portfolio` - Get user portfolio



\### Orders

\- `POST /api/orders` - Place order

\- `GET /api/orders` - Get user orders



\### Watchlist

\- `GET /api/watchlist` - Get watchlist

\- `POST /api/watchlist` - Add to watchlist

\- `DELETE /api/watchlist/:symbol` - Remove from watchlist



\## Deployment



\### Production Build



cd client

npm run build





\### Environment Variables for Production

\- Set `NODE\_ENV=production`

\- Update CORS origins

\- Configure MongoDB Atlas

\- Set up proper JWT secrets



\## Contributing



1\. Fork the repository

2\. Create feature branch (`git checkout -b feature/amazing-feature`)

3\. Commit changes (`git commit -m 'Add amazing feature'`)

4\. Push to branch (`git push origin feature/amazing-feature`)

5\. Open a Pull Request



\## License



This project is licensed under the MIT License.

