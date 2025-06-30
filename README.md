

README:
• Setup and Usage Instructions:

a) Installation:

– Clone the repository.

– Install dependencies by running:

npm install

b) Running the App:

– In development mode:

npm run dev

– The dashboard should be accessible at localhost:3000.

c) Configuration:

– Include environment variables for financial data fetching (if needed).

– Provide guidance on where to add or configure API keys or unofficial libraries if required.

d) Troubleshooting:

– Common issues with scraping or rate limiting.

– Potential fallback strategies.

Technical Document:
A concise write-up highlighting:

• Key Challenges:

– Unofficial finance APIs and the need for scraping/rate-limit handling.

– Ensuring real-time table updates and color-coded gain/loss indicators.

– Data accuracy and error handling for both front-end and back-end.

• Solutions Implemented:

– Use of Next.js caching or memoization to handle high load and reduce repeated API calls.

– An interval-based update system (e.g., every 15 seconds) for live data fetch.

– A robust data model to store and group data by sector.

– React hooks and asynchronous functions for parallel API requests and dynamic rendering.

• Known Limitations and Future Enhancements:

– Potential breakage due to changes in Google/Yahoo pages.

– Additional caching strategies or use of a dedicated financial data service to improve reliability.

– Possible integration of WebSockets for more efficient real-time updates.