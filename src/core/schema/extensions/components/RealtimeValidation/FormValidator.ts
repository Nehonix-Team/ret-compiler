import { LiveValidator } from "./LiveValidator";

/**
 * Form validator with DOM integration
 */
export class FormValidator extends LiveValidator {
    private boundFields: Record<string, HTMLElement> = {};
    private autoValidationEnabled = false;
    private submitListeners: Array<(isValid: boolean, data: any, errors: Record<string, string[]>) => void> = [];

    /**
     * Bind a form field for automatic validation (Node.js compatible)
     */
    bindField(fieldName: string, element: any): void {
        this.boundFields[fieldName] = element;

        if (this.autoValidationEnabled) {
            this.setupFieldListeners(fieldName, element);
        }
    }

    /**
     * Enable automatic validation on input changes (Node.js compatible)
     */
    enableAutoValidation(): void {
        this.autoValidationEnabled = true;

        Object.entries(this.boundFields).forEach(([fieldName, element]) => {
            this.setupFieldListeners(fieldName, element);
        });
    }

    /**
     * Listen for form submission
     */
    onSubmit(listener: (isValid: boolean, data: any, errors: Record<string, string[]>) => void): void {
        this.submitListeners.push(listener);
    }

    /**
     * Trigger form validation (typically on submit)
     */
    submit(): void {
        const result = this.validateAll();
        this.submitListeners.forEach(listener =>
            listener(result.isValid, result.data, result.errors)
        );
    } 

    private setupFieldListeners(fieldName: string, element: any): void {
        // Check if we're in a browser environment
        if (typeof globalThis !== 'undefined' && (globalThis as any).window && element && typeof element.addEventListener === 'function') {
            // Browser environment - set up real DOM event listeners
            const handleInput = (event: any) => {
                const target = event.target;
                const value = target.value !== undefined ? target.value : target.textContent;
                this.validateField(fieldName, value);
            };

            const handleChange = (event: any) => {
                const target = event.target;
                const value = target.value !== undefined ? target.value : target.textContent;
                this.validateField(fieldName, value);
            };

            // Add event listeners for real-time validation
            element.addEventListener('input', handleInput);
            element.addEventListener('change', handleChange);
            element.addEventListener('blur', handleChange);

            // Store cleanup function for later removal
            if (!element._fortifyCleanup) {
                element._fortifyCleanup = () => {
                    element.removeEventListener('input', handleInput);
                    element.removeEventListener('change', handleChange);
                    element.removeEventListener('blur', handleChange);
                };
            }
        } else {
            // Node.js environment - provide programmatic interface
            if (!element._fortifyValidate) {
                element._fortifyValidate = (value: any) => {
                    return this.validateField(fieldName, value);
                };
            }
        }
    }
}
