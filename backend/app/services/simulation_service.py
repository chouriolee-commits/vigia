"""
Controla el proceso de vision/simulator.py como subproceso, para que el selector
de video del frontend pueda arrancar/detener un escaneo real en vez de ser solo
cosmético. Estado en memoria (un solo worker de backend, sin --reload — ver nota
en memoria del proyecto sobre procesos zombie sí se usara --reload aquí).

vision/ sigue sin conocer FastAPI/Postgres directamente (skills/architecture):
esto solo lanza el script tal cual se corría a mano, por HTTP hacia el mismo
backend, no hay acoplamiento nuevo.
"""

import subprocess
import sys
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[3]  # .../vigia
_VISION_DIR = _REPO_ROOT / "vision"
_VIDEO_DIR = _REPO_ROOT / "frontend" / "public" / "video"

_proceso_actual: subprocess.Popen | None = None
_estado_actual: dict = {"corriendo": False, "potrero_id": None, "video": None}


class VideoNoEncontrado(Exception):
    pass


def _python_ejecutable() -> str:
    venv_python = _VISION_DIR / "venv" / "Scripts" / "python.exe"
    if venv_python.exists():
        return str(venv_python)
    # Fallback: venv del backend no sirve (no tiene ultralytics/opencv) — mejor
    # avisar con un intérprete que al menos exista, el fallo será explícito.
    return sys.executable


def estado() -> dict:
    if _proceso_actual is not None and _proceso_actual.poll() is not None:
        # El proceso ya terminó solo (pasada única sin --loop) — reflejarlo.
        _estado_actual["corriendo"] = False
    return dict(_estado_actual)


def detener() -> dict:
    global _proceso_actual
    if _proceso_actual is not None and _proceso_actual.poll() is None:
        _proceso_actual.terminate()
        try:
            _proceso_actual.wait(timeout=5)
        except subprocess.TimeoutExpired:
            _proceso_actual.kill()
            _proceso_actual.wait(timeout=5)
    _proceso_actual = None
    _estado_actual.update({"corriendo": False, "potrero_id": None, "video": None})
    return estado()


def iniciar(potrero_id: int, video_filename: str) -> dict:
    global _proceso_actual

    # Sin separadores de ruta en el nombre — evita salir de _VIDEO_DIR.
    if "/" in video_filename or "\\" in video_filename:
        raise VideoNoEncontrado()
    video_path = _VIDEO_DIR / video_filename
    if not video_path.is_file():
        raise VideoNoEncontrado()

    detener()  # una sola sesión de escaneo activa a la vez

    log_path = _VISION_DIR / "simulator.log"
    log_file = open(log_path, "a", encoding="utf-8")  # noqa: SIM115 -- vive con el subproceso
    log_file.write(f"\n--- iniciando: potrero={potrero_id} video={video_filename} ---\n")
    log_file.flush()

    _proceso_actual = subprocess.Popen(
        [
            _python_ejecutable(), "-u", "simulator.py",
            "--video", str(video_path),
            "--potrero-id", str(potrero_id),
            "--sin-mostrar",
        ],
        cwd=str(_VISION_DIR),
        stdout=log_file,
        stderr=subprocess.STDOUT,
    )
    _estado_actual.update({"corriendo": True, "potrero_id": potrero_id, "video": video_filename})
    return estado()
