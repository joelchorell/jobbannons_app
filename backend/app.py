from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for testing

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise ValueError("No OpenAI API key found. Set OPENAI_API_KEY environment variable.")

# Initialize the client
client = OpenAI(api_key=OPENAI_API_KEY)

def generate_initial_data(job_title):
    try:
        prompt = f"""
        Du är en erfaren rekryterare. Skapa relevanta arbetsuppgifter, kvalifikationer och meriterande egenskaper för positionen "{job_title}".
        Svara ENDAST med ett JSON-objekt i exakt detta format:
        {{
          "tasks": ["Uppgift 1", "Uppgift 2", "Uppgift 3"],
          "requirements": ["Krav 1", "Krav 2", "Krav 3"],
          "preferredSkills": ["Meriterande 1", "Meriterande 2", "Meriterande 3"]
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Du är en rekryteringsassistent som svarar endast med JSON."},
                {"role": "user", "content": prompt}
            ]
        )
        
        content = response.choices[0].message.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
            
        return json.loads(content.strip())

    except Exception as e:
        raise Exception(f"Error generating initial data: {str(e)}")

def generate_final_listing(data):
    try:
        prompt = f"""
        Skapa en trevlig och säljande jobbannons baserad på följande grundläggande information som du sedan utvecklar enligt populära trender:

        Arbetsuppgifter:
        {json.dumps(data['tasks'], indent=2, ensure_ascii=False)}

        Kvalifikationer:
        {json.dumps(data['requirements'], indent=2, ensure_ascii=False)}

        Meriterande egenskaper:
        {json.dumps(data['preferredSkills'], indent=2, ensure_ascii=False)}

        Om företaget:
        {json.dumps(data['about'], indent=2, ensure_ascii=False)}

        Plats: {data['location'][0]}
        Anställningsform: {data['employmentType'][0]}
        Sista ansökningsdag: {data['applyDay'][0]}
        Kontakt: {data['contact'][0]}

        Formatera annonsen professionellt och strukturerat.
        """
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Du är en professionell rekryterare som skapar välstrukturerade jobbannonser."},
                {"role": "user", "content": prompt}
            ]
        )
        
        return {"listing": response.choices[0].message.content}

    except Exception as e:
        raise Exception(f"Error generating final listing: {str(e)}")

@app.route('/generate-initial-data', methods=['POST'])
def get_initial_data():
    try:
        data = request.json
        job_title = data.get("jobTitle")
        if not job_title:
            return jsonify({"error": "Ingen jobbtitel angiven"}), 400
        
        initial_data = generate_initial_data(job_title)
        return jsonify(initial_data)
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-final-listing', methods=['POST'])
def get_final_listing():
    try:
        data = request.json
        final_listing = generate_final_listing(data)
        return jsonify(final_listing)
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
