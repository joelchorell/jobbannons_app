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
        Du är en kreativ och professionell rekryterare. Skapa en engagerande jobbannons baserad på följande information:

        Här är informationen om tjänsten:
        - Arbetsuppgifter: {', '.join(data['tasks'])}
        - Kvalifikationer: {', '.join(data['requirements'])}
        - Meriterande egenskaper: {', '.join(data['preferredSkills'])}
        - Om företaget: {data['about'][0]}
        - Plats: {data['location'][0]}
        - Anställningsform: {data['employmentType'][0]}
        - Sista ansökningsdag: {data['applyDay'][0]}
        - Kontakt: {data['contact'][0]}
        - Extra information: {data['extraInfo'][0]}

        Skriv en kreativ och säljande jobbannons som får potentiella kandidater att vilja söka tjänsten. 
        Var personlig i tonen och använd ett modernt språk. Strukturera texten på ett lättläst sätt.
        Använd gärna markdown för att göra rubriker i fetstil med **.
        """
        
        print("Sending prompt to OpenAI:", prompt)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Du är en modern rekryterare som skriver engagerande och personliga jobbannonser."},
                {"role": "user", "content": prompt}
            ]
        )
        
        content = response.choices[0].message.content
        result = {"listing": content}
        return result

    except Exception as e:
        print(f"Error in generate_final_listing: {str(e)}")
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
        print("Received data:", data)  # Add this for debugging
        final_listing = generate_final_listing(data)
        return jsonify(final_listing)
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/regenerate-style', methods=['POST'])
def regenerate_style():
    try:
        data = request.json
        current_text = data.get("currentText")
        style = data.get("style")
        
        style_prompts = {
            "professional": "Omformulera denna jobbannons till en mer professionell och formell ton, men behåll all väsentlig information:",
            "joyful": "Omformulera denna jobbannons till en mer lättsam och personlig ton, men behåll all väsentlig information:",
            "concise": "Omformulera denna jobbannons till en mer koncis version, fokusera på det viktigaste och ta bort överflödiga ord:"
        }
        
        prompt = f"""
        {style_prompts[style]}

        {current_text}
        
        Behåll markdown-formatering med ** för rubriker.
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Du är en skicklig rekryterare som kan anpassa tonen i jobbannonser."},
                {"role": "user", "content": prompt}
            ]
        )
        
        return {"listing": response.choices[0].message.content}
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/update-style', methods=['POST'])
def update_style():
    data = request.json
    text = data.get('text', '')
    style = data.get('style', '')
    
    if not text or not style:
        return jsonify({'error': 'Missing text or style parameter'}), 400
    
    try:
        # Create the prompt based on the requested style
        if style == 'professionell':
            prompt = f"""
            Gör följande jobbannons mer professionell. Använd ett formellt språk, 
            fokusera på företagets värderingar och den professionella utvecklingen. 
            Behåll all väsentlig information men uttryck den på ett mer professionellt sätt.
            
            Jobbannons:
            {text}
            """
        elif style == 'lättsam':
            prompt = f"""
            Gör följande jobbannons mer lättsam och personlig. Använd ett varmare och 
            mer inbjudande språk, fokusera på arbetsmiljön och teamkänslan. 
            Behåll all väsentlig information men uttryck den på ett mer personligt sätt.
            
            Jobbannons:
            {text}
            """
        elif style == 'koncis':
            prompt = f"""
            Gör följande jobbannons mer koncis och direkt. Ta bort onödiga ord och fraser, 
            fokusera på det väsentliga och gör texten mer kärnfull. 
            Behåll all viktig information men uttryck den på ett mer koncist sätt.
            
            Jobbannons:
            {text}
            """
        else:
            return jsonify({'error': 'Invalid style parameter'}), 400
        
        # Call the OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Du är en expert på att skriva jobbannonser på svenska."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        # Extract the updated text from the response
        updated_text = response.choices[0].message.content.strip()
        
        return jsonify({'updated_text': updated_text})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
