# Batailles de France — serveur de jeu
FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app
COPY requirements.txt .
# Mises à jour de sécurité du système, dépendances, utilisateur sans privilèges ; pip est retiré de l'image finale
RUN apt-get update && apt-get upgrade -y --no-install-recommends && rm -rf /var/lib/apt/lists/* \
 && pip install --no-cache-dir -r requirements.txt \
 && useradd --uid 10000 --no-create-home --shell /usr/sbin/nologin jeu \
 && mkdir -p /donnees && chown 10000 /donnees \
 && (python -m pip uninstall -y pip setuptools wheel >/dev/null 2>&1 || true)
COPY app/ /app/
USER 10000
EXPOSE 8000
VOLUME ["/donnees"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/healthz', timeout=4).status == 200 else 1)"
# --proxy-headers : l'adresse réelle des joueurs n'est acceptée que des proxys listés dans FORWARDED_ALLOW_IPS
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--no-server-header", "--log-level", "warning", "--ws-max-size", "65536", "--proxy-headers"]
