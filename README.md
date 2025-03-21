# NCAA Bracket Challenge

A real-time NCAA basketball tournament bracket visualization with multiple animation styles and live score updates.

## Features

- Interactive bracket visualization with teams, seeds, and scores
- Live score updates via Sportradar API
- Multiple animation styles (3D Parallax, Neon Slide, Data Scan)
- AI predictions from various models
- Responsive design for mobile and desktop

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Sportradar NCAA Basketball API

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_USE_MOCK_DATA=false
   SPORTRADAR_API_KEY="your_api_key_here"
   ```
4. Get an API key from [Sportradar Developer Portal](https://developer.sportradar.com/)
5. Run the development server:
   ```
   npm run dev
   ```

## API Integration

This application uses the Sportradar NCAA Men's Basketball API. Key features:

- Rate limiting to prevent 429 errors
- In-memory caching to reduce API calls
- Smart scheduling to only fetch data for active games
- Local storage for completed game results

### API Configuration

To use the Sportradar API:

1. Create an account at [Sportradar Developer Portal](https://developer.sportradar.com/)
2. Subscribe to the NCAA Men's Basketball API (trial tier is fine for testing)
3. Copy your API key to the `.env.local` file
4. Set `NEXT_PUBLIC_USE_MOCK_DATA=false` to use live data

## Deployment Instructions

### Preparation

1. Update `.env.production` with proper settings:
   - Set `NEXT_PUBLIC_USE_MOCK_DATA=false` to use real API data
   - Do not include actual API keys in this file

2. Test the application with production settings:
   ```bash
   npm run build
   npm run start
   ```

3. Make sure that the rate limiting and caching solutions are working properly

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Set the following environment variables in the Vercel dashboard:
   - `SPORTRADAR_API_KEY`: Your Sportradar API key
   - `NEXT_PUBLIC_USE_MOCK_DATA`: Set to "false" for live data
4. Deploy your application

### Deploying to Netlify

1. Push your code to a GitHub repository
2. Connect your repository to Netlify
3. Set the build command to `npm run build`
4. Set the publish directory to `.next`
5. Add the following environment variables:
   - `SPORTRADAR_API_KEY`: Your Sportradar API key
   - `NEXT_PUBLIC_USE_MOCK_DATA`: Set to "false" for live data
6. Deploy your application

### Deploying to AWS Amplify

1. Push your code to a GitHub repository
2. Connect your repository to AWS Amplify
3. Set the build settings according to the Amplify Next.js configuration
4. Add the following environment variables:
   - `SPORTRADAR_API_KEY`: Your Sportradar API key
   - `NEXT_PUBLIC_USE_MOCK_DATA`: Set to "false" for live data
5. Deploy your application

## Production Considerations

### API Usage

- Monitor your API usage to avoid hitting rate limits
- The application includes built-in rate limiting, but you should still monitor usage
- Consider upgrading to a paid Sportradar API plan for production use

### Performance Optimization

- The application uses caching to reduce API calls
- Completed games are stored in localStorage to avoid unnecessary API requests
- Only active games trigger API calls, reducing overall usage

### Error Handling

- The application will fall back to mock data if the API is unavailable
- Check server logs for any API connection issues

## Troubleshooting

- **429 Too Many Requests errors**: The application has built-in rate limiting, but if you still see these errors, you may need to reduce the frequency of API calls or upgrade your Sportradar plan.

- **Date parsing errors**: Check that the date formats in your match data are consistent with the expected formats.

- **API authentication errors**: Verify that your API key is correct and has access to NCAA Men's Basketball data.

## License

MIT 