import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AppLoadingScreen } from "@/components/common/AppLoadingScreen";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { routes } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { getReadableAuthError } from "@/lib/firebase";
import { passwordResetSchema } from "@/utils/validators";

type PasswordResetForm = {
  email: string;
};

export function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [loadingScreenVisible, setLoadingScreenVisible] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PasswordResetForm>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: PasswordResetForm) {
    setLoadingScreenVisible(true);
    try {
      await resetPassword(values.email);
      toast.success("Password reset link sent. Please check your email.");
    } catch (error) {
      toast.error(getReadableAuthError(error));
    } finally {
      setLoadingScreenVisible(false);
    }
  }

  return (
    <div className="relative z-10 grid min-h-screen place-items-center px-8">
      {loadingScreenVisible ? <AppLoadingScreen exiting={false} /> : null}
      <Card className="glass-panel w-full max-w-md">
        <CardContent className="space-y-5 p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-focus">Recovery</p>
            <h1 className="mt-3 text-3xl font-semibold">Reset Faculty Access</h1>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input placeholder="Institutional email" type="email" {...register("email")} />
              {errors.email?.message ? <p className="mt-2 text-sm text-muted">{errors.email.message}</p> : null}
            </div>
            <Button className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </form>
          <Link to={routes.login} className="block text-center text-sm text-muted hover:text-focus">Back to login</Link>
        </CardContent>
      </Card>
    </div>
  );
}
