import os
from flask import Flask, session

from routes.auth import auth_bp
from routes.main import main_bp
from routes.api import api_bp
from routes.admin import admin_bp


app = Flask(__name__)

# Em produção, usa SECRET_KEY do Render.
# Localmente, usa "123" apenas para desenvolvimento.
app.secret_key = os.getenv("SECRET_KEY", "123")


@app.context_processor
def inject_user_context():
    """
    Injeta informações da sessão em todos os templates.
    """
    if "user_id" not in session:
        return {
            "user_name": None,
            "usuario_logado": False,
            "is_admin": False
        }

    return {
        "user_name": session.get("user_name", ""),
        "usuario_logado": True,
        "is_admin": session.get("is_admin", False)
    }


app.register_blueprint(auth_bp)
app.register_blueprint(main_bp)
app.register_blueprint(api_bp)
app.register_blueprint(admin_bp)


if __name__ == "__main__":
    app.run(debug=True)