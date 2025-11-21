import os
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash
from email_validator import validate_email, EmailNotValidError
from datetime import datetime
import re
import urllib # necesario para la cadena de conexión

# sección: configuración de la aplicación flask
app = Flask(__name__,
            template_folder=os.path.abspath('.'),
            static_folder=os.path.abspath('.'))

app.secret_key = 'mercysecret'

# --- CAMBIO: configuración de sqlalchemy ---
# reemplaza pyodbc con flask_sqlalchemy

# configuración de la conexión a la base de datos para sql server
DB_SERVER = '.'
DB_DATABASE = 'bankario_db_v2' # asegúrate que sea el nombre correcto de tu bd
DB_DRIVER = '{ODBC Driver 18 for SQL Server}' # asegúrate que este driver esté instalado

# codifica el driver para la url
params = urllib.parse.quote_plus(
    f"DRIVER={DB_DRIVER};"
    f"SERVER={DB_SERVER};"
    f"DATABASE={DB_DATABASE};"
    f"trusted_connection=yes;"
    f"TrustServerCertificate=yes;"
)

app.config['SQLALCHEMY_DATABASE_URI'] = f"mssql+pyodbc:///?odbc_connect={params}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# inicializa la extensión de sqlalchemy
db = SQLAlchemy(app)

# carpeta para subir imágenes de perfil (aunque no se usa en este ejemplo, se mantiene)
UPLOAD_FOLDER = 'multimedia'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# crear la carpeta de uploads si no existe
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- NUEVO: definición de modelos orm ---
# estas clases representan tus tablas de la base de datos

class DatosP(db.Model):
    __tablename__ = 'DatosP'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(255), nullable=False)
    apellidoP = db.Column(db.String(255))
    apellidoM = db.Column(db.String(255))
    fecha_nacimiento = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    telefono = db.Column(db.BigInteger)
    # relación uno-a-uno con usuarios
    usuario = db.relationship('Usuarios', back_populates='datosp', uselist=False, lazy=True)

class Usuarios(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_datosP = db.Column(db.Integer, db.ForeignKey('DatosP.id'), unique=True, nullable=False)
    correo_electronico = db.Column(db.String(255), nullable=False, unique=True)
    contrasena = db.Column(db.String(255), nullable=False)
    fecha_registro = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    ultima_sesion = db.Column(db.DateTime)
    test_completado = db.Column(db.Boolean, nullable=False, default=False)
    
    # relación inversa con datosp
    datosp = db.relationship('DatosP', back_populates='usuario', lazy=True)
    # relación uno-a-muchos con resultados_test
    resultados = db.relationship('ResultadosTest', back_populates='usuario', lazy=True, cascade="all, delete-orphan")

class Tipo_Preguntas(db.Model):
    __tablename__ = 'Tipo_Preguntas'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(255))
    preguntas = db.relationship('PreguntasTest', back_populates='tipo_pregunta', lazy=True)

class Dificultades(db.Model):
    __tablename__ = 'Dificultades'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(255))
    preguntas = db.relationship('PreguntasTest', back_populates='dificultad', lazy=True)

class Categorias(db.Model):
    __tablename__ = 'Categorias'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(255))
    preguntas = db.relationship('PreguntasTest', back_populates='categoria', lazy=True)

class PreguntasTest(db.Model):
    __tablename__ = 'preguntas_test'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pregunta = db.Column(db.String(None), nullable=False)
    id_tipoPregunta = db.Column(db.Integer, db.ForeignKey('Tipo_Preguntas.id'))
    id_dificultad = db.Column(db.Integer, db.ForeignKey('Dificultades.id'))
    id_categoria = db.Column(db.Integer, db.ForeignKey('Categorias.id'))
    respuesta_texto_correcta = db.Column(db.String(500))
    
    tipo_pregunta = db.relationship('Tipo_Preguntas', back_populates='preguntas', lazy=True)
    dificultad = db.relationship('Dificultades', back_populates='preguntas', lazy=True)
    categoria = db.relationship('Categorias', back_populates='preguntas', lazy=True)
    opciones = db.relationship('OpcionesRespuesta', back_populates='pregunta', lazy=True, cascade="all, delete-orphan")

class OpcionesRespuesta(db.Model):
    __tablename__ = 'opciones_respuesta'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pregunta_id = db.Column(db.Integer, db.ForeignKey('preguntas_test.id'), nullable=False)
    texto_opcion = db.Column(db.String(500), nullable=False)
    es_correcta = db.Column(db.Boolean, nullable=False)
    
    pregunta = db.relationship('PreguntasTest', back_populates='opciones', lazy=True)

class ResultadosTest(db.Model):
    __tablename__ = 'resultados_test'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    puntuacion = db.Column(db.Integer, nullable=False)
    total_preguntas = db.Column(db.Integer, nullable=False)
    puntuacion_total = db.Column(db.Integer, nullable=False, default=0)
    tiempo_resolucion_segundos = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    fecha_realizacion = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    usuario = db.relationship('Usuarios', back_populates='resultados', lazy=True)

class Sofipos(db.Model):
    __tablename__ = 'sofipos'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    tasa_anual = db.Column(db.Numeric(5, 2), nullable=False)
    plazo_dias = db.Column(db.Integer, nullable=False)
    nicap = db.Column(db.Integer, nullable=False)
    logo_url = db.Column(db.String(255))
    url_web = db.Column(db.String(255))

    # 1. Agrega el Modelo ORM al inicio junto con los otros
    class DiagnosticosFinancieros(db.Model):
        __tablename__ = 'diagnosticos_financieros'
        id = db.Column(db.Integer, primary_key=True, autoincrement=True)
        usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
        ingresos_mensuales = db.Column(db.Numeric(10,2))
        gastos_mensuales = db.Column(db.Numeric(10,2))
        deuda_total = db.Column(db.Numeric(10,2))
        ahorro_actual = db.Column(db.Numeric(10,2))
        puntaje_salud = db.Column(db.Integer)
        nivel_endeudamiento = db.Column(db.Numeric(5,2))
        recomendacion_clave = db.Column(db.String(255))
        fecha_diagnostico = db.Column(db.DateTime, default=datetime.utcnow)

# 2. Ruta para procesar el diagnóstico
@app.route('/api/calcular_salud', methods=['POST'])
def calcular_salud():
    if 'usuario_autenticado' not in session:
        return jsonify(success=False, message='No autorizado'), 401

    data = request.json
    try:
        ingresos = float(data.get('ingresos', 0))
        gastos = float(data.get('gastos', 0))
        deuda = float(data.get('deuda', 0))
        ahorro = float(data.get('ahorro', 0))
    except ValueError:
        return jsonify(success=False, message="Datos inválidos"), 400

    if ingresos <= 0:
        return jsonify(success=False, message="Los ingresos deben ser mayores a 0 para calcular."), 400

    # --- LÓGICA FINANCIERA AVANZADA ---
    puntaje = 100
    analisis = [] # Aquí guardaremos los consejos detallados

    # 1. ANÁLISIS DE GASTOS FIJOS (Ideal: < 50% de ingresos)
    ratio_gastos = (gastos / ingresos) * 100
    if ratio_gastos > 60:
        puntaje -= 25
        analisis.append({
            "tipo": "gasto",
            "estado": "mal",
            "titulo": "Gastos fijos altos",
            "texto": f"Tus gastos fijos consumen el {ratio_gastos:.0f}% de tu ingreso. Lo ideal es mantenerlos bajo el 50% para tener margen de maniobra."
        })
    elif ratio_gastos > 50:
        puntaje -= 10
        analisis.append({
            "tipo": "gasto",
            "estado": "regular",
            "titulo": "Gastos al límite",
            "texto": "Estás justo en el límite recomendado (50%) de gastos fijos. Intenta no adquirir más compromisos mensuales."
        })
    else:
        analisis.append({
            "tipo": "gasto",
            "estado": "bien",
            "titulo": "Gastos controlados",
            "texto": "¡Excelente! Tus gastos fijos son sostenibles. Tienes gran capacidad para ahorrar o invertir."
        })

    # 2. ANÁLISIS DE DEUDA (Ideal: < 30% de ingresos)
    ratio_deuda = (deuda / ingresos) * 100
    if ratio_deuda > 40:
        puntaje -= 35
        analisis.append({
            "tipo": "deuda",
            "estado": "mal",
            "titulo": "Sobrenedudamiento crítico",
            "texto": f"Destinas el {ratio_deuda:.0f}% de tu dinero a pagar deudas. Esto es peligroso. Prioriza pagar las deudas con mayor tasa de interés (Método Avalancha)."
        })
    elif ratio_deuda > 30:
        puntaje -= 15
        analisis.append({
            "tipo": "deuda",
            "estado": "regular",
            "titulo": "Deuda elevada",
            "texto": "Tu nivel de deuda es manejable pero alto. Evita usar tarjetas de crédito hasta bajar este porcentaje."
        })
    else:
        analisis.append({
            "tipo": "deuda",
            "estado": "bien",
            "titulo": "Deuda saludable",
            "texto": "Tu nivel de endeudamiento es bajo. Esto te da una excelente calificación crediticia potencial."
        })

    # 3. FONDO DE EMERGENCIA (Ideal: > 3 meses de gastos)
    meses_cubiertos = ahorro / gastos if gastos > 0 else 0
    if meses_cubiertos < 1:
        puntaje -= 25
        analisis.append({
            "tipo": "ahorro",
            "estado": "mal",
            "titulo": "Vulnerable ante emergencias",
            "texto": "Tienes menos de un mes de gastos cubierto. Si pierdes tus ingresos hoy, estarías en problemas inmediatos. Tu prioridad #1 debe ser ahorrar."
        })
    elif meses_cubiertos < 3:
        puntaje -= 10
        analisis.append({
            "tipo": "ahorro",
            "estado": "regular",
            "titulo": "Fondo en construcción",
            "texto": f"Tienes cubiertos {meses_cubiertos:.1f} meses de gastos. Vas bien, pero intenta llegar a 3 meses mínimo para mayor seguridad."
        })
    else:
        analisis.append({
            "tipo": "ahorro",
            "estado": "bien",
            "titulo": "Blindaje financiero Ccompleto",
            "texto": "¡Felicidades! Tienes un fondo de emergencia sólido. Ahora podrías empezar a pensar en inversiones de mayor riesgo y rendimiento."
        })

    # Asegurar rango y mensaje general
    puntaje = max(0, min(100, puntaje))
    
    if puntaje >= 80:
        msg_general = "¡Tus finanzas están en excelente forma!"
        color_general = "success"
    elif puntaje >= 50:
        msg_general = "Tienes estabilidad, pero hay áreas de riesgo."
        color_general = "warning"
    else:
        msg_general = "Tu salud financiera requiere atención urgente."
        color_general = "danger"

    return jsonify(
        success=True, 
        puntaje=puntaje, 
        mensaje_general=msg_general,
        analisis_detallado=analisis
    )

@app.route('/sofipos')
def sofipos_view():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        flash('por favor, inicia sesión.', 'info')
        return redirect(url_for('mostrar_formulario_inicio_sesion'))
    
    usuario_data = {
        'nombres': session.get('nombres', 'usuario'),
        'apellidos': session.get('apellidos', ''),
        'correo': session.get('correo', 'correo@ejemplo.com')
    }
    return render_template('sofipos.html', usuario=usuario_data)

@app.route('/api/sofipos_data', methods=['GET'])
def get_sofipos_data():
    try:
        sofipos_list = Sofipos.query.order_by(Sofipos.tasa_anual.desc()).all()
        data = []
        for s in sofipos_list:
            data.append({
                'nombre': s.nombre,
                'tasa': float(s.tasa_anual),
                'plazo': s.plazo_dias,
                'nicap': s.nicap,
                'logo': s.logo_url,
                'url': s.url_web
            })
        return jsonify(success=True, data=data)
    except Exception as e:
        return jsonify(success=False, message=str(e))
    
@app.route('/diagnostico')
def diagnostico():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        flash('Por favor, inicia sesión para ver tu diagnóstico.', 'info')
        return redirect(url_for('mostrar_formulario_inicio_sesion'))
    
    usuario_data = {
        'nombres': session.get('nombres', 'Usuario'),
        'apellidos': session.get('apellidos', ''),
        'correo': session.get('correo', '')
    }
    return render_template('diagnostico.html', usuario=usuario_data)

# --- ELIMINADO: get_db_connection() ---
# sqlalchemy maneja las conexiones automáticamente

# sección: rutas principales de la aplicación
@app.route('/')
def index():
    return redirect(url_for('mostrar_pagina_estatica', filename='index.html'))

@app.route('/registro')
def mostrar_formulario_registro():
    return render_template('registro.html')

@app.route('/registrar_usuario', methods=['POST'])
def registrar_usuario():
    if request.method == 'POST':
        nombres = request.form.get('nombres')
        apellidos = request.form.get('apellidos')
        correo_electronico = request.form.get('correo_electronico')
        contrasena_plana = request.form.get('contrasena')

        if nombres:
            nombres = ' '.join(word.capitalize() for word in nombres.strip().split())
        if apellidos:
            apellidos = ' '.join(word.capitalize() for word in apellidos.strip().split())

        if not nombres or not apellidos or not correo_electronico or not contrasena_plana:
            flash('todos los campos son obligatorios.', 'error')
            return redirect(url_for('mostrar_formulario_registro'))

        try:
            valid_email = validate_email(correo_electronico, check_deliverability=False) 
            correo_electronico = valid_email.email
        except EmailNotValidError as e:
            flash(f'el correo electrónico "{correo_electronico}" no es válido: {e}', 'error')
            return redirect(url_for('mostrar_formulario_registro'))

        contrasena_hasheada = generate_password_hash(contrasena_plana)

        # --- REFACTORIZADO: lógica de creación con orm ---
        try:
            # 1. crear la entrada de datos personales
            nuevos_datos = DatosP(
                nombre=nombres,
                apellidoP=apellidos,
                apellidoM='', # sp enviaba esto
                telefono=None, # sp enviaba esto
                fecha_nacimiento=datetime.now() # sp enviaba esto
            )
            db.session.add(nuevos_datos)
            
            # 2. crear el usuario y vincularlo
            # usamos flush para obtener el id de nuevos_datos antes de hacer commit
            db.session.flush() 
            
            nuevo_usuario = Usuarios(
                id_datosP=nuevos_datos.id,
                correo_electronico=correo_electronico,
                contrasena=contrasena_hasheada
            )
            db.session.add(nuevo_usuario)
            
            # 3. hacer commit de ambas operaciones
            db.session.commit()

            flash('¡usuario registrado exitosamente! ahora puedes iniciar sesión.', 'success')
            return redirect(url_for('mostrar_pagina_estatica', filename='iniciar_sesion.html'))
            
        except IntegrityError: # error específico de sqlalchemy para claves únicas
            db.session.rollback()
            flash('error: el correo electrónico ya está registrado. por favor, utiliza otro.', 'error')
            return redirect(url_for('mostrar_formulario_registro'))
        except Exception as e:
            db.session.rollback()
            flash(f"ocurrió un error inesperado en el servidor: {e}", 'error')
            return redirect(url_for('mostrar_formulario_registro'))
        # 'finally' con 'conn.close()' ya no es necesario

@app.route('/iniciar_sesion')
def mostrar_formulario_inicio_sesion():
    return render_template('iniciar_sesion.html')

@app.route('/login', methods=['POST'])
def login_usuario():
    if request.method == 'POST':
        correo = request.form.get('correo')
        contrasena_ingresada = request.form.get('contrasena')

        if not correo or not contrasena_ingresada:
            return jsonify(success=False, message='por favor, ingresa tu correo y contraseña.')

        # --- REFACTORIZADO: lógica de login con orm ---
        try:
            # consulta usando el orm
            usuario = Usuarios.query.filter_by(correo_electronico=correo).first()
            
            if usuario and usuario.datosp:
                if check_password_hash(usuario.contrasena, contrasena_ingresada):
                    flash('¡bienvenido! has iniciado sesión exitosamente.', 'success')
                    
                    # actualiza la última sesión (reemplaza sp)
                    usuario.ultima_sesion = datetime.now()
                    db.session.commit()

                    session['usuario_autenticado'] = True
                    session['user_id'] = usuario.id
                    session['nombres'] = usuario.datosp.nombre
                    session['apellidos'] = usuario.datosp.apellidoP
                    session['correo'] = usuario.correo_electronico
                    session['fecha_registro'] = usuario.fecha_registro.strftime('%d de %B de %Y') if usuario.fecha_registro else 'n/a'
                    session['ultima_sesion'] = datetime.now().strftime('%d de %B de %Y, %I:%M %p')
                    session['test_completado'] = usuario.test_completado

                    return jsonify(success=True, redirect=url_for('dashboard'))
                else:
                    return jsonify(success=False, message='contraseña incorrecta. por favor, inténtalo de nuevo.')
            else:
                return jsonify(success=False, message='correo electrónico no registrado.')
            
        except Exception as e:
            print(f"Error inesperado en login: {e}")
            return jsonify(success=False, message=f"ocurrió un error inesperado en el servidor: {e}")
        # 'finally' con 'conn.close()' ya no es necesario

@app.route('/dashboard')
def dashboard():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        flash('por favor, inicia sesión para acceder al dashboard.', 'info')
        return redirect(url_for('mostrar_formulario_inicio_sesion'))
    
    usuario_data = {
        'id': session.get('user_id'),
        'nombres': session.get('nombres', 'usuario'),
        'apellidos': session.get('apellidos', ''),
        'correo': session.get('correo', 'correo@example.com'),
        'fecha_registro': session.get('fecha_registro', 'n/a'),
        'ultima_sesion': session.get('ultima_sesion', 'n/a'),
        'test_completado': session.get('test_completado', False) # pasar el estado del test
    }
    return render_template('dashboard.html', usuario=usuario_data)

@app.route('/actualizar_perfil', methods=['POST'])
def actualizar_perfil():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        flash('por favor, inicia sesión para actualizar tu perfil.', 'error')
        return redirect(url_for('mostrar_formulario_inicio_sesion'))

    user_id = session.get('user_id')
    if not user_id:
        flash('error: no se pudo encontrar el id de usuario en la sesión.', 'error')
        return redirect(url_for('dashboard'))

    nombres = request.form.get('nombres')
    apellidos = request.form.get('apellidos')
    
    if nombres: nombres = ' '.join(word.capitalize() for word in nombres.strip().split())
    if apellidos: apellidos = ' '.join(word.capitalize() for word in apellidos.strip().split())

    # --- REFACTORIZADO: lógica de actualización con orm ---
    try:
        # 1. encontrar el usuario y sus datos
        usuario = Usuarios.query.get(user_id)
        
        if usuario and usuario.datosp:
            # 2. actualizar los datos en el objeto
            usuario.datosp.nombre = nombres
            usuario.datosp.apellidoP = apellidos
            
            # 3. hacer commit de los cambios
            db.session.commit()

            session['nombres'] = nombres
            session['apellidos'] = apellidos

            flash('tu perfil ha sido actualizado exitosamente.', 'success')
        else:
            flash('error: no se pudo encontrar el usuario para actualizar.', 'error')
            
        return redirect(url_for('dashboard'))
    
    except Exception as e:
        db.session.rollback()
        flash(f"ocurrió un error inesperado al actualizar tu perfil: {e}", 'error')
        return redirect(url_for('dashboard'))
    # 'finally' con 'conn.close()' ya no es necesario

@app.route('/cambiar_contrasena', methods=['POST'])
def cambiar_contrasena():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        return jsonify(success=False, message='por favor, inicia sesión para cambiar tu contraseña.')

    user_id = session.get('user_id')
    if not user_id:
        return jsonify(success=False, message='error: no se pudo encontrar el id de usuario en la sesión.')

    contrasena_actual = request.form.get('contrasena_actual')
    nueva_contrasena = request.form.get('nueva_contrasena')
    confirmar_nueva_contrasena = request.form.get('confirmar_nueva_contrasena')

    # (validaciones de campos se mantienen igual)
    if not contrasena_actual or not nueva_contrasena or not confirmar_nueva_contrasena:
        return jsonify(success=False, message='todos los campos de contraseña son obligatorios.')
    if nueva_contrasena != confirmar_nueva_contrasena:
        return jsonify(success=False, message='la nueva contraseña y su confirmación no coinciden.')
    if not re.search(r'[A-Z]', nueva_contrasena):
        return jsonify(success=False, message='la nueva contraseña debe contener al menos una letra mayúscula.')
    if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?~]', nueva_contrasena):
        return jsonify(success=False, message='la nueva contraseña debe contener al menos un carácter especial.')
    if not (8 <= len(nueva_contrasena) <= 25):
        return jsonify(success=False, message='la nueva contraseña debe tener entre 8 y 25 caracteres.')

    # --- REFACTORIZADO: lógica de cambio de contraseña con orm ---
    try:
        # 1. encontrar al usuario
        usuario = Usuarios.query.get(user_id)

        if usuario and check_password_hash(usuario.contrasena, contrasena_actual):
            # 2. actualizar la contraseña en el objeto
            usuario.contrasena = generate_password_hash(nueva_contrasena)
            
            # 3. hacer commit
            db.session.commit()
            return jsonify(success=True, message='tu contraseña ha sido cambiada exitosamente.')
        else:
            return jsonify(success=False, message='la contraseña actual es incorrecta.')
        
    except Exception as e:
        db.session.rollback()
        return jsonify(success=False, message=f"ocurrió un error inesperado al cambiar contraseña: {e}")
    # 'finally' con 'conn.close()' ya no es necesario

# --- NUEVO: ruta para delete (crud completo) ---
@app.route('/eliminar_cuenta', methods=['POST'])
def eliminar_cuenta():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        flash('por favor, inicia sesión para eliminar tu cuenta.', 'error')
        return redirect(url_for('mostrar_formulario_inicio_sesion'))
        
    user_id = session.get('user_id')
    contrasena_ingresada = request.form.get('contrasena_confirmar_eliminar')

    if not contrasena_ingresada:
        flash('debes ingresar tu contraseña para confirmar la eliminación.', 'error')
        return redirect(url_for('dashboard')) # o donde tengas el modal de eliminar

    try:
        usuario = Usuarios.query.get(user_id)
        
        if usuario and check_password_hash(usuario.contrasena, contrasena_ingresada):
            # tenemos que eliminar datosp primero, o configurar 'cascade'
            # es más simple eliminar ambos manualmente si no hay 'cascade'
            
            datosp = usuario.datosp
            
            # el 'cascade' en el modelo se encarga de los resultados_test
            db.session.delete(usuario)
            if datosp:
                db.session.delete(datosp) # eliminar datosp asociados
            
            db.session.commit()
            
            session.clear()
            flash('tu cuenta y todos tus datos han sido eliminados permanentemente.', 'success')
            return redirect(url_for('index'))
        else:
            flash('contraseña incorrecta. no se pudo eliminar la cuenta.', 'error')
            return redirect(url_for('dashboard')) # o donde tengas el modal

    except Exception as e:
        db.session.rollback()
        flash(f'ocurrió un error al intentar eliminar tu cuenta: {e}', 'error')
        return redirect(url_for('dashboard'))


@app.route('/logout')
def logout():
    session.clear()
    flash('has cerrado sesión exitosamente.', 'info')
    return redirect(url_for('mostrar_pagina_estatica', filename='index.html'))

@app.route('/terminos_y_condiciones')
def terminos_y_condiciones():
    return render_template('terminos_y_condiciones.html')

# sección: rutas para simuladores (se mantienen sin cambios)
@app.route('/simulador_ahorro')
def simulador_ahorro():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        flash('por favor, inicia sesión para acceder al simulador de ahorro.', 'info')
        return redirect(url_for('mostrar_formulario_inicio_sesion'))
    usuario_data = {
        'nombres': session.get('nombres', 'usuario'),
        'apellidos': session.get('apellidos', ''),
        'correo': session.get('correo', 'correo@ejemplo.com')
    }
    return render_template('simulador_ahorro.html', usuario=usuario_data)

@app.route('/<path:filename>')
def mostrar_pagina_estatica(filename):
    from flask import send_from_directory
    return send_from_directory(app.root_path, filename)

@app.route('/simulador_credito')
def simulador_credito():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        flash('por favor, inicia sesión para acceder al simulador de crédito.', 'info')
        return redirect(url_for('mostrar_formulario_inicio_sesion'))
    usuario_data = {
        'nombres': session.get('nombres', 'usuario'),
        'apellidos': session.get('apellidos', ''),
        'correo': session.get('correo', 'correo@ejemplo.com')
    }
    return render_template('simulador_credito.html', usuario=usuario_data)

@app.route('/simulador_inversion')
def simulador_inversion():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        flash('por favor, inicia sesión para acceder al simulador de inversión.', 'info')
        return redirect(url_for('mostrar_formulario_inicio_sesion'))
    usuario_data = {
        'nombres': session.get('nombres', 'usuario'),
        'apellidos': session.get('apellidos', ''),
        'correo': session.get('correo', 'correo@ejemplo.com')
    }
    return render_template('simulador_inversion.html', usuario=usuario_data)

@app.route('/simulador_presupuesto_personal')
def simulador_presupuesto_personal():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        flash('por favor, inicia sesión para acceder al simulador de presupuesto personal.', 'info')
        return redirect(url_for('mostrar_formulario_inicio_sesion'))
    usuario_data = {
        'nombres': session.get('nombres', 'usuario'),
        'apellidos': session.get('apellidos', ''),
        'correo': session.get('correo', 'correo@ejemplo.com')
    }
    return render_template('simulador_presupuesto_personal.html', usuario=usuario_data)

@app.route('/simulador_retiro_jubilacion')
def simulador_retiro_jubilacion():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        flash('por favor, inicia sesión para acceder al simulador de retiro/jubilación.', 'info')
        return redirect(url_for('mostrar_formulario_inicio_sesion'))
    usuario_data = {
        'nombres': session.get('nombres', 'usuario'),
        'apellidos': session.get('apellidos', ''),
        'correo': session.get('correo', 'correo@ejemplo.com')
    }
    return render_template('simulador_retiro_jubilacion.html', usuario=usuario_data)

@app.route('/calculadora_deuda')
def calculadora_deuda():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        flash('por favor, inicia sesión para acceder al simulador de retiro/jubilación.', 'info')
        return redirect(url_for('mostrar_formulario_inicio_sesion'))
    usuario_data = {
        'nombres': session.get('nombres', 'usuario'),
        'apellidos': session.get('apellidos', ''),
        'correo': session.get('correo', 'correo@ejemplo.com')
    }
    return render_template('calculadora_deuda.html', usuario=usuario_data)

# sección: nueva ruta para el glosario
@app.route('/glosario')
def glosario():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        flash('por favor, inicia sesión para acceder al glosario.', 'info')
        return redirect(url_for('mostrar_formulario_inicio_sesion'))
    usuario_data = {
        'nombres': session.get('nombres', 'usuario'),
        'apellidos': session.get('apellidos', ''),
        'correo': session.get('correo', 'correo@ejemplo.com')
    }
    return render_template('glosario.html', usuario=usuario_data)


# sección: rutas para el test de conocimientos financieros
@app.route('/api/preguntas_test', methods=['GET'])
def get_preguntas_test():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        return jsonify(message='no autorizado para acceder a las preguntas del test.'), 401

    user_id = session.get('user_id')
    
    # --- REFACTORIZADO: lógica de test con orm ---
    try:
        usuario = Usuarios.query.get(user_id)

        if usuario.test_completado:
            last_result = ResultadosTest.query.filter_by(usuario_id=user_id)\
                .order_by(ResultadosTest.fecha_realizacion.desc())\
                .first()
            
            if last_result:
                return jsonify(
                    test_completado=True,
                    score=last_result.puntuacion,
                    total=last_result.total_preguntas,
                    puntuacion_total=last_result.puntuacion_total,
                    tiempo_resolucion_segundos=float(last_result.tiempo_resolucion_segundos)
                )
            else:
                return jsonify(test_completado=True, score=0, total=0, puntuacion_total=0, tiempo_resolucion_segundos=0.0)

        # cargar preguntas con sus relaciones (opciones, categoria, etc.)
        preguntas_db = PreguntasTest.query\
            .options(db.joinedload(PreguntasTest.opciones))\
            .options(db.joinedload(PreguntasTest.tipo_pregunta))\
            .options(db.joinedload(PreguntasTest.dificultad))\
            .options(db.joinedload(PreguntasTest.categoria))\
            .all()
        
        preguntas = []
        for pt in preguntas_db:
            preguntas.append({
                'id': pt.id,
                'pregunta': pt.pregunta,
                'tipo_pregunta': pt.tipo_pregunta.nombre if pt.tipo_pregunta else None,
                'dificultad': pt.dificultad.nombre if pt.dificultad else None,
                'categoria': pt.categoria.nombre if pt.categoria else None,
                'respuesta_texto_correcta': pt.respuesta_texto_correcta,
                'opciones': [{
                    'id': op.id,
                    'texto': op.texto_opcion,
                    'es_correcta': op.es_correcta
                } for op in pt.opciones]
            })
        
        return jsonify(test_completado=False, preguntas=preguntas)
    
    except Exception as e:
        print(f"error inesperado al obtener preguntas: {e}")
        return jsonify(message=f"error inesperado en el servidor: {e}"), 500
    # 'finally' con 'conn.close()' ya no es necesario

@app.route('/api/submit_test', methods=['POST'])
def submit_test():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        return jsonify(message='no autorizado para enviar el test.'), 401

    user_id = session.get('user_id')
    data = request.json
    respuestas_usuario = data.get('respuestas', {})
    puntuacion_total_calculada = data.get('puntuacion_total', 0)
    tiempo_total_segundos = data.get('tiempo_total_segundos', 0.0)
    respuestas_correctas_count = data.get('respuestas_correctas_count', 0) 

    if not respuestas_usuario:
        return jsonify(success=False, message='no se recibieron respuestas.'), 400

    # --- REFACTORIZADO: lógica de envío de test con orm ---
    try:
        usuario = Usuarios.query.get(user_id)

        if usuario.test_completado:
            return jsonify(success=False, message='ya has completado el test. no puedes enviarlo de nuevo.'), 403

        # guardar los resultados (reemplaza sp)
        nuevo_resultado = ResultadosTest(
            usuario_id=user_id,
            puntuacion=respuestas_correctas_count,
            total_preguntas=len(respuestas_usuario),
            puntuacion_total=puntuacion_total_calculada,
            tiempo_resolucion_segundos=tiempo_total_segundos
        )
        db.session.add(nuevo_resultado)
        
        # actualizar al usuario (reemplaza sp)
        usuario.test_completado = True
        
        db.session.commit()
        
        session['test_completado'] = True

        return jsonify(
            success=True,
            score=respuestas_correctas_count, 
            total=len(respuestas_usuario), 
            puntuacion_total=puntuacion_total_calculada, 
            tiempo_resolucion_segundos=tiempo_total_segundos,
            message='test enviado y guardado exitosamente.'
        )

    except Exception as e:
        db.session.rollback()
        print(f"error inesperado al enviar test: {e}")
        return jsonify(success=False, message=f"error inesperado en el servidor: {e}"), 500
    # 'finally' con 'conn.close()' ya no es necesario

@app.route('/api/ranking', methods=['GET'])
def get_ranking():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        return jsonify(message='no autorizado para acceder al ranking.'), 401

    user_id = session.get('user_id')
    
    # --- REFACTORIZADO: lógica de ranking con orm ---
    try:
        # obtener el top 10 del ranking
        top_ranking_db = ResultadosTest.query\
            .join(ResultadosTest.usuario)\
            .join(Usuarios.datosp)\
            .order_by(ResultadosTest.puntuacion_total.desc(), ResultadosTest.tiempo_resolucion_segundos.asc())\
            .limit(10)\
            .all()

        ranking = []
        for i, rt in enumerate(top_ranking_db):
            ranking.append({
                'posicion': i + 1,
                'nombres': rt.usuario.datosp.nombre,
                'apellidos': rt.usuario.datosp.apellidoP,
                'puntuacion_total': rt.puntuacion_total,
                'tiempo_resolucion_segundos': float(rt.tiempo_resolucion_segundos),
                'respuestas_correctas': rt.puntuacion
            })

        # obtener el resultado del usuario actual
        user_in_top_10 = any(rt.usuario_id == user_id for rt in top_ranking_db)
        user_result = None
        user_position = -1

        if not user_in_top_10:
            user_raw_result = ResultadosTest.query.filter_by(usuario_id=user_id).first()

            if user_raw_result:
                user_result = {
                    'nombres': user_raw_result.usuario.datosp.nombre,
                    'apellidos': user_raw_result.usuario.datosp.apellidoP,
                    'puntuacion_total': user_raw_result.puntuacion_total,
                    'tiempo_resolucion_segundos': float(user_raw_result.tiempo_resolucion_segundos),
                    'respuestas_correctas': user_raw_result.puntuacion
                }
                
                # calcular la posición del usuario
                # (esta consulta es más simple con sql puro, pero se puede hacer con el orm)
                user_position = db.session.query(ResultadosTest.id)\
                    .filter(ResultadosTest.puntuacion_total > user_raw_result.puntuacion_total)\
                    .count() + 1

        return jsonify(success=True, ranking=ranking, user_result=user_result, user_position=user_position)

    except Exception as e:
        print(f"error inesperado al obtener ranking: {e}")
        return jsonify(success=False, message=f"error inesperado en el servidor: {e}"), 500
    # 'finally' con 'conn.close()' ya no es necesario

# sección: ejecución de la aplicación
if __name__ == '__main__':
    # (opcional) crea las tablas si no existen antes de correr la app
    with app.app_context():
        db.create_all()
    app.run(debug=True)