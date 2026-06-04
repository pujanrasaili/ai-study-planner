import os
import json
from datetime import datetime, timedelta
from groq import Groq

def generate_study_schedule(subjects_data, daily_hours=4, days_ahead=14):
    """Generate a study schedule using Groq AI."""
    
    client = Groq(api_key=os.getenv('GROQ_API_KEY'))

    subjects_summary = []
    for s in subjects_data:
        exam_info = f", exam on {s['exam_date'][:10]}" if s.get('exam_date') else " (no exam date)"
        subjects_summary.append(
            f"- {s['name']}: difficulty={s['difficulty']}, "
            f"knowledge level={s['current_level']}%{exam_info}, "
            f"target {s['hours_per_week']} hours/week"
        )

    today = datetime.utcnow()
    start_date = today.strftime('%Y-%m-%d')
    end_date = (today + timedelta(days=days_ahead)).strftime('%Y-%m-%d')

    prompt = f"""You are a study schedule generator. Create a detailed study schedule.

Subjects:
{chr(10).join(subjects_summary)}

Schedule parameters:
- Start date: {start_date}
- End date: {end_date}
- Available study hours per day: {daily_hours}
- Today: {today.strftime('%A, %B %d, %Y')}

Rules:
1. Prioritize subjects with closer exam dates
2. Give more time to harder subjects and those with lower knowledge level
3. Space out sessions for the same subject (spaced repetition)
4. Keep sessions 45-90 minutes max
5. Include specific, actionable study titles (e.g. "Review Chapter 3: Sorting Algorithms")

Respond ONLY with a valid JSON array. No explanation, no markdown, just raw JSON.
Each item must have exactly these fields:
- "date": ISO datetime string (e.g. "2024-01-15T09:00:00")
- "subject": exact subject name from the list above
- "title": specific study session title
- "description": 1-2 sentences describing what to study
- "duration_minutes": integer (45, 60, 75, or 90)

Generate sessions for all {days_ahead} days."""

    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=4000,
            temperature=0.3
        )

        content = response.choices[0].message.content.strip()
        
        # Clean up response
        if content.startswith('```'):
            content = content.split('```')[1]
            if content.startswith('json'):
                content = content[4:]
        content = content.strip()

        schedule = json.loads(content)
        return schedule

    except json.JSONDecodeError:
        return _generate_fallback_schedule(subjects_data, today, days_ahead)
    except Exception as e:
        print(f"AI generation error: {e}")
        return _generate_fallback_schedule(subjects_data, today, days_ahead)


def _generate_fallback_schedule(subjects_data, start_date, days_ahead):
    """Fallback schedule if AI fails."""
    schedule = []
    if not subjects_data:
        return schedule

    study_times = ["09:00:00", "14:00:00", "19:00:00"]
    
    for day in range(days_ahead):
        current_date = start_date + timedelta(days=day)
        day_subjects = subjects_data[day % len(subjects_data):] + subjects_data[:day % len(subjects_data)]
        
        for i, subject in enumerate(day_subjects[:2]):
            time = study_times[i % len(study_times)]
            schedule.append({
                "date": f"{current_date.strftime('%Y-%m-%d')}T{time}",
                "subject": subject['name'],
                "title": f"Study session: {subject['name']}",
                "description": f"Review and practice {subject['name']} concepts.",
                "duration_minutes": 60
            })

    return schedule
