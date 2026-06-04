/**
 * Decorator pattern: logs start, duration, and errors of any service/facade method.
 * Usage: @LogOperation('registrar-compra')
 */
export function LogOperation(operationName: string): MethodDecorator {
  return (
    _target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const start = Date.now();
      const label = `[${String(propertyKey)}:${operationName}]`;
      console.log(`${label} START`);

      try {
        const result = await originalMethod.apply(this, args);
        console.log(`${label} OK — ${Date.now() - start}ms`);
        return result;
      } catch (error) {
        console.error(`${label} ERROR — ${error.message}`);
        throw error;
      }
    };

    return descriptor;
  };
}
