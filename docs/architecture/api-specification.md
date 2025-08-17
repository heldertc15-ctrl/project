# API Specification

YAML

openapi: 3.0.0
info:
 title: "AI Soccer Betting Advisor API"
 version: "1.0.0"
 description: "API for generating AI-powered soccer match betting predictions."
servers:
 - url: "http://localhost:8000"
 description: "Local Development Server"
paths:
 /matches:
 get:
 summary: "Get Upcoming Soccer Matches"
 responses:
 '200':
 description: "A list of available soccer matches."
 content:
 application/json:
 schema:
 type: array
 items:
 $ref: '#/components/schemas/Match'
 /predict:
 post:
 summary: "Generate a Betting Prediction"
 requestBody:
 required: true
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/PredictionRequest'
 responses:
 '200':
 description: "The AI-generated prediction result."
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/PredictionResult'
components:
 schemas:
 Match:
 type: object
 properties:
 id: { type: string }
 homeTeam: { type: string }
 awayTeam: { type: string }
 startTime: { type: string, format: date-time }
 PredictionRequest:
 type: object
 properties:
 matchId: { type: string }
 riskLevel: { type: string, enum: [Low, Medium, High] }
 PredictionResult:
 type: object
 properties:
 betSuggestion: { type: string }
 rationale: { type: string }
 riskLevel: { type: string, enum: [Low, Medium, High] }