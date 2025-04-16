import requests
from bs4 import BeautifulSoup
import json
import dspy
import sys
from pydantic import BaseModel

class Job(BaseModel):
    title: str
    beschreibung: str

class JobExtractor(dspy.Signature):
    """Extrahiere Jobtitel, die von KI betroffen sind, aus dem gegebenen Text."""
    text:str = dspy.InputField(desc="Textinhalt des Artikels")
    jobs: list[Job] = dspy.OutputField(desc="Ein JSON-Array von Jobs mit titel und Beschreibung, die als von KI betroffen erwähnt werden")


def extract_jobs_from_url(url):
    """
    Extracts job titles mentioned as affected by AI from a given URL using an LLM.
    """
    try:
        response = requests.get("https://r.jina.ai/"+url)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)


        job_extractor = dspy.Predict(JobExtractor)
        prediction = job_extractor(text=response.text)
        
        try:
            jobs =prediction.jobs
            if not isinstance(jobs, list):
                raise ValueError("LLM did not return a list of jobs")
            return jobs
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error decoding JSON or invalid JSON format: {e}")
            return []

    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL: {e}")
        return []


class JobComparator(dspy.Signature):
    """Vergleiche den extrahierten Jobtitel mit einer Liste vorhandener Jobtitel. Gib den am besten passenden Jobtitel aus der Liste zurück, falls vorhanden, sonst 'nicht gefunden'. Erkläre kurz, warum der Jobtitel passt oder nicht passt, und gib eine Ähnlichkeitsbewertung zwischen 0 (keine Ähnlichkeit) und 1 (identisch) an."""
    extracted_job_title = dspy.InputField(desc="Jobtitel, der aus dem Artikel extrahiert wurde")
    existing_job_titles = dspy.InputField(desc="Ein JSON-Array von vorhandenen Jobtiteln")
    matched_job = dspy.OutputField(desc="Der passende Job aus data.json oder 'nicht gefunden'")
    explanation = dspy.OutputField(desc="Erklärung, warum der Job passt oder nicht passt")
    similarity_score = dspy.OutputField(desc="Eine Ähnlichkeitsbewertung zwischen 0 und 1")

def compare_jobs(extracted_job_title, existing_job_titles):
    """
    Compares an extracted job against existing job data using an LLM.
    Returns the matched job from data.json or "not found".
    """
    job_comparator = dspy.Predict(JobComparator)
    prediction = job_comparator(extracted_job_title=extracted_job_title, existing_job_titles=existing_job_titles)
    matched_job = prediction.matched_job
    explanation = prediction.explanation
    similarity_score = prediction.similarity_score
    return matched_job, explanation, similarity_score




class JobAnalyzer(dspy.Signature):
    f"""
    Analysiere den Beruf und bewerte ihn in den Kategorien Kreativität und Sozialkompetenz. 
    Gib die Ergebnisse in folgendem JSON-Format zurück:
    {{
        "category": "<Kategorie>",
        "job": "<Jobtitel>",
        "creative": <Kreativitätsbewertung von 0 bis 10>,
        "social": <Sozialbewertung von 0 bis 10>,
        "categoryEnglish": "<Kategorie auf Englisch>",
        "jobEnglish": "<Berufsbezeichnung auf Englisch>",
        "creativityReasoning": "<Begründung für die Kreativitätsbewertung>",
        "socialReasoning": "<Begründung für die Sozialbewertung>"
    }}

    Hier ein Beispiel für eine gute Analyseffür einen anderen Job "Schaufensterdekorateur":
        ```json
          {{
            "category": "Dienstleistung",
            "job": "Schaufensterdekorateur",
            "creative": 7.5,
            "social": 3.5,
            "categoryEnglish": "Service",
            "jobEnglish": "window dresser",
            "creativityReasoningEnglish": "Sure, let's go through the analysis for the job title \"window dresser\" in the service category.\n\n**1. Break down the primary tasks/responsibilities typically involved:**\n\n- Designing window displays\n- Selecting and arranging props, mannequins, and merchandise\n- Coordinating with marketing and sales teams for thematic displays\n- Keeping up with fashion trends and seasonal themes\n- Implementing and updating displays regularly\n- Budget management for display materials and props\n\n**2. For each task, evaluate:**\n\n- **Designing window displays**\n  - Routine/repetitive: Low to medium; each display is different, but there may be some recurring themes.\n  - Original thinking required: High; each design needs a fresh concept.\n  - Human judgment needed: High; aesthetics and creativity are subjective.\n  - Can AI replicate: Somewhat, AI can assist but not fully replace the creative and judgment aspects.\n  \n- **Selecting and arranging props, mannequins, and merchandise**\n  - Routine/repetitive: Medium; similar props and mannequins might be used, but arrangement varies.\n  - Original thinking required: High; creativity in arrangement is crucial.\n  - Human judgment needed: High; balancing colors, themes, and aesthetics.\n  - Can AI replicate: Somewhat, AI can assist, but human touch is significant.\n\n- **Coordinating with marketing and sales teams for thematic displays**\n  - Routine/repetitive: Low; themes change based on various factors like seasons and promotions.\n  - Original thinking required: High; integration with marketing strategy needs creativity.\n  - Human judgment needed: High; interpreting marketing goals into visual displays.\n  - Can AI replicate: Limited; AI can analyze data but not fully coordinate with human teams effectively.\n\n- **Keeping up with fashion trends and seasonal themes**\n  - Routine/repetitive: Low; trends and themes are always changing.\n  - Original thinking required: High; requires synthesis of current fashion trends.\n  - Human judgment needed: High; identifying what's trendy and how to incorporate it.\n  - Can AI replicate: Limited; AI can track trends but not interpret them aesthetically.\n\n- **Implementing and updating displays regularly**\n  - Routine/repetitive: Medium; while updates are regular, the design aspect is dynamic.\n  - Original thinking required: Medium to high; depends on the level of change.\n  - Human judgment needed: Medium to high; depending on the complexity of updates.\n  - Can AI replicate: Moderately; AI could assist but not fully manage creative updates.\n\n- **Budget management for display materials and props**\n  - Routine/repetitive: Medium; budgeting is systematic but varies by display.\n  - Original thinking required: Medium; finding cost-effective creative solutions.\n  - Human judgment needed: Medium to high; balancing costs with creativity.\n  - Can AI replicate: Partially; AI can assist with budgeting tools.\n\n**3. Consider these factors:**\n\n- **Problem-solving complexity**: High; involves finding innovative ways to attract attention and boost sales through engaging displays.\n- **Need for emotional intelligence**: Medium to high; understanding consumer emotions and preferences is important.\n- **Required level of original idea generation**: High; unique and appealing displays are critical.\n- **Degree of strategic thinking**: Medium to high; displays must align with broader marketing strategies.\n- **Adaptability to unique situations**: High; each project may present different challenges and themes.\n\n**4. Based on this analysis, calculate the final score**\n\nConsidering all the factors, the job of a window dresser leans significantly towards the creative side. Tasks require a high degree of original thinking, human judgment, and strategy, with limited automation potential.\n\nFinal Score: **7.50**\n\nThis reflects the high creativity demands balanced with some routine elements and potential for partial automation assistance.",
            "socialReasoningEnglish": "### Step 1: Analyze the Key Social Components\n\n#### Direct face-to-face interaction frequency:\n- Moderate: A window dresser may interact with clients or store managers to understand the needs and themes for window displays. They may also engage with team members during the installation phase.\n\n#### Team collaboration requirements:\n- Moderate: While some work can be done independently (designing and preparing displays), collaboration is often required for installation and achieving consensus with stakeholders.\n\n#### Customer/client interaction level:\n- Variable: Direct customer interaction may be minimal, but understanding customer needs usually involves discussions with shop owners or marketing teams.\n\n#### Communication complexity:\n- Moderate: Communication with clients or teams can vary from simple instructions to more complex negotiations regarding the overall theme and brand identity.\n\n#### Emotional engagement needed:\n- Mild to moderate: Important when understanding client needs and receiving feedback. There's emotional engagement in creating visually appealing displays that evoke the right reactions from customers.\n\n### Step 2: Evaluate These Social Aspects\n\n#### Is the interaction standardized or unique?\n- Unique: Each window display is different and requires tailored communication and creativity.\n\n#### How much emotional intelligence is required?\n- Moderate: Understanding and responding to client feedback and team dynamics requires emotional intelligence.\n\n#### Does it require reading social cues?\n- Moderate: Picking up on client preferences and feedback during discussions, and sensing the team's morale and cooperation levels.\n\n#### Level of relationship building needed:\n- Moderate: Building good relationships with clients and team members is beneficial for long-term success and collaboration.\n\n#### Depth of interpersonal understanding required:\n- Moderate: Grasping the client's vision and the impact of the visual display on customers. Requires a reasonable depth of understanding.\n\n### Step 3: Consider These Factors\n\n#### Cultural sensitivity requirements:\n- Variable: Cultural awareness can be important depending on the client's target demographic to ensure the display is appropriate and appealing.\n\n#### Conflict resolution needs:\n- Moderate: Potential conflicts may arise over creative differences, deadlines, and budget constraints which need resolution.\n\n#### Leadership/influence components:\n- Moderate: While not primarily a leadership role, the window dresser may need to influence clients and team members regarding design decisions.\n\n#### Need for empathy and emotional support:\n- Moderate: Empathy is needed to understand client needs and support colleagues during stressful periods or tight deadlines.\n\n#### Real-time social adaptation requirements:\n- Moderate: Adaptation to feedback and on-the-fly changes during the assembly of displays.\n\n### Step 4: Assess AI Replaceability\n\n#### Can AI simulate these interactions effectively?\n- Limited: AI can assist in design but lacks the nuanced understanding required for tailored client interactions and spontaneous creative adjustments.\n\n#### How much nuanced human understanding is needed?\n- Moderate: Human interaction skills are crucial for understanding individual client and team dynamics.\n\n#### Are the interactions predictable or highly variable?\n- Variable: Each project can introduce unique challenges and client specifications, making interactions less predictable.\n\n#### Does the role require genuine human connection?\n- Moderate: Genuine connection enhances understanding of client needs and improves collaborative outcomes.\n\n### Final Score: \n- Considering the moderate levels of direct interaction, collaboration, emotional engagement, and the nuanced understanding required, a window dresser scores around **3.50** on the social interaction scale.\n\nFinal Score: **3.50**",
            "creativityReasoning": "Der Beruf \"Window Dresser\" (Schaufenstergestalter) hat eine Kreativitätsbewertung von 7,5 von 10 aus mehreren wichtigen Gründen:\n\n1. Hoher kreativer Anteil:\n- Jedes Display erfordert ein einzigartiges Design\n- Ständige Entwicklung neuer Konzepte\n- Künstlerische Interpretation von Marketing-Zielen\n- Integration aktueller Modetrends\n\n2. Komplexe Entscheidungsprozesse:\n- Subjektive ästhetische Bewertungen\n- Balance zwischen Budget und kreativem Ausdruck\n- Abstimmung mit Marketing- und Verkaufsstrategien\n\nDiese hohe Kreativitätsbewertung macht den Beruf schwerer durch KI ersetzbar, weil:\n\n1. KI-Limitationen:\n- KI kann zwar bei der Analyse von Trends und beim Budget helfen\n- Kann aber nicht die subjektive ästhetische Beurteilung ersetzen\n- Begrenzte Fähigkeit zur kreativen Interpretation und Innovation\n\n2. Menschliche Aspekte bleiben wichtig:\n- Emotionales Verständnis für Kundenvorlieben\n- Intuitive Anpassung an sich ändernde Trends\n- Zwischenmenschliche Kommunikation mit Teams\n\nDie KI kann also als unterstützendes Werkzeug dienen, wird aber aufgrund der hohen kreativen Anforderungen den menschlichen Window Dresser nicht vollständig ersetzen können.",
            "socialReasoning": "Der Beruf des \"Window Dresser\" (Schaufenstergestalter) hat eine Sozial-Bewertung von 3.5 von 10, was auf verschiedene soziale Komponenten hinweist, die in der Analyse betrachtet wurden:\n\n1. **Interaktionshäufigkeit**: Die Interaktionen sind mäßig, da Schaufenstergestalter oft mit Kunden oder Filialleitern kommunizieren müssen, um die Bedürfnisse und Themen für die Schaufensterdarstellungen zu verstehen. Diese Interaktionen sind zwar wichtig, aber nicht dauerhaft und nicht hochfrequent.\n\n2. **Teamarbeit**: Die Teamarbeit ist ebenfalls moderat. Während viele Gestaltungselemente individuell entworfen werden können, ist bei der Installation eine Zusammenarbeit notwendig, um ein einheitliches Ergebnis zu erzielen. \n\n3. **Kundeninteraktionen**: Der Grad der Kundeninteraktion ist variabel. Obwohl der Kunde möglicherweise nicht direkt in den kreativen Prozess einbezogen wird, ist es wichtig, ihre Vorlieben und Bedürfnisse zu verstehen.\n\n4. **Kommunikationskomplexität**: Die Kommunikation kann von einfachen Anweisungen bis zu komplexen Verhandlungen reichen, die ein gewisses Maß an emotionaler Intelligenz erfordern, um die Wünsche der Kunden angemessen zu erfassen und umzusetzen.\n\n5. **Emotionale Engagement**: Das erforderliche Maß an emotionalem Engagement ist mild bis moderat, da es wichtig ist, dass die Ausstellungen visuell ansprechend sind und die richtigen Reaktionen bei den Kunden hervorrufen.\n\n### Einfluss auf die Ersetzbarkeit durch KI\n\nDie Bewertung von 3.5 zeigt, dass, obwohl es eine gewisse soziale Komponente in der Rolle gibt, viele Aspekte dieser Arbeit auch algorithmisch verarbeitet werden können. Die moderate Anforderung an zwischenmenschliche Fähigkeiten, emotionaler Intelligenz und Anpassungsfähigkeit bedeutet:\n\n- **Begrenzte Ersetzbarkeit**: KI kann in den Bereichen des Designs unterstützen, zum Beispiel durch Automatisierung von Layout-Vorschlägen. Allerdings fehlt ihr die tiefgehende, nuancierte menschliche Intuition und das kulturelle Verständnis, die für maßgeschneiderte Kundeninteraktionen notwendig sind.\n\n- **Variable Interaktionen**: Die unvorhersehbaren Elemente jeder neuen Ausstellung machen es unverzichtbar, dass menschliche Gestalter bei der Anpassung an spezifische Kundenbedürfnisse und bei der Überwindung kreativer Differenzen anwesend sind.\n\n- **Genuine menschliche Verbindung**: Die Fähigkeit, echte Beziehungen aufzubauen und empathisch auf Feedback zu reagieren, bleibt eine Herausforderung, die KI vermutlich nicht in vollem Maße übernehmen kann.\n\nInsgesamt bedeutet die soziale Bewertung von 3.5, dass der Beruf des Window Dressers nicht vollständig durch KI ersetzt werden kann, da hierfür eine Vielzahl an emotionalen und zwischenmenschlichen Fähigkeiten erforderlich ist, die KI derzeit nur begrenzt simulieren kann."
         }}
        ```
    """
    job_title: str = dspy.InputField(desc="Jobtitel, der analysiert werden soll")
    job_beschreibung: str = dspy.InputField(desc="Eine initiale beschreibung des Jobs, die aus dem artikel extrahiert wurde")

    category: str = dspy.OutputField(desc="Kategorie des Jobs. Muss eine dieser Kategorien sein: [Manager, Forschung,Gesundheitswesen,Experte,Bildung,Dienstleistung,Ingenieur,Regierung,Unterhaltung,Techniker,Physisch,Büro/Sachbearbeiter ]")
    creative: float = dspy.OutputField(desc="Kreativitätsbewertung von -10 bis 10. Wie kreativ ist der Job? -10 = garnicht kreativ. 10 = sehr kreativ. (je kreativer, desto weniger kann er von KI ersetzt werden)")
    social: float = dspy.OutputField(desc="Sozialbewertung von -10 bis 10 Wie sozial ist der Job?  -10 = garnicht sozial. 10 = absolut sozial (je sozialer, desto weniger kann er von KI ersetzt werden)")

    creativityReasoning: str = dspy.OutputField(desc="Begründung für die Kreativitätsbewertung. Schreibe eine tiefgehende ausführliche bewertung. Mindestens 3 absätze. Nutze Listen wenn hilfreich.")
    socialReasoning: str = dspy.OutputField(desc="Begründung für die Sozialbewertung.Schreibe eine tiefgehende ausführliche bewertung. Mindestens 3 absätze. Nutze Listen wenn hilfreich.")

    jobEnglish: str = dspy.OutputField(desc="Jobtitel in English")
    categoryEnglish: str = dspy.OutputField(desc="Kategorie auf Englisch")
    creativeReasoningEnglish: str = dspy.OutputField(desc="Reasoning for the creativity score in English. In-depth reasoning. At least 3 paragraphs. Use lists if helpful.")
    socialReasoningEnglish: str = dspy.OutputField(desc="Reasoning for the social score in English. In-depth reasoning. At least 3 paragraphs. Use lists if helpful.")

def update_data_json(extracted_job, data,jobBeschreibung):
    """
    Creates a new entry in the data.json if the job is not found.
    Uses an LLM to extract relevant data and scores for the new entry.
    """

    jobAnalyzer = dspy.Predict(JobAnalyzer)

    prediction = jobAnalyzer(job_title=extracted_job,job_beschreibung=jobBeschreibung)
    predictionDict = prediction.toDict()
    predictionDict["job"] = extracted_job
    #make all dictkeys camelcase
    
    try:
        data.append(predictionDict)
    except json.JSONDecodeError as e:
        print(f"Error decoding LLM response: {e}")
        return data

    return data

def main(url, data_file="data.json"):
    """
    Main function to orchestrate the job extraction, comparison, and data updating.
    """
    lm = dspy.LM('openai/azure-westeurope-gpt-4o', api_base='https://chat.beansandbytes.de/api', api_key="sk-d5705335c265454fa24928f397a071a1")
    dspy.configure(lm=lm)

    try:
        with open(data_file, 'r') as f:
            data = json.load(f)
            existing_job_titles = [job['job'] for job in data]
    except FileNotFoundError:
        print(f"Error: {data_file} not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {data_file}.")
        return
    
    extracted_jobs = extract_jobs_from_url(url)
    if not extracted_jobs:
        print("No jobs extracted from the URL.")
        return

    updated_jobs = []
    filter_jobs = []
    for extracted_job in extracted_jobs:
        try:
            jobTitle = extracted_job.title
            jobBeschreibung = extracted_job.beschreibung
            matched_job, explanation, similarity_score = compare_jobs(extracted_job_title=jobTitle, existing_job_titles=existing_job_titles)
            if matched_job == "nicht gefunden": # type: ignore
                data = update_data_json(jobTitle, data, jobBeschreibung)
                updated_jobs.append(jobTitle)
                filter_jobs.append(jobTitle)

                # Schreibe die aktualisierten Daten zurück in die Datei
                with open(data_file, 'w') as f:
                    json.dump(data, f, indent=4)
            else:
                print(f"Job '{jobTitle}' already exists in data.json as '{matched_job}' with explanation: {explanation} and similarity score: {similarity_score}")
                filter_jobs.append(matched_job)
        except Exception as e:
            print(f"Error comparing jobs: {e}")
    if updated_jobs:
        print(f"Updated {data_file} with new jobs: {updated_jobs}")
    else:
        print("No new jobs to add.")

    print("\n\nFiltered jobs:", filter_jobs)
if __name__ == "__main__":
    # Load url from first os.arg
    url = "".join(sys.argv[1:])
    # Check if url is empty
    if not url:
        print("Please provide a URL.")
        sys.exit(1)
    # Call main function with the url
    main(url)