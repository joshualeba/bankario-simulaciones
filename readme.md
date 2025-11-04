# Bankario - Simulador Financiero

![Screenshot del Dashboard de Bankario](multimedia/home_img.png)

Bankario es una plataforma web educativa e interactiva diseñada para ayudar a los usuarios a mejorar su salud financiera. Permite a los usuarios registrarse, gestionar su perfil y utilizar un conjunto de simuladores (ahorro, crédito, inversión, etc.) para tomar decisiones informadas en un entorno seguro y sin riesgo.

La plataforma incluye un sistema completo de autenticación, gestión de perfiles de usuario (CRUD), simuladores interactivos, un test de conocimientos con ranking y un glosario financiero.

---

## 🛠️ Tecnologías utilizadas

* **Backend:**
    * Python
    * Flask (Framework web)
    * Flask-SQLAlchemy (ORM)
* **Frontend:**
    * HTML5
    * CSS3 (con variables, animaciones y diseño responsivo "Glassmorphism")
    * JavaScript (ES6+)
    * Bootstrap 5
* **Base de datos:**
    * Microsoft SQL Server
    * `pyodbc` (usado como dialecto de SQLAlchemy)

---

## ⚙️ Guía de instalación local (paso a paso)

Esta guía te llevará desde cero hasta tener el proyecto funcionando en tu máquina local.

### Paso 0: Prerrequisitos (Software necesario)

Antes de empezar, asegúrate de tener instalado el siguiente software:

1.  **Python:** (versión 3.10 o superior). [Descargar Python](https://www.python.org/downloads/).
2.  **Git:** Para clonar el repositorio. [Descargar Git](https://git-scm.com/downloads).
3.  **SQL Server:** Se recomienda la edición gratuita "Express" o "Developer". [Descargar SQL Server](https://www.microsoft.com/es-es/sql-server/sql-server-downloads).
4.  **SSMS (SQL Server Management Studio):** La herramienta gráfica para gestionar tu base de datos. [Descargar SSMS](https://learn.microsoft.com/es-es/sql/ssms/download-sql-server-management-studio-ssms).
5.  **Microsoft ODBC Driver 18 for SQL Server:** **¡Crítico!** Es el controlador que Python necesita para conectarse a SQL Server. [Descargar ODBC Driver 18](https://learn.microsoft.com/es-es/sql/connect/odbc/download-odbc-driver-for-sql-server).

### Paso 1: Clonar el repositorio

Abre una terminal (como Git Bash o la terminal de Windows) y clona el proyecto en tu computadora.

```bash
# Navega a la carpeta donde quieras guardar tu proyecto
cd C:\Users\TuUsuario\Documents\Proyectos

# Clona el repositorio
git clone [https://github.com/joshualeba/bankario-simulaciones.git](https://github.com/joshualeba/bankario-simulaciones.git)

# Entra en la carpeta del proyecto
cd bankario-simulaciones
Paso 2: Configurar la base de datos 🗃️
Abre SQL Server Management Studio (SSMS).

Conéctate a tu servidor de base de datos local (usualmente se llama . o (local)).

En el "Explorador de objetos", haz clic derecho en "Bases de datos" y selecciona "Nueva base de datos...".

Nombra la base de datos exactamente así: bankario_db_v2 (este nombre se usa en el archivo app.py). Haz clic en "Aceptar".

Abre el archivo bankario_db_1.sql que está en el repositorio.

Copia todo el contenido del archivo SQL.

En SSMS, asegúrate de que la base de datos bankario_db_v2 esté seleccionada en el menú desplegable (arriba a la izquierda).

Pega el script en una nueva ventana de consulta ("Nueva consulta" o "New Query") y presiona Ejecutar.

Esto creará todas las tablas, relaciones y datos de prueba (como las preguntas del test) que la aplicación necesita.

Paso 3: Configurar el entorno de Python 🐍
Se recomienda usar un entorno virtual para no instalar los paquetes globalmente.

Bash

# Desde la raíz de tu proyecto (la carpeta bankario-simulaciones)
# Crea un entorno virtual llamado 'venv'
python -m venv venv

# Activa el entorno virtual
# En Windows (CMD o PowerShell):
.\venv\Scripts\activate
Verás (venv) al inicio de la línea de tu terminal, indicando que el entorno está activo.

Paso 4: Instalar las dependencias 📦
Crea un archivo llamado requirements.txt en la raíz de tu proyecto.

Copia y pega el siguiente contenido en ese archivo:

Flask
Flask-SQLAlchemy
pyodbc
werkzeug
email_validator
urllib3
re
En tu terminal (con el entorno venv activado), instala todas las dependencias:

Bash

pip install -r requirements.txt
Paso 5: Configurar la conexión en app.py 🔌
El último paso es asegurarte de que tu aplicación Flask sepa cómo conectarse a la base de datos que creaste.

Abre el archivo app.py en tu editor de código.

Busca la sección de configuración de SQLAlchemy (cerca de la línea 20).

Asegúrate de que coincida con tu configuración local. La configuración por defecto del repositorio ya está corregida y debería funcionar si seguiste los pasos anteriores:

Python

# ...
# configuración de la conexión a la base de datos para sql server
DB_SERVER = '.' # Servidor local. ¡Déjalo así!
DB_DATABASE = 'bankario_db_v2' # El nombre de tu BD del Paso 2
DB_DRIVER = '{ODBC Driver 18 for SQL Server}' # Driver del Paso 0

# codifica el driver para la url
params = urllib.parse.quote_plus(
    f"DRIVER={DB_DRIVER};"
    f"SERVER={DB_SERVER};"
    f"DATABASE={DB_DATABASE};"
    f"trusted_connection=yes;"
    # Esta línea es crucial para evitar errores de certificado en local:
    f"TrustServerCertificate=yes;"
)

app.config['SQLALCHEMY_DATABASE_URI'] = f"mssql+pyodbc:///?odbc_connect={params}"
# ...
Paso 6: ¡Ejecutar la aplicación! 🚀
¡Todo listo! En tu terminal (con el entorno venv activado), ejecuta la aplicación:

Bash

flask run --debug
Verás una salida indicando que el servidor está corriendo, usualmente en:

* Running on http://127.0.0.1:5000

Abre esa dirección http://127.0.0.1:5000 en tu navegador web. ¡Deberías ver la página de inicio de Bankario!