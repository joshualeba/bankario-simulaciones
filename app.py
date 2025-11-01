import os
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import pyodbc
from werkzeug.security import generate_password_hash, check_password_hash
from email_validator import validate_email, EmailNotValidError
from datetime import datetime
from werkzeug.utils import secure_filename
import re # importar re para expresiones regulares

# sección: configuración de la aplicación flask
app = Flask(__name__,
            template_folder=os.path.abspath('.'),
            static_folder=os.path.abspath('.'))

app.secret_key = 'mercysecret'

# sección: configuración de la conexión a la base de datos
DB_CONFIG = {
    'driver': '{ODBC Driver 18 for SQL Server};TrustServerCertificate=yes;', 
    'server': '.',
    'database': 'bankario_db_v2'
}

# carpeta para subir imágenes de perfil (aunque no se usa en este ejemplo, se mantiene)
UPLOAD_FOLDER = 'multimedia'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# crear la carpeta de uploads si no existe
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# sección: función para obtener conexión a la base de datos
def get_db_connection():
    try:
        cnxn = pyodbc.connect(
            f"DRIVER={DB_CONFIG['driver']}"
            f"SERVER={DB_CONFIG['server']};"
            f"DATABASE={DB_CONFIG['database']};"
            f"trusted_connection=yes;"
        )
        print("conexión a la base de datos establecida con éxito.")
        return cnxn
    except pyodbc.Error as ex:
        sqlstate = ex.args[0]
        print(f"error al conectar a la base de datos (sqlstate: {sqlstate}): {ex}")
        raise

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

        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Usar el procedimiento almacenado para crear el usuario completo
            cursor.execute("""
                EXEC sp_crear_nuevo_usuario 
                @nombre_persona = ?, 
                @apellidoP = ?, 
                @apellidoM = ?, 
                @telefono = ?, 
                @fecha_nacimiento = ?, 
                @email_persona = ?, 
                @contrasena_segura = ?
            """, (nombres, apellidos, '', None, datetime.now(), correo_electronico, contrasena_hasheada))
            
            conn.commit()

            flash('¡usuario registrado exitosamente! ahora puedes iniciar sesión.', 'success')
            return redirect(url_for('mostrar_pagina_estatica', filename='iniciar_sesion.html'))
            
        except pyodbc.Error as ex:
            sqlstate = ex.args[0]
            if sqlstate == '23000':
                flash('error: el correo electrónico ya está registrado. por favor, utiliza otro.', 'error')
            else:
                flash(f"ocurrió un error en la base de datos: {ex}", 'error')
            return redirect(url_for('mostrar_formulario_registro'))
        except Exception as e:
            flash(f"ocurrió un error inesperado en el servidor: {e}", 'error')
            return redirect(url_for('mostrar_formulario_registro'))
        finally:
            if conn:
                conn.close()

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

        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Consulta corregida para el login
            cursor.execute("""
                SELECT u.id, u.contrasena, dp.nombre, dp.apellidoP, u.correo_electronico,
                       u.fecha_registro, u.ultima_sesion, u.test_completado
                FROM usuarios u
                JOIN DatosP dp ON u.id_datosP = dp.id
                WHERE u.correo_electronico = ?
            """, (correo,))
            resultado = cursor.fetchone()
            
            if resultado:
                user_id = resultado[0]
                contrasena_hasheada_db = resultado[1]
                nombres_usuario = resultado[2]
                apellidos_usuario = resultado[3]
                correo_usuario = resultado[4]
                fecha_registro = resultado[5]
                ultima_sesion = resultado[6]
                test_completado = bool(resultado[7])

                if check_password_hash(contrasena_hasheada_db, contrasena_ingresada):
                    flash('¡bienvenido! has iniciado sesión exitosamente.', 'success')
                    
                    # Usar el procedimiento almacenado para actualizar la última sesión
                    cursor.execute("EXEC sp_actualizar_fecha_ultima_sesion @id_usuario_que_entro = ?", (user_id,))
                    conn.commit()

                    session['usuario_autenticado'] = True
                    session['user_id'] = user_id
                    session['nombres'] = nombres_usuario
                    session['apellidos'] = apellidos_usuario
                    session['correo'] = correo_usuario
                    session['fecha_registro'] = fecha_registro.strftime('%d de %B de %Y') if fecha_registro else 'n/a'
                    session['ultima_sesion'] = datetime.now().strftime('%d de %B de %Y, %I:%M %p')
                    session['test_completado'] = test_completado

                    return jsonify(success=True, redirect=url_for('dashboard'))
                else:
                    return jsonify(success=False, message='contraseña incorrecta. por favor, inténtalo de nuevo.')
            else:
                return jsonify(success=False, message='correo electrónico no registrado.')
            
        except pyodbc.Error as ex:
            print(f"Error de base de datos en login: {ex}")
            return jsonify(success=False, message=f"ocurrió un error en la base de datos: {ex}")
        except Exception as e:
            print(f"Error inesperado en login: {e}")
            return jsonify(success=False, message=f"ocurrió un error inesperado en el servidor: {e}")
        finally:
            if conn:
                conn.close()

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
        'test_completado': session.get('test_completado', False) # Pasar el estado del test
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

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Obtener el id_datosP del usuario
        cursor.execute("SELECT id_datosP FROM usuarios WHERE id = ?", (user_id,))
        id_datosP = cursor.fetchone()[0]

        # Actualizar los datos en la tabla DatosP
        sql_update_datosp = "UPDATE DatosP SET nombre = ?, apellidoP = ? WHERE id = ?"
        cursor.execute(sql_update_datosp, (nombres, apellidos, id_datosP))
        conn.commit()

        session['nombres'] = nombres
        session['apellidos'] = apellidos

        flash('tu perfil ha sido actualizado exitosamente.', 'success')
        return redirect(url_for('dashboard'))
    except pyodbc.Error as ex:
        flash(f"ocurrió un error en la base de datos al actualizar tu perfil: {ex}", 'error')
        return redirect(url_for('dashboard'))
    except Exception as e:
        flash(f"ocurrió un error inesperado al actualizar tu perfil: {e}", 'error')
        return redirect(url_for('dashboard'))
    finally:
        if conn:
            conn.close()

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

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT contrasena FROM usuarios WHERE id = ?", (user_id,))
        resultado = cursor.fetchone()

        if resultado and check_password_hash(resultado[0], contrasena_actual):
            nueva_contrasena_hasheada = generate_password_hash(nueva_contrasena)
            sql_update_contrasena = "UPDATE usuarios SET contrasena = ? WHERE id = ?"
            cursor.execute(sql_update_contrasena, (nueva_contrasena_hasheada, user_id))
            conn.commit()
            return jsonify(success=True, message='tu contraseña ha sido cambiada exitosamente.')
        else:
            return jsonify(success=False, message='la contraseña actual es incorrecta.')
        
    except pyodbc.Error as ex:
        return jsonify(success=False, message=f"ocurrió un error en la base de datos al cambiar tu contraseña: {ex}")
    except Exception as e:
        return jsonify(success=False, message=f"ocurrió un error inesperado al cambiar contraseña: {e}")
    finally:
        if conn:
            conn.close()

@app.route('/logout')
def logout():
    session.clear()
    flash('has cerrado sesión exitosamente.', 'info')
    return redirect(url_for('mostrar_pagina_estatica', filename='index.html'))

@app.route('/terminos_y_condiciones')
def terminos_y_condiciones():
    return render_template('terminos_y_condiciones.html')

# sección: rutas para simuladores (se mantienen sin cambios funcionales para este request)
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

# Sección: Nueva ruta para el glosario
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
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # verificar si el usuario ya ha completado el test
        cursor.execute("SELECT test_completado FROM usuarios WHERE id = ?", (user_id,))
        test_completado = bool(cursor.fetchone()[0])

        if test_completado:
            # si el test ya está completado, obtener los últimos resultados del usuario
            cursor.execute("""
                SELECT puntuacion, total_preguntas, puntuacion_total, tiempo_resolucion_segundos
                FROM resultados_test
                WHERE usuario_id = ?
                ORDER BY fecha_realizacion DESC
            """, (user_id,))
            last_result = cursor.fetchone()
            
            if last_result:
                return jsonify(
                    test_completado=True,
                    score=last_result[0],
                    total=last_result[1],
                    puntuacion_total=last_result[2],
                    tiempo_resolucion_segundos=float(last_result[3])
                )
            else:
                # esto no debería ocurrir si test_completado es true, pero por si acaso
                return jsonify(test_completado=True, score=0, total=0, puntuacion_total=0, tiempo_resolucion_segundos=0.0)

        # si el test no está completado, proceder a obtener las preguntas
        cursor.execute("""
            SELECT pt.id, pt.pregunta, tp.nombre AS tipo_pregunta, d.nombre AS dificultad, c.nombre AS categoria,
                   op.id AS opcion_id, op.texto_opcion, op.es_correcta,
                   pt.respuesta_texto_correcta
            FROM preguntas_test pt
            LEFT JOIN Tipo_Preguntas tp ON pt.id_tipoPregunta = tp.id
            LEFT JOIN Dificultades d ON pt.id_dificultad = d.id
            LEFT JOIN Categorias c ON pt.id_categoria = c.id
            LEFT JOIN opciones_respuesta op ON pt.id = op.pregunta_id
            ORDER BY pt.id, op.id
        """)
        
        preguntas_raw = cursor.fetchall()
        
        preguntas = {}
        for row in preguntas_raw:
            pregunta_id = row[0]
            if pregunta_id not in preguntas:
                preguntas[pregunta_id] = {
                    'id': pregunta_id,
                    'pregunta': row[1],
                    'tipo_pregunta': row[2],
                    'dificultad': row[3],
                    'categoria': row[4],
                    'respuesta_texto_correcta': row[8],
                    'opciones': []
                }
            if row[5] is not None:
                preguntas[pregunta_id]['opciones'].append({
                    'id': row[5],
                    'texto': row[6],
                    'es_correcta': bool(row[7])
                })
        
        return jsonify(test_completado=False, preguntas=list(preguntas.values()))
    except pyodbc.Error as ex:
        print(f"error de base de datos al obtener preguntas: {ex}")
        return jsonify(message=f"error en la base de datos: {ex}"), 500
    except Exception as e:
        print(f"error inesperado al obtener preguntas: {e}")
        return jsonify(message=f"error inesperado en el servidor: {e}"), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/submit_test', methods=['POST'])
def submit_test():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        return jsonify(message='no autorizado para enviar el test.'), 401

    user_id = session.get('user_id')
    data = request.json
    respuestas_usuario = data.get('respuestas', {})
    puntuacion_total_calculada = data.get('puntuacion_total', 0)
    tiempo_total_segundos = data.get('tiempo_total_segundos', 0.0)
    respuestas_correctas_count = data.get('respuestas_correctas_count', 0) # El 'score' que viene de JS

    if not respuestas_usuario:
        return jsonify(success=False, message='no se recibieron respuestas.'), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # verificar si el usuario ya ha completado el test
        cursor.execute("SELECT test_completado FROM usuarios WHERE id = ?", (user_id,))
        test_completado_db = bool(cursor.fetchone()[0])

        if test_completado_db:
            return jsonify(success=False, message='ya has completado el test. no puedes enviarlo de nuevo.'), 403

        # Guardar los resultados usando el procedimiento almacenado
        cursor.execute("EXEC sp_guardar_test_completado @id_usuario_del_test = ?, @respuestas_correctas = ?, @cantidad_total_preguntas = ?, @puntuacion_final_con_tiempo = ?, @tiempo_segundos = ?",
                       (user_id, respuestas_correctas_count, len(respuestas_usuario), puntuacion_total_calculada, tiempo_total_segundos))
        
        conn.commit()
        
        # actualizar la sesión del usuario
        session['test_completado'] = True

        return jsonify(
            success=True,
            score=respuestas_correctas_count, # Respuestas correctas
            total=len(respuestas_usuario), # Total de preguntas
            puntuacion_total=puntuacion_total_calculada, # Puntuación con tiempo
            tiempo_resolucion_segundos=tiempo_total_segundos,
            message='test enviado y guardado exitosamente.'
        )

    except pyodbc.Error as ex:
        print(f"error de base de datos al enviar test: {ex}")
        return jsonify(success=False, message=f"error en la base de datos al guardar resultados: {ex}"), 500
    except Exception as e:
        print(f"error inesperado al enviar test: {e}")
        return jsonify(success=False, message=f"error inesperado en el servidor: {e}"), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/ranking', methods=['GET'])
def get_ranking():
    if 'usuario_autenticado' not in session or not session['usuario_autenticado']:
        return jsonify(message='no autorizado para acceder al ranking.'), 401

    user_id = session.get('user_id')
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # obtener el top 10 del ranking
        cursor.execute("""
            SELECT TOP 10
                dp.nombre,
                dp.apellidoP,
                rt.puntuacion_total,
                rt.tiempo_resolucion_segundos,
                rt.puntuacion AS respuestas_correctas
            FROM resultados_test rt
            JOIN usuarios u ON rt.usuario_id = u.id
            JOIN DatosP dp ON u.id_datosP = dp.id
            ORDER BY rt.puntuacion_total DESC, rt.tiempo_resolucion_segundos ASC
        """)
        top_ranking_raw = cursor.fetchall()

        ranking = []
        for i, row in enumerate(top_ranking_raw):
            ranking.append({
                'posicion': i + 1,
                'nombres': row[0],
                'apellidos': row[1],
                'puntuacion_total': row[2],
                'tiempo_resolucion_segundos': float(row[3]),
                'respuestas_correctas': row[4]
            })

        # obtener el resultado del usuario actual si no está en el top 10
        user_in_top_10 = any(r['nombres'] == session['nombres'] and r['apellidos'] == session['apellidos'] for r in ranking)
        user_result = None
        user_position = -1

        if not user_in_top_10:
            cursor.execute("""
                SELECT
                    dp.nombre,
                    dp.apellidoP,
                    rt.puntuacion_total,
                    rt.tiempo_resolucion_segundos,
                    rt.puntuacion AS respuestas_correctas
                FROM resultados_test rt
                JOIN usuarios u ON rt.usuario_id = u.id
                JOIN DatosP dp ON u.id_datosP = dp.id
                WHERE rt.usuario_id = ?
                ORDER BY rt.puntuacion_total DESC, rt.tiempo_resolucion_segundos ASC
            """, (user_id,))
            user_raw_result = cursor.fetchone()

            if user_raw_result:
                user_result = {
                    'nombres': user_raw_result[0],
                    'apellidos': user_raw_result[1],
                    'puntuacion_total': user_raw_result[2],
                    'tiempo_resolucion_segundos': float(user_raw_result[3]),
                    'respuestas_correctas': user_raw_result[4]
                }
                # calcular la posición del usuario
                cursor.execute("""
                    SELECT COUNT(DISTINCT rt2.puntuacion_total) + 1
                    FROM resultados_test rt2
                    WHERE rt2.puntuacion_total > ?
                """, (user_result['puntuacion_total'],))
                user_position = cursor.fetchone()[0]

        return jsonify(success=True, ranking=ranking, user_result=user_result, user_position=user_position)

    except pyodbc.Error as ex:
        print(f"error de base de datos al obtener ranking: {ex}")
        return jsonify(success=False, message=f"error en la base de datos: {ex}"), 500
    except Exception as e:
        print(f"error inesperado al obtener ranking: {e}")
        return jsonify(success=False, message=f"error inesperado en el servidor: {e}"), 500
    finally:
        if conn:
            conn.close()

# sección: ejecución de la aplicación
if __name__ == '__main__':
    app.run(debug=True)