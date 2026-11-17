"""Test data factory functions for all entity types."""

from datetime import date, datetime, timedelta


def today_str():
    """Today's date as YYYY-MM-DD string."""
    return date.today().isoformat()


def yesterday_str():
    """Yesterday's date as YYYY-MM-DD string."""
    return (date.today() - timedelta(days=1)).isoformat()


# ── Tracking payload factories ─────────────────────────────────────────

def daily_prayer_payload(prayer_status_id, prayer_name="FAJR", **overrides):
    payload = {
        "prayerName": prayer_name,
        "prayerStatusId": prayer_status_id,
        "date": today_str(),
    }
    payload.update(overrides)
    return payload


def other_prayer_payload(other_prayer_type_id, **overrides):
    payload = {
        "otherPrayerTypeId": other_prayer_type_id,
        "date": today_str(),
    }
    payload.update(overrides)
    return payload


def quran_log_payload(quran_activity_type_id, **overrides):
    payload = {
        "surahName": "Al-Fatiha",
        "surahNumber": 1,
        "quranActivityTypeId": quran_activity_type_id,
        "versesCount": 7,
        "date": today_str(),
    }
    payload.update(overrides)
    return payload


def dhikr_log_payload(dhikr_type_id, **overrides):
    payload = {
        "dhikrTypeId": dhikr_type_id,
        "count": 33,
        "date": today_str(),
    }
    payload.update(overrides)
    return payload


def fasting_log_payload(fasting_type_id, **overrides):
    payload = {
        "fastingTypeId": fasting_type_id,
        "date": today_str(),
    }
    payload.update(overrides)
    return payload


def charity_log_payload(charity_type_id, **overrides):
    payload = {
        "charityTypeId": charity_type_id,
        "date": today_str(),
    }
    payload.update(overrides)
    return payload


def islamic_study_log_payload(subject_id, study_mode_id, **overrides):
    payload = {
        "subjectId": subject_id,
        "studyModeId": study_mode_id,
        "durationMins": 30,
        "date": today_str(),
    }
    payload.update(overrides)
    return payload


def skill_progress_log_payload(skill_id, **overrides):
    payload = {
        "skillId": skill_id,
        "progress": 50,
        "date": today_str(),
    }
    payload.update(overrides)
    return payload


def fitness_log_payload(fitness_activity_id, **overrides):
    payload = {
        "fitnessActivityId": fitness_activity_id,
        "quantity": 30,
        "date": today_str(),
    }
    payload.update(overrides)
    return payload


def nutrition_log_payload(nutrition_food_id, **overrides):
    payload = {
        "nutritionFoodId": nutrition_food_id,
        "date": today_str(),
    }
    payload.update(overrides)
    return payload


def sleep_log_payload(**overrides):
    now = datetime.utcnow()
    bedtime = (now - timedelta(hours=8)).isoformat() + "Z"
    wakeup = now.isoformat() + "Z"
    payload = {
        "bedtime": bedtime,
        "wakeupTime": wakeup,
        "date": today_str(),
    }
    payload.update(overrides)
    return payload


def fitrah_practice_log_payload(practice_ids, **overrides):
    payload = {
        "practices": practice_ids,
        "date": today_str(),
    }
    payload.update(overrides)
    return payload


def task_payload(**overrides):
    payload = {
        "title": "Test task",
        "date": today_str(),
    }
    payload.update(overrides)
    return payload


def intention_log_payload(intention_id, **overrides):
    payload = {
        "intentionId": intention_id,
        "date": today_str(),
    }
    payload.update(overrides)
    return payload


# ── Onboarding payload ─────────────────────────────────────────────────

def onboarding_payload(**overrides):
    payload = {
        "displayName": "Test User",
        "age": 25,
        "city": "Dubai",
        "country": "United Arab Emirates",
    }
    payload.update(overrides)
    return payload
