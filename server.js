import { GoogleGenerativeAI } from "@google/generative-ai";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { fetchPlacePhoto } from "./src/utils/fetchPlacePhoto.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI("AIzaSyBAfh5HVRuUehApbjOltLKVwFULDOC2QLA");

function sanitizeJSONString(str) {
    return str
        .replace(/'/g, '"')
        .replace(/(?:\r\n|\r|\n)/g, '') 
        .replace(/,\s*([\]}])/g, '$1')
        .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
        .replace(/:\s*'([^']*?)'/g, ':"$1"')
        .replace(/\\/g, '\\\\')
        .replace(/"\s+/g, '"')
        .replace(/\s+"/g, '"');
}

function parseAndValidateJSON(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (firstError) {
        console.log("Initial JSON parse failed, attempting cleanup...");
        try {
            const sanitized = sanitizeJSONString(jsonString);
            return JSON.parse(sanitized);
        } catch (secondError) {
            throw new Error(`JSON Parse Error: ${secondError.message}\nPosition: ${secondError.position}`);
        }
    }
}

app.post("/generate-trip", async (req, res) => {
    try {
        const { origin, destination, travelers, dates, budget, transportation, accommodation, activities } = req.body;
        
        const prompt = `Generate a comprehensive travel plan from ${origin} to ${destination}, Morocco for ${dates.duration} days and ${dates.duration - 1} nights.

        Requirements:
       "tripDetails": {
            "origin": "${origin}",
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
        
        Also include the flight details for each flight option from the origin to the destination.

        Please provide a detailed plan in JSON format with the following structure:
        "transportation": {
                "selectedModes": ${JSON.stringify(transportation.modes)},
                "flights": [{
                "airline": "",
                "departure": "",
                "arrival": "",
                "price": "",
                "bookingUrl": ""
                }]
            },
            "accommodation": {
                "hotels": [{
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
                "nearbyAttractions": [{
                    "name": "",
                    "distance": "",
                    "description": "",
                    "photoUrl": ""
                }]
                }]
            },
            "attractions": [{
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
            }],
            "dailyPlan": [{
                "day": 1,
                    "activities": [{
                        "time": "",
                        "activity": "",
                        "location": "",
                        "transport": "",
                        "cost": ""
                        }],
                    "meals": [{
                        "restaurant": "",
                        "mealType": "",
                        "location": "",
                        "time": "",
                        "rating": 4.5,
                        "cuisineType": [],
                        "recommendedDishes": [],
                        "priceRange": "",
                        "imageUrl": "" (keep it empty, not required)
                    }]
            }],
            "bestTimeToVisit": {
                "season": "",
                "months": [],
                "weather": "",
                "crowdLevel": ""
            }
            }

        Include for each hotel option:
        - Restaurant name, address, price range
        - Geo coordinates (latitude, longitude)
        - Rating and description
        - Nearby attractions

         Include for each meal all the details for each option:
        - Hotel name, address, price range
        - Geo coordinates (latitude, longitude)
        - keep the imageUrl empty
        - Rating and description
        - Nearby attractions

        For each attraction/place:
        - Place name and detailed description
        - geo coordinates
        - Ticket prices and visiting hours
        - Recommended time to spend
        
        For daily plan:
        - Detailed itinerary with timing
        - Distance between locations
        - Transport options
        - Meal recommendations
        - Estimated costs        

        Return ONLY a valid JSON string without any additional text or formatting . just a directly response with a JSON object.`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        let rawResponse = result.response.text();

        rawResponse = rawResponse
            .replace(/```json\n|\n```/g, '')
            .trim();

        console.log("Raw response length:", rawResponse.length);
        
        const tripPlan = parseAndValidateJSON(rawResponse);

        if (!tripPlan || typeof tripPlan !== 'object') {
            throw new Error('Invalid trip plan structure');
        }

        const requiredProperties = ['tripDetails', 'accommodation', 'attractions', 'dailyPlan'];
        for (const prop of requiredProperties) {
            if (!tripPlan[prop]) {
                throw new Error(`Missing required property: ${prop}`);
            }
        }

        await Promise.all([
            ...tripPlan.dailyPlan.flatMap(day =>
                day.meals.map(async (meal) => {
                    const photoUrl = await fetchPlacePhoto(meal.restaurant, destination);
                    if (photoUrl) {
                        meal.imageUrl = photoUrl;
                    }
                })
            ),
            ...tripPlan.accommodation.hotels.map(async (hotel) => {
                const photoUrl = await fetchPlacePhoto(hotel.name, destination);
                if (photoUrl) {
                    hotel.photoUrl = photoUrl;
                }
            }),
            ...tripPlan.attractions.map(async (attraction) => {
                const photoUrl = await fetchPlacePhoto(attraction.name, destination);
                if (photoUrl) {
                    attraction.imageUrl = photoUrl;
                }
            })
        ]);

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
            raw: error.toString(),
            timestamp: new Date().toISOString()
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
