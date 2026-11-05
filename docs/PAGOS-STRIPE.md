# Preparación de pagos — Atlas

Estado: diseño técnico preparado; **no se aceptan pagos todavía**.

## Decisión técnica propuesta

Usar **Stripe Checkout alojado** para la primera versión de pagos de Atlas. Es una opción adecuada para una tienda pequeña porque Stripe sirve la página de pago, gestiona la captura de tarjeta y los pasos de autenticación reforzada, y evita que Atlas procese directamente datos de tarjeta.

La integración se mantendrá detrás de una interfaz de proveedor para no acoplar el carrito a Stripe. Si en el futuro se decide usar otro proveedor, se podrá sustituir el adaptador del servidor.

## Arquitectura prevista

1. El navegador envía al backend únicamente los identificadores de producto, talla y cantidad.
2. El backend consulta su catálogo/precios autorizados y valida disponibilidad, cantidades y límites. Nunca confía en precios, subtotales ni nombres enviados por `localStorage`.
3. El backend crea una orden pendiente y una Checkout Session de Stripe en EUR.
4. El navegador recibe únicamente la URL de Checkout y redirige al cliente a Stripe.
5. Stripe notifica el resultado al endpoint de webhook del backend.
6. El backend verifica la firma del webhook con el cuerpo HTTP original, procesa los eventos de forma idempotente y actualiza la orden y el inventario.
7. La página de retorno muestra el estado de la compra, pero **no** confirma por sí sola que se haya pagado.

## Endpoints previstos

- `POST /api/checkout`: validar carrito, crear orden pendiente y Checkout Session.
- `POST /api/webhooks/stripe`: verificar firma y procesar eventos.
- `GET /api/orders/:publicId`: consultar un estado de pedido sin exponer datos personales.

Los nombres son una propuesta; se ajustarán al proveedor de alojamiento elegido.

## Eventos de Stripe

Como mínimo:
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`

La entrega, confirmación del pedido y reducción definitiva del stock se activarán desde eventos verificados del servidor. Se guardará el ID del evento de Stripe para evitar procesarlo dos veces. También habrá que definir el flujo de reembolso y conciliación.

## Configuración y secretos

Variables de entorno previstas en el backend:
- `STRIPE_SECRET_KEY`: clave secreta, solo servidor.
- `STRIPE_WEBHOOK_SECRET`: secreto de firma del endpoint de webhook.
- `PUBLIC_SITE_URL`: origen HTTPS canónico para URLs de retorno.
- `PAYMENTS_ENABLED`: interruptor de activación, desactivado por defecto.

Las claves de prueba y los secretos reales **nunca** se guardarán en Git, HTML, JavaScript público, documentación compartida ni logs. El navegador no recibirá la clave secreta. La configuración de prueba y producción tendrá claves y webhooks separados.

## Alojamiento: decisión pendiente

La web actual es estática. GitHub Pages por sí solo no puede guardar de forma segura una clave secreta ni ejecutar el endpoint de Checkout y los webhooks.

Antes de implementar el backend hay que confirmar dónde se alojará:
- Cloudflare Pages + Pages Functions/Workers, o
- Netlify + Functions, o
- un backend gestionado independiente.

Se recomienda mantener el frontend estático y añadir funciones serverless del mismo origen si el alojamiento elegido lo permite. Así el carrito podrá llamar a `/api/checkout` sin exponer secretos.

## Requisitos antes de activar pagos reales

- Cuenta de Stripe creada y verificada por el titular.
- Datos fiscales, actividad, titularidad de la tienda y cuenta bancaria confirmados.
- Precios, IVA aplicable, países de venta y reglas de envío definidos.
- Política de privacidad, cookies y condiciones de venta actualizadas con los proveedores y flujos reales; revisión profesional de los textos legales.
- Catálogo y stock mantenidos en el servidor, no solo en HTML.
- Emails de confirmación y atención posventa operativos.
- Webhook de producción configurado y firma verificada.
- Pruebas de compra, cancelación, pago fallido, reintentos, eventos duplicados, devoluciones y stock concurrente.
- Revisión de seguridad y prueba completa en modo test antes de habilitar producción.

## Estado del botón de compra

El botón seguirá desactivado mientras `PAYMENTS_ENABLED` no esté activado en el backend y el endpoint no supere las pruebas. No se debe sustituir `checkoutUrl` por un enlace fijo ni conectar el navegador directamente a Stripe con una clave secreta.
