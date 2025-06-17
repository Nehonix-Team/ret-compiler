import { InteractiveDocumentation, InteractiveOptions } from "../../../../types/extension.type";
import { SchemaInterface } from "../../../../types/SchemaValidator.type";

/**
 * Interactive documentation generator
 */
export class InteractiveDocumentationGenerator {
    constructor(
        private schema: SchemaInterface,
        private options: InteractiveOptions
    ) {}

    generate(): InteractiveDocumentation {
        return {
            html: this.generateInteractiveHTML(),
            css: this.generateCSS(),
            javascript: this.generateJavaScript()
        };
    }

    private generateInteractiveHTML(): string {
        return `
<div id="schema-playground">
    <h1>${this.options.title || 'Schema Playground'}</h1>
    <div class="playground-container">
        <div class="schema-panel">
            <h2>Schema</h2>
            <pre id="schema-display"></pre>
        </div>
        <div class="input-panel">
            <h2>Test Data</h2>
            <textarea id="test-input" placeholder="Enter JSON data to validate..."></textarea>
            <button id="validate-btn">Validate</button>
        </div>
        <div class="result-panel">
            <h2>Result</h2>
            <div id="validation-result"></div>
        </div>
    </div>
</div>`;
    }

    private generateCSS(): string {
        return `
.playground-container { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
.schema-panel, .input-panel, .result-panel { border: 1px solid #e1e5e9; border-radius: 6px; padding: 1rem; }
#test-input { width: 100%; height: 200px; font-family: monospace; }
#validate-btn { background: #0366d6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.valid { color: #28a745; }
.invalid { color: #dc3545; }`;
    }

    private generateJavaScript(): string {
        const schemaStr = JSON.stringify(this.schema, null, 2);
        return `
document.getElementById('schema-display').textContent = ${schemaStr};

// Real validation function
function validateData(schema, data) {
    const errors = [];

    for (const [fieldName, fieldType] of Object.entries(schema)) {
        const value = data[fieldName];
        const fieldErrors = validateField(fieldType, value, fieldName);
        if (fieldErrors.length > 0) {
            errors.push(...fieldErrors);
        }
    }

    return errors;
}

function validateField(fieldType, value, fieldName) {
    const errors = [];

    if (typeof fieldType === 'string') {
        const isOptional = fieldType.includes('?');
        const cleanType = fieldType.replace('?', '');

        // Handle null/undefined for optional fields
        if (isOptional && (value === null || value === undefined)) {
            return errors;
        }

        // Required field cannot be null/undefined
        if (!isOptional && (value === null || value === undefined)) {
            errors.push(fieldName + ': Field is required');
            return errors;
        }

        // Type-specific validation
        if (cleanType === 'email') {
            if (typeof value !== 'string' || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
                errors.push(fieldName + ': Invalid email format');
            }
        } else if (cleanType === 'url') {
            if (typeof value !== 'string') {
                errors.push(fieldName + ': URL must be a string');
            } else {
                try {
                    new URL(value);
                } catch {
                    errors.push(fieldName + ': Invalid URL format');
                }
            }
        } else if (cleanType === 'uuid') {
            if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
                errors.push(fieldName + ': Invalid UUID format');
            }
        } else if (cleanType === 'number') {
            if (typeof value !== 'number' || isNaN(value)) {
                errors.push(fieldName + ': Must be a valid number');
            }
        } else if (cleanType === 'positive') {
            if (typeof value !== 'number' || isNaN(value) || value <= 0) {
                errors.push(fieldName + ': Must be a positive number');
            }
        } else if (cleanType === 'int') {
            if (typeof value !== 'number' || isNaN(value) || !Number.isInteger(value)) {
                errors.push(fieldName + ': Must be an integer');
            }
        } else if (cleanType === 'boolean') {
            if (typeof value !== 'boolean') {
                errors.push(fieldName + ': Must be a boolean');
            }
        } else if (cleanType === 'string') {
            if (typeof value !== 'string') {
                errors.push(fieldName + ': Must be a string');
            }
        } else if (cleanType.startsWith('string(')) {
            if (typeof value !== 'string') {
                errors.push(fieldName + ': Must be a string');
            } else {
                const match = cleanType.match(/string\\((\\d+)?,?(\\d+)?\\)/);
                if (match) {
                    const minLength = match[1] ? parseInt(match[1]) : 0;
                    const maxLength = match[2] ? parseInt(match[2]) : Infinity;
                    if (value.length < minLength) {
                        errors.push(fieldName + ': String too short (min ' + minLength + ')');
                    }
                    if (value.length > maxLength) {
                        errors.push(fieldName + ': String too long (max ' + maxLength + ')');
                    }
                }
            }
        } else if (cleanType.includes('[]')) {
            if (!Array.isArray(value)) {
                errors.push(fieldName + ': Must be an array');
            }
        }
    }

    return errors;
}

document.getElementById('validate-btn').addEventListener('click', function() {
    const input = document.getElementById('test-input').value;
    const result = document.getElementById('validation-result');

    try {
        const data = JSON.parse(input);
        const schema = ${schemaStr};
        const validationErrors = validateData(schema, data);

        if (validationErrors.length === 0) {
            result.innerHTML = '<div class="valid">✓ Valid data</div>';
        } else {
            result.innerHTML = '<div class="invalid">✗ Validation errors:<br>' +
                validationErrors.map(err => '• ' + err).join('<br>') + '</div>';
        }
    } catch (e) {
        result.innerHTML = '<div class="invalid">✗ Invalid JSON: ' + e.message + '</div>';
    }
});`;
    }
}
