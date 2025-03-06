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
        const { 
            destination, 
            travelers, 
            dates, 
            budget, 
            transportation, 
            accommodation, 
            activities 
        } = req.body;
        
        const prompt = `Create a detailed ${dates.duration}-day trip itinerary for ${destination}, Morocco.
        
        Group Size: ${travelers.label}
        Dates: ${dates.startDate} to ${dates.endDate}
        
        Budget Level: ${budget.level}
        Budget Allocation:
        - Transportation: ${budget.allocations.transportation}%
        - Accommodation: ${budget.allocations.accommodation}%
        - Food: ${budget.allocations.food}%
        - Activities: ${budget.allocations.activities}%
        
        Transportation Preferences:
        - Preferred Modes: ${Object.entries(transportation.modes).map(([mode, pref]) => `${mode}: ${pref}`).join(', ')}
        - Route Preference: ${transportation.routePreference}
        
        Accommodation Preferences:
        - Type: ${accommodation.type}
        - Rating: ${accommodation.rating} stars
        - Required Amenities: ${accommodation.amenities.join(', ')}
        
        Activity Interests: ${activities.interests.join(', ')}
        Travel Pace: ${activities.pace}
        Rest Days: ${activities.schedule.restDays}
        Special Requirements: ${activities.schedule.specialRequirements}
        
        Please provide:
        1. A day-by-day itinerary
        2. Recommended accommodations within budget
        3. Must-see attractions and experiences
        4. Local food recommendations
        5. Transportation tips
        6. Estimated costs for each day
        
        Format the response in a clear, structured way with daily breakdowns.`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const tripPlan = result.response.text();

        res.json({ tripPlan });
    } catch (error) {
        console.error("Error generating trip:", error);
        res.status(500).json({ 
            error: "Failed to generate trip",
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
