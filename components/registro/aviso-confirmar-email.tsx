import { MailCheck } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

/** Después de registrarse, si el proyecto pide confirmar el email: "Revisá tu email". */
export function AvisoConfirmarEmail({ email: enviadoA }: { email: string }) {
  return (
    <Card className="mx-auto w-full max-w-lg rounded-[25px] text-center">
      <CardContent className="grid justify-items-center gap-4 py-4" role="status">
        <div className="grid size-12 place-items-center rounded-full bg-primary/15 text-primary">
          <MailCheck className="size-6" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl">Revisá tu email</CardTitle>
        <p className="text-muted-foreground">
          Te mandamos un link a <strong className="text-foreground">{enviadoA}</strong> para activar
          tu cuenta. Abrilo y entrás directo a tu plan: tu perfil y tus eventos ya quedaron
          guardados.
        </p>
        <p className="text-sm text-muted-foreground">
          ¿No llegó? Revisá la carpeta de spam. El link sirve una sola vez.
        </p>
      </CardContent>
    </Card>
  );
}
