# Asegúrate de tener instalada la librería mipsy:
# pip install mipsy

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

class MipsRegisters:
    def __init__(self):
        # Initialize registers
        self.registers = {
            'a0': 0,  # Para syscalls
            'v0': 0,  # Para syscalls y resultado
            's0': 0,  # X1
            's1': 0,  # Y1
            's2': 0,  # X2
            's3': 0,  # Y2
            's4': 0,  # X
            't0': 0,  # temp for X - X1
            't1': 0,  # temp for X2 - X1
            't2': 0,  # temp for division result
            't3': 0,  # temp for Y2 - Y1
            't4': 0,  # temp for multiplication
        }
        self.memory = {
            'data': {
                'msg1': "Calculando interpolación lineal...",
                'msg2': "Fórmula: Y = Y1 + ((X - X1) * (Y2 - Y1)) / (X2 - X1)",
                'x1': 0,
                'y1': 0,
                'x2': 0,
                'y2': 0,
                'x': 0
            }
        }
        self.steps = []

    def execute_mips_logic(self, x1, y1, x2, y2, x):
        # Store values in memory
        self.memory['data']['x1'] = x1
        self.memory['data']['y1'] = y1
        self.memory['data']['x2'] = x2
        self.memory['data']['y2'] = y2
        self.memory['data']['x'] = x
        
        self.steps.append({
            'instruction': 'Inicialización de memoria',
            'description': f'Almacenando valores en .data: X1={x1}, Y1={y1}, X2={x2}, Y2={y2}, X={x}',
            'registers': self.registers.copy(),
            'memory': self.memory.copy(),
            'formula': 'Y = Y1 + ((X - X1) * (Y2 - Y1)) / (X2 - X1)',
            'current_calculation': 'Iniciando cálculos...'
        })

        # Load values from memory to registers
        self.registers['s0'] = self.memory['data']['x1']  # X1
        self.registers['s1'] = self.memory['data']['y1']  # Y1
        self.registers['s2'] = self.memory['data']['x2']  # X2
        self.registers['s3'] = self.memory['data']['y2']  # Y2
        self.registers['s4'] = self.memory['data']['x']   # X
        
        self.steps.append({
            'instruction': 'lw $s0-$s4, memoria',
            'description': 'Cargando valores desde memoria a registros',
            'registers': self.registers.copy(),
            'memory': self.memory.copy(),
            'formula': 'Y = Y1 + ((X - X1) * (Y2 - Y1)) / (X2 - X1)',
            'current_calculation': f'Valores cargados: X1={x1}, Y1={y1}, X2={x2}, Y2={y2}, X={x}'
        })

        # Cálculos con valores actuales
        self.registers['t0'] = self.registers['s4'] - self.registers['s0']  # X - X1
        current_value = f"(X - X1) = {x} - {x1} = {self.registers['t0']}"
        self.steps.append({
            'instruction': 'sub $t0, $s4, $s0',
            'description': 'Calculando X - X1',
            'registers': self.registers.copy(),
            'memory': self.memory.copy(),
            'formula': 'Y = Y1 + ((X - X1) * (Y2 - Y1)) / (X2 - X1)',
            'current_calculation': current_value
        })
        
        self.registers['t1'] = self.registers['s2'] - self.registers['s0']  # X2 - X1
        current_value += f"\n(X2 - X1) = {x2} - {x1} = {self.registers['t1']}"
        self.steps.append({
            'instruction': 'sub $t1, $s2, $s0',
            'description': 'Calculando X2 - X1',
            'registers': self.registers.copy(),
            'memory': self.memory.copy(),
            'formula': 'Y = Y1 + ((X - X1) * (Y2 - Y1)) / (X2 - X1)',
            'current_calculation': current_value
        })
        
        if self.registers['t1'] != 0:
            self.registers['t2'] = self.registers['t0'] // self.registers['t1']
            current_value += f"\n(X - X1)/(X2 - X1) = {self.registers['t0']}/{self.registers['t1']} = {self.registers['t2']}"
        self.steps.append({
            'instruction': 'div $t0, $t1\nmflo $t2',
            'description': 'División y movimiento del resultado',
            'registers': self.registers.copy(),
            'memory': self.memory.copy(),
            'formula': 'Y = Y1 + ((X - X1) * (Y2 - Y1)) / (X2 - X1)',
            'current_calculation': current_value
        })
        
        self.registers['t3'] = self.registers['s3'] - self.registers['s1']  # Y2 - Y1
        current_value += f"\n(Y2 - Y1) = {y2} - {y1} = {self.registers['t3']}"
        self.steps.append({
            'instruction': 'sub $t3, $s3, $s1',
            'description': 'Calculando Y2 - Y1',
            'registers': self.registers.copy(),
            'memory': self.memory.copy(),
            'formula': 'Y = Y1 + ((X - X1) * (Y2 - Y1)) / (X2 - X1)',
            'current_calculation': current_value
        })
        
        self.registers['t4'] = self.registers['t2'] * self.registers['t3']  # quotient * (Y2 - Y1)
        current_value += f"\nquotient * (Y2 - Y1) = {self.registers['t2']} * {self.registers['t3']} = {self.registers['t4']}"
        self.steps.append({
            'instruction': 'mul $t4, $t2, $t3',
            'description': 'Multiplicación',
            'registers': self.registers.copy(),
            'memory': self.memory.copy(),
            'formula': 'Y = Y1 + ((X - X1) * (Y2 - Y1)) / (X2 - X1)',
            'current_calculation': current_value
        })
        
        self.registers['v0'] = self.registers['t4'] + self.registers['s1']  # result + Y1
        current_value += f"\nY = Y1 + resultado = {y1} + {self.registers['t4']} = {self.registers['v0']}"
        self.steps.append({
            'instruction': 'add $v0, $t4, $s1',
            'description': 'Suma final para obtener Y',
            'registers': self.registers.copy(),
            'memory': self.memory.copy(),
            'formula': 'Y = Y1 + ((X - X1) * (Y2 - Y1)) / (X2 - X1)',
            'current_calculation': current_value
        })

        return self.registers['v0'], self.steps

@app.route('/interpolate', methods=['POST'])
def interpolate():
    try:
        # Get data from the request
        data = request.get_json()
        x1 = int(float(data['X1']))
        y1 = int(float(data['Y1']))
        x2 = int(float(data['X2']))
        y2 = int(float(data['Y2']))
        x = int(float(data['X']))

        # Validate inputs
        if x2 == x1:
            return jsonify({'error': 'X2 cannot be equal to X1'}), 400
        if x <= x1 or x >= x2:
            return jsonify({'error': 'X must be between X1 and X2'}), 400

        # Create MIPS registers and execute logic
        mips = MipsRegisters()
        result, steps = mips.execute_mips_logic(x1, y1, x2, y2, x)

        return jsonify({
            'result': result,
            'steps': steps
        })

    except KeyError:
        return jsonify({'error': 'Missing required parameters'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid number format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
