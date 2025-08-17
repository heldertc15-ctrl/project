# Unified Project Structure

Plaintext

ai-soccer-advisor/
├── apps/
│ ├── frontend/
│ │ ├── public/
│ │ ├── src/
│ │ │ ├── components/
│ │ │ ├── features/
│ │ │ │ └── prediction/
│ │ │ ├── services/
│ │ │ └── App.tsx
│ │ └── package.json
│ └── backend/
│ ├── app/
│ │ ├── api/
│ │ ├── services/
│ │ └── main.py
│ └── requirements.txt
├── package.json # Root package.json with workspaces
└── README.md