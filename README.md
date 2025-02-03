# Simulador de Interpolación Lineal MIPS

Este proyecto es un simulador que muestra cómo MIPS realiza cálculos de interpolación lineal, visualizando el flujo de datos entre memoria y registros.

## Requisitos Previos

- Python 3.8 o superior
- Node.js 14 o superior
- npm (viene con Node.js)

## Instalación y Ejecución

### Backend (Python/Flask)

1. Abre una terminal y navega hasta la carpeta del proyecto
2. Crea un entorno virtual (opcional pero recomendado):
   ```bash
   python -m venv venv
   ```

3. Activa el entorno virtual:
   - En Windows:
     ```bash
     venv\Scripts\activate
     ```
   - En macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

5. Inicia el servidor Flask:
   ```bash
   python main.py
   ```
   El servidor se iniciará en `http://localhost:5000`

### Frontend (React)

1. Abre una nueva terminal y navega hasta la carpeta `frontend`
   ```bash
   cd frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia la aplicación React:
   ```bash
   npm start
   ```
   La aplicación se abrirá automáticamente en `http://localhost:3000`

## Uso

1. La aplicación tiene dos puntos (Point 1 y Point 2) que definen una línea
2. Puedes ajustar los valores usando los sliders o introduciendo números directamente
3. El valor X para interpolar debe estar entre X1 y X2
4. Al presionar "Calculate Y", verás:
   - El resultado de la interpolación
   - Un gráfico de la línea
   - La simulación MIPS paso a paso
   - El flujo de datos entre memoria y registros

## Estructura del Proyecto 