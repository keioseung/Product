from datetime import datetime, timedelta
import pytz

def get_kst_now() -> datetime:
    """현재 KST 시간을 반환합니다."""
    kst = pytz.timezone('Asia/Seoul')
    return datetime.now(kst)

def get_kst_date_string() -> str:
    """현재 KST 날짜를 YYYY-MM-DD 형식으로 반환합니다."""
    return get_kst_now().strftime('%Y-%m-%d')

def get_kst_datetime_string() -> str:
    """현재 KST 날짜시간을 ISO 형식으로 반환합니다."""
    return get_kst_now().isoformat()

def get_kst_date_for_period(days_ago: int) -> datetime:
    """지정된 일수 전의 KST 날짜를 반환합니다."""
    return get_kst_now() - timedelta(days=days_ago)

def get_kst_date_string_for_period(days_ago: int) -> str:
    """지정된 일수 전의 KST 날짜를 YYYY-MM-DD 형식으로 반환합니다."""
    return get_kst_date_for_period(days_ago).strftime('%Y-%m-%d')

def is_today(date_string: str) -> bool:
    """주어진 날짜 문자열이 오늘인지 확인합니다."""
    return date_string == get_kst_date_string() 