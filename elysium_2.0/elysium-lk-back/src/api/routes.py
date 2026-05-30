from .questions import questions_router
from .sample_answers import sample_answers_router
from .topics import topics_router
from .categories import categories_router
from .user_answers import user_answers_router
from .user import users_router

all_routers = [
    questions_router,
    sample_answers_router,
    topics_router,
    categories_router,
    user_answers_router,
    users_router,
]