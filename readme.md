<p align="center">
  <img src="multimedia/logo.png" width="200" alt="Bankario Logo">
</p>

<h1 align="center">
  Bankario
</h1>

<p align="center">
  <strong>Una plataforma web de simulación financiera desarrollada con Flask y SQL Server.</strong>
  <br>
  <br>
  <img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python" alt="Python Version">
  <img src="https://img.shields.io/badge/Flask-2.x-000000?style=for-the-badge&logo=flask" alt="Flask Version">
  <img src="https://img.shields.io/badge/Database-SQL_Server-CC2927?style=for-the-badge&logo=microsoft-sql-server" alt="Database">
</p>

---

## Acerca del proyecto

**Bankario** es una aplicación web educativa e interactiva diseñada para ayudar a los usuarios a mejorar su salud financiera. El sistema permite a los usuarios registrarse, gestionar su perfil y utilizar un conjunto de simuladores para tomar decisiones informadas sobre créditos, ahorros, inversiones y jubilación, todo en un entorno seguro y sin riesgo.

El proyecto está construido con **Flask** en el backend, utiliza **SQLAlchemy** como ORM para la gestión de la base de datos y presenta una interfaz de usuario moderna con **Bootstrap 5** y efectos "Glassmorphism".

### Características principales

* **Sistema de autenticación completo**: Registro, inicio de sesión y cierre de sesión seguro.
* **Gestión de perfiles (CRUD)**: Los usuarios pueden ver, actualizar su información personal (nombre, apellido) y cambiar su contraseña.
* **Dashboard interactivo**: Un panel central para navegar por todas las herramientas y un selector de tema (modo claro/oscuro).
* **Múltiples simuladores financieros**:
    * Simulador de ahorro
    * Simulador de crédito
    * Simulador de inversión
    * Presupuesto personal
    * Retiro/Jubilación
    * Calculadora de deuda
* **Test de conocimientos**: Un cuestionario interactivo con temporizador, puntuación y un ranking de usuarios.
* **Glosario financiero**: Una página dedicada con un buscador para definir términos financieros clave.

---

## Guía de instalación y despliegue

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno de desarrollo local.

### **1. Prerrequisitos**

Asegúrate de tener instalado lo siguiente en tu sistema:
* [Python](https://www.python.org/downloads/) (versión 3.10 o superior)
* [Git](https://git-scm.com/downloads/)
* [Microsoft SQL Server](https://www.microsoft.com/es-es/sql-server/sql-server-downloads) (Edición Express o Developer)
* [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/es-es/sql/ssms/download-sql-server-management-studio-ssms)
* [Microsoft ODBC Driver 18 for SQL Server](https://learn.microsoft.com/es-es/sql/connect/odbc/download-odbc-driver-for-sql-server) (¡**Importante**! El driver es necesario para la conexión).

### **2. Pasos de instalación**

1.  **Clona el repositorio**
    Abre tu terminal y ejecuta el siguiente comando para descargar el proyecto:
    ```sh
    git clone https://github.com/joshualeba/bankario-simulaciones.git
    ```
    *(Nota: Reemplaza la URL si tu repositorio está en otra ubicación).*

2.  **Navega al directorio del proyecto**
    ```sh
    cd bankario-simulaciones
    ```

3.  **Crea y activa un entorno virtual**
    Es una buena práctica para aislar las dependencias del proyecto.
    ```sh
    # Crear el entorno virtual
    python -m venv venv

    # Activar el entorno (Windows)
    .\venv\Scripts\activate
    ```
    *(Si estás en macOS/Linux, usa: `source venv/bin/activate`)*

4.  **Crea el archivo `requirements.txt`**
    Crea un archivo llamado `requirements.txt` en la raíz del proyecto y pega el siguiente contenido:
    ```
    Flask
    Flask-SQLAlchemy
    pyodbc
    werkzeug
    email_validator
    urllib3
    re
    ```

5.  **Instala las dependencias de Python**
    ```sh
    pip install -r requirements.txt
    ```

6.  **Configura la base de datos**
    * Abre **SSMS** (SQL Server Management Studio) y conéctate a tu servidor SQL local (debéras nombrarlo '.').
    * En el "Explorador de objetos", haz clic derecho en **"Bases de datos"** > **"Nueva base de datos..."**.
    * Nombra la base de datos `bankario_db_v2` (este es el nombre esperado en `app.py`).
    * Abre el archivo `bankario_db_1.sql` en SSMS o tu editor de texto.
    * Copia todo el contenido del script.
    * Pégalo en una "Nueva consulta" en SSMS (asegúrate de que la base de datos `bankario_db_v2` esté seleccionada) y **ejecútalo**.
    * Esto creará todas las tablas, procedimientos y datos iniciales del test.

7.  **Verifica la configuración de `app.py`**
    Abre `app.py` y asegúrate de que estas líneas (cerca de la línea 20) coincidan con tu configuración. La configuración por defecto ya está lista para una conexión local estándar:
    ```python
    DB_SERVER = '.'
    DB_DATABASE = 'bankario_db_v2'
    DB_DRIVER = '{ODBC Driver 18 for SQL Server}'
    
    params = urllib.parse.quote_plus(
        f"DRIVER={DB_DRIVER};"
        f"SERVER={DB_SERVER};"
        f"DATABASE={DB_DATABASE};"
        f"trusted_connection=yes;"
        f"TrustServerCertificate=yes;"  # <-- Esta línea es vital
    )
    ```

8.  **Inicia el servidor de desarrollo**
    ```sh
    flask run --debug
    ```

¡Y listo! La aplicación estará corriendo en `http://127.0.0.1:5000`.

### Datos de prueba

El script de la base de datos **no** crea usuarios de prueba. Deberás crear tu primera cuenta usando el formulario de **"Registro"** en la aplicación.

---

## Licencia

Este proyecto está bajo la Licencia MIT.