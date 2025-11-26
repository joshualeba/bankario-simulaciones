from app import app, db
from app import Tipo_Preguntas, Dificultades, Categorias, PreguntasTest, OpcionesRespuesta, Sofipos

def seed_database():
    with app.app_context():
        print("Iniciando la carga de datos (Semilla)...")
        
        # 1. CREAR CATALOGOS (Si no existen)
        
        # Tipos de Preguntas
        tipos = ['multiple_choice', 'true_false', 'fill_in_the_blank']
        mapa_tipos = {}
        for t in tipos:
            obj = Tipo_Preguntas.query.filter_by(nombre=t).first()
            if not obj:
                obj = Tipo_Preguntas(nombre=t)
                db.session.add(obj)
            mapa_tipos[t] = obj
        
        # Dificultades
        dificultades = ['facil', 'medio', 'dificil']
        mapa_dificultades = {}
        for d in dificultades:
            obj = Dificultades.query.filter_by(nombre=d).first()
            if not obj:
                obj = Dificultades(nombre=d)
                db.session.add(obj)
            mapa_dificultades[d] = obj

        # Categorias
        categorias = ['ahorro', 'seguros', 'presupuesto', 'economía', 'inversiones', 'deuda', 'ingresos']
        mapa_categorias = {}
        for c in categorias:
            obj = Categorias.query.filter_by(nombre=c).first()
            if not obj:
                obj = Categorias(nombre=c)
                db.session.add(obj)
            mapa_categorias[c] = obj
            
        db.session.commit() # Guardar catálogos para obtener sus IDs
        print("Catálogos cargados.")

        # 2. CREAR PREGUNTAS (Evitando duplicados)
        
        # Lista de preguntas basada en tu SQL
        lista_preguntas = [
            {
                "txt": "¿Qué es el interés simple?",
                "tipo": "multiple_choice", "dif": "facil", "cat": "ahorro",
                "opciones": [
                    ("Intereses calculados solo sobre el capital inicial.", True),
                    ("Intereses calculados sobre el capital y los intereses acumulados.", False),
                    ("Un porcentaje fijo aplicado mensualmente.", False),
                    ("La ganancia de capital en una inversión.", False)
                ]
            },
            {
                "txt": "El seguro de vida es una forma de inversión.",
                "tipo": "true_false", "dif": "facil", "cat": "seguros",
                "opciones": [
                    ("Verdadero", False),
                    ("Falso", True)
                ]
            },
            {
                "txt": "El ______ compuesto permite que tus intereses generen más intereses con el tiempo.",
                "tipo": "fill_in_the_blank", "dif": "facil", "cat": "ahorro",
                "correcta_texto": "Interés"
            },
            {
                "txt": "¿Cuál de los siguientes es un gasto fijo?",
                "tipo": "multiple_choice", "dif": "medio", "cat": "presupuesto",
                "opciones": [
                    ("Comidas en restaurantes.", False),
                    ("Alquiler.", True),
                    ("Entretenimiento.", False),
                    ("Ropa nueva.", False)
                ]
            },
            {
                "txt": "Los fondos de emergencia deben ser fáciles de acceder.",
                "tipo": "true_false", "dif": "medio", "cat": "ahorro",
                "opciones": [("Verdadero", True), ("Falso", False)]
            },
            {
                "txt": "La inflación reduce el ______ de tu dinero con el tiempo.",
                "tipo": "fill_in_the_blank", "dif": "medio", "cat": "economía",
                "correcta_texto": "poder adquisitivo"
            },
            {
                "txt": "¿Qué es un fondo mutuo?",
                "tipo": "multiple_choice", "dif": "medio", "cat": "inversiones",
                "opciones": [
                    ("Un tipo de préstamo bancario.", False),
                    ("Una cuenta de ahorro de alto rendimiento.", False),
                    ("Un vehículo de inversión que agrupa dinero de múltiples inversores.", True),
                    ("Una tarjeta de crédito con beneficios.", False)
                ]
            },
            {
                "txt": "Pagar solo el mínimo de tu tarjeta de crédito te ayudará a salir de la deuda rápidamente.",
                "tipo": "true_false", "dif": "dificil", "cat": "deuda",
                "opciones": [("Verdadero", False), ("Falso", True)]
            },
            {
                "txt": "El ______ es la cantidad de dinero que ganas antes de que se deduzcan los impuestos y otras retenciones.",
                "tipo": "fill_in_the_blank", "dif": "facil", "cat": "ingresos",
                "correcta_texto": "salario bruto"
            },
            {
                "txt": "¿Cuál es un beneficio clave de diversificar tus inversiones?",
                "tipo": "multiple_choice", "dif": "dificil", "cat": "inversiones",
                "opciones": [
                    ("Garantiza mayores rendimientos.", False),
                    ("Reduce el riesgo general de la cartera.", True),
                    ("Aumenta la liquidez de tus activos.", False),
                    ("Elimina la necesidad de investigación de mercado.", False)
                ]
            }
        ]

        for p_data in lista_preguntas:
            # Verificar si la pregunta ya existe para no duplicar
            existe = PreguntasTest.query.filter_by(pregunta=p_data["txt"]).first()
            if not existe:
                nueva_p = PreguntasTest(
                    pregunta=p_data["txt"],
                    id_tipoPregunta=mapa_tipos[p_data["tipo"]].id,
                    id_dificultad=mapa_dificultades[p_data["dif"]].id,
                    id_categoria=mapa_categorias[p_data["cat"]].id,
                    respuesta_texto_correcta=p_data.get("correcta_texto")
                )
                db.session.add(nueva_p)
                db.session.flush() # Para obtener el ID de la pregunta

                # Agregar opciones si existen
                if "opciones" in p_data:
                    for texto, es_correcta in p_data["opciones"]:
                        opcion = OpcionesRespuesta(
                            pregunta_id=nueva_p.id,
                            texto_opcion=texto,
                            es_correcta=es_correcta
                        )
                        db.session.add(opcion)
        
        db.session.commit()
        print("Preguntas cargadas.")

        # 3. CREAR SOFIPOS
        lista_sofipos = [
            ('Nu México', 14.75, 1, 1, 'https://nu.com.mx'),
            ('Finsus', 15.01, 365, 1, 'https://finsus.mx'),
            ('SuperTasas', 13.50, 364, 1, 'https://supertasas.com'),
            ('Klar', 16.00, 30, 1, 'https://www.klar.mx'),
            ('Kubo Financiero', 13.80, 365, 1, 'https://www.kubofinanciero.com'),
            ('CAME', 10.50, 360, 1, 'https://www.came.org.mx'),
            ('Financiera Monte de Piedad', 11.00, 365, 1, 'https://www.montepiedad.com.mx'),
            ('Libertad Soluciones', 9.50, 365, 1, 'https://www.libertad.com.mx'),
            ('Unagra', 8.00, 365, 1, 'https://www.unagra.com.mx'),
            ('Ualá', 15.00, 1, 1, 'https://www.uala.mx'),
            ('Stori Cuenta', 15.00, 1, 1, 'https://www.storicard.com'),
            ('Hey Banco (Banregio)', 13.00, 7, 1, 'https://heybanco.com'),
            ('Cetesdirecto (Cetes)', 11.00, 28, 1, 'https://www.cetesdirecto.com'),
            ('BBVA México', 3.00, 365, 1, 'https://www.bbva.mx'),
            ('Citibanamex', 3.50, 365, 1, 'https://www.banamex.com'),
            ('Banorte', 4.00, 365, 1, 'https://www.banorte.com'),
            ('Santander', 3.50, 365, 1, 'https://www.santander.com.mx'),
            ('HSBC México', 3.00, 365, 1, 'https://www.hsbc.com.mx'),
            ('Scotiabank', 3.20, 365, 1, 'https://www.scotiabank.com.mx'),
            ('Banco Azteca', 5.00, 365, 1, 'https://www.bancoazteca.com.mx'),
            ('Bancoppel', 4.50, 365, 1, 'https://www.bancoppel.com')
        ]

        for nombre, tasa, plazo, nicap, url in lista_sofipos:
            existe = Sofipos.query.filter_by(nombre=nombre).first()
            if not existe:
                nueva_sofipo = Sofipos(
                    nombre=nombre, tasa_anual=tasa, plazo_dias=plazo, 
                    nicap=nicap, url_web=url
                )
                db.session.add(nueva_sofipo)

        db.session.commit()
        print("SOFIPOs cargadas.")
        print("¡Base de datos poblada con éxito!")

if __name__ == '__main__':
    seed_database()