from flask import Flask, request, jsonify
from flask_cors import CORS
# import openai  # Comment out
import os
# from dotenv import load_dotenv  # Comment out

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Comment out OpenAI setup for now
# load_dotenv()
# OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
# if not OPENAI_API_KEY:
#     raise ValueError("No OpenAI API key found. Set OPENAI_API_KEY environment variable.")
# openai.api_key = OPENAI_API_KEY

def generate_job_data(job_title):
    try:
        prompt = f"""
        Baserat på jobbtiteln "{job_title}", generera en JSON-struktur med:
        
        - En lista över typiska arbetsuppgifter
        - En lista över nödvändiga kvalifikationer
        - En lista över meriterande egenskaper
        - Information om företaget
        - Plats
        - Anställningsform
        - Sista ansökningsdag
        - Kontaktinformation
        
        Returnera endast JSON enligt följande format:
        
        {{
          "tasks": ["Uppgift 1", "Uppgift 2", "Uppgift 3"],
          "requirements": ["Krav 1", "Krav 2", "Krav 3"],
          "preferredSkills": ["Meriterande 1", "Meriterande 2", "Meriterande 3"],
          "about": ["Företagsinformation"],
          "location": ["Platsinfo"],
          "employmentType": ["Anställningsform"],
          "applyDay": ["Sista ansökningsdag"],
          "contact": ["Kontaktinformation"]
        }}
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "system", "content": prompt}]
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
    except json.JSONDecodeError:
        raise ValueError("Failed to parse OpenAI response as JSON")
    except Exception as e:
        raise Exception(f"Error generating job data: {str(e)}")

@app.route('/generate-job-data', methods=['POST'])
def generate_job():
    try:
        data = request.json
        print(f"Received request with data: {data}")  # Debug log
        
        job_title = data.get("jobTitle")
        custom_title = data.get("customTitle")  # Add support for custom title
        
        # Use custom title if provided, otherwise use selected job title
        final_title = custom_title if job_title == "Eget" else job_title
        
        if not final_title:
            print("No job title provided")  # Debug log
            return jsonify({"error": "Ingen jobbtitel angiven"}), 400
        
        # For testing, return mock data instead of calling OpenAI
        mock_data = {
            "tasks": [f"Test arbetsuppgift 1 för {final_title}", "Test arbetsuppgift 2"],
            "requirements": ["Test krav 1", "Test krav 2"],
            "preferredSkills": ["Test merit 1", "Test merit 2"],
            "about": ["Test företagsinfo"],
            "location": ["Stockholm"],
            "employmentType": ["Heltid"],
            "applyDay": ["2024-12-31"],
            "contact": ["test@example.com"]
        }
        
        print(f"Returning mock data: {mock_data}")  # Debug log
        return jsonify(mock_data)
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Debug log
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
