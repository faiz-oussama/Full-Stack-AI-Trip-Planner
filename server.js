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

// Replace your existing sanitizeJSONString and parseAndValidateJSON functions with these improved versions

function sanitizeJSONString(str) {
    // Step 1: Remove code blocks if present (```json and ```)
    let cleaned = str.replace(/```json\n|\n```/g, '').trim();
    
    // Step 2: Fix common JSON syntax issues
    cleaned = cleaned
        // Replace single quotes with double quotes
        .replace(/'/g, '"')
        // Remove line breaks
        .replace(/(?:\r\n|\r|\n)/g, ' ')
        // Fix trailing commas in arrays and objects
        .replace(/,\s*([\]}])/g, '$1')
        // Ensure property names are properly quoted
        .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
        // Replace any remaining single quotes around string values
        .replace(/:\s*'([^']*?)'/g, ':"$1"')
        // Normalize excess whitespace
        .replace(/"\s+/g, '"')
        .replace(/\s+"/g, '"')
        // Fix time format in summaryOfDay (e.g., (in 24-hour format !!!!!))
        .replace(/"time": "", \(in 24-hour format !!!!!\)/g, '"time": ""')
        // Fix comment in imageUrl
        .replace(/"imageUrl": "" \(keep it empty, not required\)/g, '"imageUrl": ""');
    
    // Handle problematic apostrophes in addresses and other text
    cleaned = handleApostrophesInStrings(cleaned);
    
    // Step 3: Check for and fix specific parsing issues
    try {
        JSON.parse(cleaned);
        return cleaned; // If it parses correctly, return it
    } catch (error) {
        console.log("Still having JSON issues, applying additional fixes...");
        
        // Get error position to focus on problematic areas
        const position = error.message.match(/position (\d+)/)?.[1];
        
        if (position) {
            const problemArea = cleaned.substring(Math.max(0, parseInt(position) - 50), Math.min(cleaned.length, parseInt(position) + 50));
            console.log(`Problem area around position ${position}: ${problemArea}`);
            
            // Try to fix the specific area around the error
            cleaned = fixProblemArea(cleaned, parseInt(position));
        }
        
        // Apply more aggressive fixes
        cleaned = cleaned
            // Fix any remaining unquoted property names
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
            // Remove any invalid control characters
            .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
            // Ensure all comments are removed (including inline ones)
            .replace(/\/\*.*?\*\//g, '')
            .replace(/\/\/.*/g, '')
            // Fix specifically common patterns in your data
            .replace(/"dailyPlan": \[{\s*"day": 1,/g, '"dailyPlan": [{"day": 1,');
        
        return cleaned;
    }
}

// New helper function to fix apostrophes and quotes in string values
function handleApostrophesInStrings(json) {
    // Start with empty result
    let result = '';
    let inString = false;
    let escapeNext = false;
    let currentStringStart = 0;
    
    // Iterate through each character
    for (let i = 0; i < json.length; i++) {
        const char = json[i];
        
        // Handle escape characters
        if (char === '\\') {
            escapeNext = !escapeNext;
            result += char;
            continue;
        }
        
        // If we encounter a quote that's not escaped
        if (char === '"' && !escapeNext) {
            if (!inString) {
                // Starting a new string
                inString = true;
                currentStringStart = i;
            } else {
                // Ending a string
                inString = false;
            }
            result += char;
        } 
        // If we're in a string and encounter a character that might cause problems
        else if (inString && (char === '"' || char === "'" || char === '`')) {
            // Replace with equivalent HTML entity or escape it
            result += '\\' + char;
        } else {
            result += char;
        }
        
        escapeNext = false;
    }
    
    return result;
}

// New helper function to try fixing a specific problematic area
function fixProblemArea(json, errorPosition) {
    // Look for likely problem patterns near the error position
    const start = Math.max(0, errorPosition - 100);
    const end = Math.min(json.length, errorPosition + 100);
    const problemSegment = json.substring(start, end);
    
    // Common patterns that cause issues
    const fixedSegment = problemSegment
        // Fix quotes within address strings like "Avenue d'Alger" or "Avenue d"Alger"
        .replace(/(\w)"(\w)/g, '$1\\"$2')
        // Fix other common patterns as needed
        .replace(/(\d+)"/g, '$1\\"') // Fix cases like 10" (ten inches) 
        .replace(/"(\w+)'(\w+)"/g, '"$1\\\'$2"'); // Fix apostrophes in words
    
    // Replace the problem segment in the full string
    return json.substring(0, start) + fixedSegment + json.substring(end);
}

function parseAndValidateJSON(jsonString) {
    console.log("Attempting to parse JSON...");
    
    try {
        // First try parsing the raw string
        return JSON.parse(jsonString);
    } catch (firstError) {
        console.log("Initial JSON parse failed, attempting cleanup...");
        
        // Try with our improved sanitizer
        try {
            const sanitized = sanitizeJSONString(jsonString);
            return JSON.parse(sanitized);
        } catch (secondError) {
            // If we still can't parse it, try one more aggressive approach
            console.log("Second parse attempt failed, trying more aggressive cleaning...");
            
            try {
                // Use a regex to extract what looks like JSON
                const jsonRegex = /\{[\s\S]*\}/;
                const match = jsonString.match(jsonRegex);
                
                if (match) {
                    const extracted = match[0];
                    const sanitized = sanitizeJSONString(extracted);
                    return JSON.parse(sanitized);
                }
                
                throw new Error("Could not extract valid JSON structure");
            } catch (thirdError) {
                // Log detailed information about the parse failure
                console.error("JSON parsing failed after multiple attempts");
                console.error("Original string sample:", jsonString.substring(0, 100) + "...");
                
                // Throw a more informative error
                throw new Error(`JSON Parse Error: ${secondError.message}\nFailed to parse response from Gemini API`);
            }
        }
    }
}

// Add this function to preprocess the API response

function preprocessGeminiResponse(response) {
    // Step 1: Extract just the JSON object part if there's any surrounding text
    const jsonMatch = response.match(/(\{[\s\S]*\})/);
    const jsonCandidate = jsonMatch ? jsonMatch[1] : response;
    
    // Step 2: Fix specific patterns that cause parsing problems
    let processedJson = jsonCandidate
        // Fix double quotes in addresses and place names
        .replace(/(\w)"(\w)/g, '$1\'$2')
        // Fix quotes within URLs
        .replace(/"(https?:\/\/[^"]*?)"/g, function(match, url) {
            return '"' + url.replace(/"/g, '%22') + '"';
        })
        // Fix inline comments in JSON
        .replace(/"([^"]+)" \(([^)]+)\)/g, '"$1"')
        // Fix issues with time formats
        .replace(/"time": "([^"]+)" \([^)]+\)/g, '"time": "$1"');
    
    // Step 3: Look for specific problematic patterns
    const knownProblems = [
        { pattern: /"address":"([^"]*?)"([^"]*?)"/g, replacement: '"address":"$1\'$2"' },
        { pattern: /"photoUrl":"([^"]*?)"([^"]*?)"/g, replacement: '"photoUrl":"$1%22$2"' },
        { pattern: /"(\d\d:\d\d)"/g, replacement: '"$1"' }
    ];
    
    for (const { pattern, replacement } of knownProblems) {
        processedJson = processedJson.replace(pattern, replacement);
    }
    
    return processedJson;
}

// Update your route handler to use the new preprocessing

app.post("/generate-trip", async (req, res) => {
    let rawResponse = null;
    
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
            "specialRequirements" : "${activities.schedule.specialRequirements}"
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
                        "time": "", (in 24-hour format !!!!!),
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
                    "weather": "",
                    "summaryOfDay": {
                      "08:00": {activity: "Breakfast at hotel restaurant", location: {latitude: 0, longitude: 0}},
                  },

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
        - for the summaryOfDay, (include everything about the day (activities, meals, etc) ranked in order of time) BUT if the place stays the same consecutively dont repeat it, it always should be a different place in between two places because i wanna plot the activities on the map, i gave an example of the format, you should change it to fit the trip plan
        - Dont mention the departure from the origin city, just start from the check-in at the hotel
        - Detailed itinerary with timing in 24-hour format
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
        rawResponse = result.response.text();

        // Add these debug lines
        console.log("Raw response first 200 chars:", rawResponse.substring(0, 200));
        console.log("Raw response length:", rawResponse.length);

        // Preprocess and clean the response
        rawResponse = preprocessGeminiResponse(
            rawResponse.replace(/```json\n|\n```|```/g, '').trim()
        );
        
        // Try to parse the JSON
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
        
        // Prepare a more helpful error response
        let errorDetails = error.message;
        let errorResponse = {
            success: false,
            error: "Failed to generate trip",
            details: errorDetails
        };
        
        // If we have the raw response, include a sample to help debugging
        if (typeof rawResponse === 'string') {
            errorResponse.responseSample = rawResponse.substring(0, 300) + '...';
            
            // Try to save the problematic response for debugging
            try {
                const fs = require('fs');
                fs.writeFileSync('error_response.json', rawResponse);
                console.log('Wrote error response to error_response.json');
            } catch (fsError) {
                console.log('Could not save error response:', fsError);
            }
        }
        
        res.status(500).json(errorResponse);
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

