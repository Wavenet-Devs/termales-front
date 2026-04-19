import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/common/brand-mark";

export const Route = createFileRoute("/politica-de-datos")({
  component: PoliticaDeDatosPage,
});

function PoliticaDeDatosPage() {
  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandMark />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Aviso legal
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Política de Tratamiento de Datos Personales
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="space-y-6 rounded-3xl border bg-card p-6 shadow-soft sm:p-8 text-sm leading-relaxed text-foreground">

          <Section title="1. Responsable del Tratamiento">
            <p>
              <strong>Termales de Nuquí</strong>, ubicados en el municipio de Nuquí, departamento del Chocó, República de Colombia, actúa como responsable del tratamiento de los datos personales recolectados a través de esta plataforma, en cumplimiento de la <strong>Ley 1581 de 2012</strong> (Ley de Protección de Datos Personales), el <strong>Decreto 1377 de 2013</strong> y demás normas concordantes expedidas por la Superintendencia de Industria y Comercio (SIC).
            </p>
          </Section>

          <Section title="2. Datos Personales Recolectados">
            <p>Al realizar el prerregistro o visita, recolectamos los siguientes datos:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
              <li>Nombres y apellidos completos</li>
              <li>Tipo y número de documento de identidad</li>
              <li>País, departamento y ciudad de procedencia</li>
              <li>Número de teléfono de contacto</li>
              <li>Correo electrónico (opcional)</li>
              <li>Fecha y tipo de visita</li>
              <li>Número de acompañantes</li>
              <li>Información de pago (método y monto)</li>
            </ul>
          </Section>

          <Section title="3. Finalidades del Tratamiento">
            <p>Sus datos personales serán utilizados exclusivamente para las siguientes finalidades:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
              <li>Gestión y control de acceso e ingreso a las instalaciones de los Termales de Nuquí.</li>
              <li>Prerregistro, confirmación y seguimiento de visitas.</li>
              <li>Generación de reportes estadísticos de visitantes con fines de administración y planeación turística.</li>
              <li>Cumplimiento de obligaciones legales ante las autoridades competentes (DIAN, Registro Nacional de Turismo, entidades de salud y seguridad).</li>
              <li>Envío de comunicaciones relacionadas con su visita, únicamente si suministró su correo electrónico.</li>
              <li>Atención de solicitudes, quejas y reclamos (PQR).</li>
            </ul>
          </Section>

          <Section title="4. Base Legal del Tratamiento">
            <p>
              El tratamiento de sus datos se fundamenta en el <strong>consentimiento libre, previo, expreso e informado</strong> que usted otorga al marcar la casilla de autorización al momento del registro, de conformidad con el artículo 9 de la Ley 1581 de 2012.
            </p>
            <p className="mt-2">
              Para datos de menores de edad (tarjeta de identidad), el consentimiento debe ser otorgado por su representante legal o padre/madre de familia, quien asume la responsabilidad de la autorización.
            </p>
          </Section>

          <Section title="5. Derechos del Titular">
            <p>
              Como titular de sus datos personales, usted tiene los siguientes derechos consagrados en el artículo 8 de la Ley 1581 de 2012:
            </p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
              <li><strong>Conocer</strong> los datos personales que tenemos sobre usted.</li>
              <li><strong>Actualizar y rectificar</strong> sus datos cuando sean inexactos o estén desactualizados.</li>
              <li><strong>Solicitar prueba</strong> de la autorización otorgada.</li>
              <li><strong>Revocar la autorización</strong> y/o solicitar la supresión de sus datos, siempre que no exista un deber legal o contractual que impida hacerlo.</li>
              <li><strong>Acceder gratuitamente</strong> a sus datos personales que hayan sido objeto de tratamiento.</li>
              <li><strong>Presentar quejas</strong> ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la normativa de protección de datos.</li>
            </ul>
          </Section>

          <Section title="6. Ejercicio de Derechos (Procedimiento PQR)">
            <p>
              Para ejercer sus derechos, puede contactarnos a través de los canales habilitados en las instalaciones de los Termales de Nuquí. Daremos respuesta a su solicitud dentro de los plazos establecidos por ley: <strong>10 días hábiles</strong> para consultas y <strong>15 días hábiles</strong> para reclamos, prorrogables según lo dispuesto en la Ley 1581 de 2012.
            </p>
          </Section>

          <Section title="7. Transferencia y Transmisión de Datos">
            <p>
              Sus datos personales <strong>no serán vendidos, cedidos ni transferidos</strong> a terceros con fines comerciales. Solo podrán ser compartidos con:
            </p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
              <li>Autoridades gubernamentales o judiciales cuando sea exigido por ley.</li>
              <li>Proveedores tecnológicos que prestan servicios de infraestructura (alojamiento de datos), bajo estrictos acuerdos de confidencialidad y con las garantías adecuadas de protección.</li>
            </ul>
          </Section>

          <Section title="8. Conservación de los Datos">
            <p>
              Sus datos personales serán conservados durante el tiempo necesario para cumplir con las finalidades descritas y con las obligaciones legales aplicables. Una vez cumplidas dichas finalidades, procederemos a la supresión segura de la información, salvo que exista una obligación legal de conservación.
            </p>
          </Section>

          <Section title="9. Seguridad de la Información">
            <p>
              Adoptamos las medidas técnicas, administrativas y físicas necesarias para proteger sus datos contra acceso no autorizado, pérdida, alteración o divulgación, en cumplimiento del principio de seguridad establecido en la Ley 1581 de 2012.
            </p>
          </Section>

          <Section title="10. Datos de Turistas Extranjeros">
            <p>
              Para visitantes extranjeros, el tratamiento de datos se realiza en territorio colombiano y bajo la legislación colombiana. Al registrarse, usted reconoce y acepta que sus datos serán tratados conforme a lo establecido en esta política y en la normativa colombiana vigente.
            </p>
          </Section>

          <Section title="11. Modificaciones a esta Política">
            <p>
              Nos reservamos el derecho de actualizar esta política para adaptarla a cambios legislativos o de nuestros procesos internos. Cualquier modificación sustancial será comunicada a través de los canales disponibles con antelación razonable.
            </p>
          </Section>

          <div className="rounded-2xl border bg-primary/5 p-4 mt-4">
            <p className="text-xs text-muted-foreground">
              Esta política fue elaborada en cumplimiento de la <strong>Ley 1581 de 2012</strong>, el <strong>Decreto 1377 de 2013</strong> y las instrucciones de la Superintendencia de Industria y Comercio de Colombia. Para mayor información sobre sus derechos, puede consultar el sitio web de la SIC:{" "}
              <a
                href="https://www.sic.gov.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                www.sic.gov.co
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 font-semibold text-foreground">{title}</h2>
      <div className="text-muted-foreground space-y-2">{children}</div>
    </div>
  );
}
