import { GoogleGenerativeAI } from "@google/generative-ai";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from 'mongoose';
import { deleteTrip, getTripsByUser, saveTrip } from './src/saved-trips/TripService.js';
import { fetchPlacePhoto } from "./src/utils/fetchPlacePhoto.js";
import placeRoutes from "./src/utils/placeRoutes.js";
dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI("AIzaSyBAfh5HVRuUehApbjOltLKVwFULDOC2QLA");

app.use('/api', placeRoutes);

mongoose.connect("mongodb+srv://faizouss123:k7jsNQm3B9kpST8F@cluster0.ypapm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(() => {
    console.log("connected")
})
.catch((err) => {
    console.log("failed", err)
})
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
            },
            "transportation" : {
            "modes" : "${transportation.modes}",
            "routePreference" : "${transportation.routePreference}",
            },
            "accommodation" : {
            "type" : "${accommodation.type}",
            "rating" : "${accommodation.rating}",
            "desired amenities" : "${accommodation.amenities}"
            },
            "activities" : {
            "interests" : "${activities.interests}",
            "pace" : "${activities.pace}",
            "schedule" : "${activities.schedule.specialRequirements}"
            }
        
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
                         "activity location coordinates": {
                          "latitude": 0,
                          "longitude": 0
                          },
                        "transport": "",
                        "cost": ""
                        }],
                    "meals": [{
                        "restaurant": "",
                         "coordinates of restaurant": {
                          "latitude": 0,
                          "longitude": 0
                          },
                        "mealType": "",
                        "location": "",
                        "time": "",
                        "rating": 4.5,
                        "cuisineType": [],
                        "recommendedDishes": [],
                        "priceRange": "",
                        "imageUrl": "" (keep it empty, not required)
                    }],
                    "description": "",
                    "date": "",
                    "weather": ""
            }],
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

        in the tripDetails dont forget to mention the origin of the trip
        Return ONLY a valid JSON string without any additional text or formatting . just a directly response with a JSON object. And stick to the requirements i mentioned, dont forget the  "coordinates": {
                "latitude": ,
                "longitude": 
                } for each location, restaurant or activity mentioned.`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        let rawResponse = result.response.text();

        rawResponse = rawResponse
            .replace(/```json\n|\n```/g, '')
            .trim();
        
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






app.post("/save-trip", async (req, res) => {
    try {
      const { tripData, userId, email } = req.body;
      
      if (!tripData || !userId || !email) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: tripData, userId, and email are required" 
        });
      }
      
      const tripId = await saveTrip(tripData, userId, email);
      
      res.json({
        success: true,
        data: { tripId },
        message: "Trip saved successfully"
      });
    } catch (error) {
      console.error("Error saving trip:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to save trip",
        details: error.message
      });
    }
  });
  
  // Get user trips
  app.get("/user-trips/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const trips = await getTripsByUser(userId);
      
      res.json({
        success: true,
        data: trips,
        message: "Trips retrieved successfully"
      });
    } catch (error) {
      console.error("Error retrieving trips:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to retrieve trips",
        details: error.message
      });
    }
  });

  // Delete trip
app.delete("/trip/:tripId", async (req, res) => {
    try {
      const { tripId } = req.params;
      const success = await deleteTrip(tripId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: "Trip not found or not deleted"
        });
      }
      
      res.json({
        success: true,
        message: "Trip deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting trip:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to delete trip",
        details: error.message
      });
    }
  });












const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

