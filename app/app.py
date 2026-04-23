from flask import Flask
from routes.auth import auth_bp
from routes.main import main_bp
from routes.api import api_bp
from routes.admin import admin_bp

app = Flask(__name__)
app.secret_key = "123"


@app.context_processor
def inject_user_context():
    """
    Injeta informações da sessão em todos os templates.
    """
    return {
        "user_name": None,
        "usuario_logado": False,
        "is_admin": False
    } if "user_id" not in __import__("flask").session else {
        "user_name": __import__("flask").session.get("user_name", ""),
        "usuario_logado": True,
        "is_admin": __import__("flask").session.get("is_admin", False)
    }


app.register_blueprint(auth_bp)
app.register_blueprint(main_bp)
app.register_blueprint(api_bp)
app.register_blueprint(admin_bp)

if __name__ == "__main__":
    app.run(debug=True)