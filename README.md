# csc480-final-project

## Running the matcher and web app locally

1. **Install Python dependencies** (from project root):
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the backend** (from project root; loads breed data from Google Sheets on first request):
   ```bash
   PYTHONPATH=. python3 server.py
   ```
   The API runs at `http://127.0.0.1:5000` (POST `/api/match`, GET `/api/health`).

3. **Start the web app** (in another terminal):
   ```bash
   cd web-app && npm install && npm run dev
   ```
   Open the URL shown (e.g. `http://localhost:5173`).

4. Complete the quiz and click **Finish**. The app sends your preferences to the backend; the matcher returns ranked breed matches and they appear on the results screen.