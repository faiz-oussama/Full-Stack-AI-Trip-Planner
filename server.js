import { GoogleGenerativeAI } from "@google/generative-ai";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI("AIzaSyBAfh5HVRuUehApbjOltLKVwFULDOC2QLA");

app.post("/generate-trip", async (req, res) => {
    try {
        const { destination, travelers, dates, budget, transportation, accommodation, activities } = req.body;
        
        const prompt = `Generate a comprehensive travel plan for ${destination}, Morocco for ${dates.duration} days and ${dates.duration - 1} nights.

        Requirements:
       "tripDetails": {
            "destination": "${destination}",
            "duration": {
            "days": ${dates.duration},
            "nights": ${dates.duration - 1}
            },
            "dates": {
            "start": "${dates.startDate}",
            "end": "${dates.endDate}"
            },
            "travelers": {
            "count": ${travelers.count},
            "type": "${travelers.label}"
            },
            "budget": {
            "level": "${budget.level}",
            "currency": "MAD"
            }

        Please provide a detailed plan in JSON format with the following structure:
        "transportation": {
                "selectedModes": ${JSON.stringify(transportation.modes)},
                "flights": [
                {
                    "airline": "",
                    "departure": "",
                    "arrival": "",
                    "price": "",
                    "bookingUrl": ""
                }
                ]
            },
            "accommodation": {
                "hotels": [
                {
                    "name": "",
                    "rating": 0,
                    "address": "",
                    "photoUrl": "",
                    "coordinates": {
                    "latitude": 0,
                    "longitude": 0
                    },
                    "description": "",
                    "priceRange": "",
                    "nearbyAttractions": [
                    {
                        "name": "",
                        "distance": "",
                        "description": ""
                    }
                    ]
                }
                ]
            },
            "attractions": [
                {
                "name": "",
                "details": "",
                "imageUrl": "",
                "coordinates": {
                    "latitude": 0,
                    "longitude": 0
                },
                "ticketPrice": "",
                "visitDuration": "",
                "openingHours": ""
                }
            ],
            "dailyPlan": [
                {
                "day": 1,
                "activities": [
                    {
                    "time": "",
                    "activity": "",
                    "location": "",
                    "transport": "",
                    "cost": ""
                    }
                ],
                "meals": [
                    {
                    "type": "",
                    "venue": "",
                    "cuisine": "",
                    "estimatedCost": ""
                    }
                ]
                }
            ],
            "bestTimeToVisit": {
                "season": "",
                "months": [],
                "weather": "",
                "crowdLevel": ""
            }
            }

        Include for each hotel option:
        - Hotel name, address, price range, image URL
        - Geo coordinates (latitude, longitude)
        - Rating and description
        - Nearby attractions

        For each attraction/place:
        - Place name and detailed description
        - Image URL and geo coordinates
        - Ticket prices and visiting hours
        - Recommended time to spend
        
        For daily plan:
        - Detailed itinerary with timing
        - Distance between locations
        - Transport options
        - Meal recommendations
        - Estimated costs

        Return ONLY a valid JSON string without any additional text or formatting. just a directly response with a JSON object.`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        let rawResponse = result.response.text();
        rawResponse = rawResponse.replace(/```json\n|\n```/g, '').trim();
        // Parse the raw response to ensure it's valid JSON
        const tripPlan = JSON.parse(rawResponse);

        res.json({
            success: true,
            data: tripPlan,
            message: "Trip plan generated successfully"
        });

    } catch (error) {
        console.error("Error generating trip:", error);
        res.status(500).json({ 
            success: false,
            error: "Failed to generate trip",
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
